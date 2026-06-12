import { google } from 'googleapis';
import { Readable } from 'stream';
import { createClient } from '@supabase/supabase-js';

const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseStorageBucket = process.env.SUPABASE_STORAGE_BUCKET || 'photos';

// Initialize Google Drive API
const getDriveClient = () => {
  if (!privateKey || !clientEmail) {
    throw new Error('Google service account credentials are not configured');
  }
  const auth = new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey,
    ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
  );
  return google.drive({ version: 'v3', auth });
};

const getSupabaseAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, fileType, fileData, guestName } = req.body;

    if (!fileName || !fileType || !fileData) {
      return res.status(400).json({ error: 'Missing required parameters: fileName, fileType, fileData' });
    }

    // Extract base64 content
    const base64Content = fileData.split(';base64,').pop();
    if (!base64Content) {
      return res.status(400).json({ error: 'Invalid fileData format' });
    }

    const buffer = Buffer.from(base64Content, 'base64');

    // Check payload size (Vercel serverless limit is ~4.5MB, so checking request body size is good)
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(413).json({ error: 'File size too large. Limit is 5MB.' });
    }

    const drive = getDriveClient();
    const isImage = fileType.startsWith('image/');
    const supabaseAdmin = isImage ? getSupabaseAdminClient() : null;

    // Create stream from buffer
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);

    // Prepare metadata
    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : [],
      description: `Uploaded by ${guestName || 'Anonymous'} via Birthday Memory Capsule`,
    };

    const media = {
      mimeType: fileType,
      body: bufferStream,
    };

    // Upload to Google Drive
    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      supportsAllDrives: Boolean(folderId),
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = driveResponse.data.id;
    if (!fileId) {
      throw new Error('Failed to retrieve file ID from Google Drive response');
    }

    // Update permissions to make it publicly readable so we can render it in the web app
    await drive.permissions.create({
      fileId,
      supportsAllDrives: Boolean(folderId),
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    let storageUrl = null;
    if (supabaseAdmin && supabaseStorageBucket) {
      const storagePath = `${guestName || 'anonymous'}/${Date.now()}-${fileName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from(supabaseStorageBucket)
        .upload(storagePath, buffer, {
          contentType: fileType,
          upsert: true,
        });

      if (uploadError) {
        console.warn('Supabase storage upload failed:', uploadError.message);
      } else {
        const { data } = supabaseAdmin.storage.from(supabaseStorageBucket).getPublicUrl(storagePath);
        storageUrl = data.publicUrl;
      }
    }

    // Construct direct rendering link
    const directUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;

    return res.status(200).json({
      success: true,
      fileId,
      url: storageUrl || directUrl,
      driveUrl: directUrl,
      storageUrl,
      webViewLink: driveResponse.data.webViewLink,
      webContentLink: driveResponse.data.webContentLink,
    });
  } catch (error: any) {
    console.error('API Upload Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
