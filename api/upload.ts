import { createClient } from '@supabase/supabase-js';

const normalizeEnvValue = (value?: string) => value?.trim().replace(/^"(.*)"$/, '$1');
const supabaseUrl = normalizeEnvValue(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseStorageBucket = process.env.SUPABASE_STORAGE_BUCKET || 'photos';

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

    const supabaseAdmin = getSupabaseAdminClient();
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase storage is not configured' });
    }

    const storagePath = `${guestName || 'anonymous'}/${Date.now()}-${fileName}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(supabaseStorageBucket)
      .upload(storagePath, buffer, {
        contentType: fileType,
        upsert: true,
      });

    if (uploadError) {
      return res.status(500).json({ error: `Supabase storage upload failed: ${uploadError.message}` });
    }

    const { data } = supabaseAdmin.storage.from(supabaseStorageBucket).getPublicUrl(storagePath);
    const storageUrl = data.publicUrl;

    return res.status(200).json({
      success: true,
      fileId: null,
      url: storageUrl,
      storageUrl,
    });
  } catch (error: any) {
    console.error('API Upload Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
