import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PHOTO_FILTERS } from '../lib/constants';
import type { Photo } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';

/* ─── Photo & Video Gallery ─── */
function PhotoGallery({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No memories yet. Be the first to add one!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {photos.map((photo, i) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.8, rotate: -3 + Math.random() * 6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="polaroid"
          style={{
            transform: `rotate(${-3 + Math.random() * 6}deg)`,
          }}
          whileHover={{
            scale: 1.05,
            rotate: 0,
            boxShadow: '0 12px 40px rgba(93, 64, 55, 0.15)',
            zIndex: 10,
          }}
        >
          {photo.type === 'video' ? (
            <video
              src={photo.photo_url}
              controls
              playsInline
              className="w-full aspect-square object-cover"
            />
          ) : (
            <img
              src={photo.photo_url}
              alt="Memory"
              className="w-full aspect-square object-cover"
              loading="lazy"
            />
          )}
          <span className="polaroid-caption text-[10px] text-center block pt-1.5" style={{ color: 'var(--color-text-muted)' }}>
            {photo.guest_name || 'Guest'}
            {photo.type === 'video' ? ' 🎥' : ''}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Filter Preview (Only for photos) ─── */
function FilterPreview({ imageSrc, onUpload, onBack }: {
  imageSrc: string;
  onUpload: (filteredImage: string, filterId: string) => void;
  onBack: () => void;
}) {
  const [selectedFilter, setSelectedFilter] = useState('none');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      applyFilter(selectedFilter);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const applyFilter = useCallback((filterId: string) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale down for mobile performance and to stay under Vercel's payload limit (about 100-200kb max)
    const maxSize = 800;
    const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const filter = PHOTO_FILTERS.find(f => f.id === filterId);
    ctx.filter = filter?.css || 'none';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // VHS effect: add scan lines
    if (filterId === 'vhs') {
      ctx.filter = 'none';
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(0, y, canvas.width, 1);
      }
    }

    // Polaroid effect: add white border on canvas
    if (filterId === 'polaroid') {
      ctx.filter = 'none';
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      const inset = 8;
      ctx.strokeRect(inset, inset, canvas.width - inset * 2, canvas.height - inset * 2);
    }

    setSelectedFilter(filterId);
  }, []);

  const handleUpload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onUpload(dataUrl, selectedFilter);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Preview */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--color-cream)' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
        />
      </div>

      {/* Filter strip */}
      <div className="mb-6 -mx-2 px-2 overflow-x-auto">
        <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
          {PHOTO_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => applyFilter(filter.id)}
              className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                background: selectedFilter === filter.id ? 'var(--color-brown)' : 'var(--color-cream)',
                color: selectedFilter === filter.id ? 'var(--color-cream)' : 'var(--color-text)',
                border: `1px solid ${selectedFilter === filter.id ? 'var(--color-brown)' : 'rgba(93, 64, 55, 0.08)'}`,
              }}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer"
          style={{
            background: 'var(--color-cream)',
            color: 'var(--color-text)',
            border: '1px solid rgba(93, 64, 55, 0.08)',
          }}
        >
          ← Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpload}
          className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer"
          style={{
            background: 'var(--color-brown)',
            color: 'var(--color-cream)',
            boxShadow: '0 4px 16px rgba(93, 64, 55, 0.15)',
          }}
        >
          Upload 📸
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Camera Page ─── */
export default function CameraPage() {
  const { guestName, isRegistered, setShowRegistration } = useGuest();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const photoCameraInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const videoCameraInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setPhotos(data as Photo[]);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }

    // Limit to 4.5MB for Vercel Serverless Function payload limit
    const maxSize = 4.5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage('Videos must be under 4.5MB to be saved (about 10-15s). Try recording a shorter clip!');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const videoDataUrl = event.target?.result as string;
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: `${guestName || 'guest'}_${Date.now()}_video.mp4`,
            fileType: file.type || 'video/mp4',
            fileData: videoDataUrl,
            guestName: guestName,
          }),
        });

        const uploadResult = await response.json();
        if (uploadResult.error) throw new Error(uploadResult.error);

        if (isSupabaseConfigured()) {
          await supabase.from('photos').insert([{
            guest_name: guestName,
            photo_url: uploadResult.url,
            drive_file_id: uploadResult.fileId,
            filter_used: null,
            type: 'video',
          }]);
        } else {
          // Local fallback
          setPhotos(prev => [{
            id: crypto.randomUUID(),
            guest_name: guestName || 'Anonymous',
            photo_url: videoDataUrl,
            drive_file_id: null,
            filter_used: null,
            type: 'video',
            created_at: new Date().toISOString(),
          }, ...prev]);
        }

        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        fetchPhotos();
      } catch (err: any) {
        console.error('Video Upload Error:', err);
        setErrorMessage(err.message || 'Failed to upload video. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async (filteredImage: string, filterId: string) => {
    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      // Upload via Vercel Google Drive upload API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: `${guestName || 'guest'}_${Date.now()}_photo.jpg`,
          fileType: 'image/jpeg',
          fileData: filteredImage,
          guestName: guestName,
        }),
      });

      const uploadResult = await response.json();
      if (uploadResult.error) throw new Error(uploadResult.error);

      if (isSupabaseConfigured()) {
        // Save metadata in Supabase
        await supabase.from('photos').insert([{
          guest_name: guestName,
          photo_url: uploadResult.url,
          drive_file_id: uploadResult.fileId,
          filter_used: filterId,
          type: 'photo',
        }]);
      } else {
        // Local mode — just add to state
        setPhotos(prev => [{
          id: crypto.randomUUID(),
          guest_name: guestName || 'Anonymous',
          photo_url: filteredImage,
          drive_file_id: null,
          filter_used: filterId,
          type: 'photo',
          created_at: new Date().toISOString(),
        }, ...prev]);
      }

      setCapturedImage(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      fetchPhotos();
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="px-6 pt-16 pb-8 max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1
            className="text-3xl md:text-4xl mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
          >
            Add To The Album
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Take photos and videos, choose retro filters, and build our shared memory archive.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {capturedImage ? (
            <FilterPreview
              key="preview"
              imageSrc={capturedImage}
              onUpload={handlePhotoUpload}
              onBack={() => setCapturedImage(null)}
            />
          ) : (
            <motion.div
              key="capture"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Errors or Upload success */}
              <AnimatePresence>
                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-3 rounded-xl text-center text-sm"
                    style={{ background: 'rgba(107, 143, 113, 0.1)', color: 'var(--color-success)' }}
                  >
                    ✨ Memory captured!
                  </motion.div>
                )}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-3 rounded-xl text-center text-xs"
                    style={{ background: 'rgba(192, 57, 43, 0.08)', color: 'rgba(192, 57, 43, 0.9)' }}
                  >
                    ⚠️ {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Capture buttons grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isRegistered) { setShowRegistration(true); return; }
                    photoCameraInputRef.current?.click();
                  }}
                  className="py-6 rounded-2xl flex flex-col items-center gap-1.5 cursor-pointer"
                  style={{
                    background: 'var(--color-brown)',
                    color: 'var(--color-cream)',
                    boxShadow: '0 4px 16px rgba(93, 64, 55, 0.12)',
                  }}
                >
                  <span className="text-2xl">📸</span>
                  <span className="text-xs font-semibold">Take Photo</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isRegistered) { setShowRegistration(true); return; }
                    videoCameraInputRef.current?.click();
                  }}
                  className="py-6 rounded-2xl flex flex-col items-center gap-1.5 cursor-pointer"
                  style={{
                    background: 'var(--color-brown)',
                    color: 'var(--color-cream)',
                    boxShadow: '0 4px 16px rgba(93, 64, 55, 0.12)',
                  }}
                >
                  <span className="text-2xl">🎥</span>
                  <span className="text-xs font-semibold">Record Video</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isRegistered) { setShowRegistration(true); return; }
                    photoFileInputRef.current?.click();
                  }}
                  className="py-6 rounded-2xl flex flex-col items-center gap-1.5 cursor-pointer"
                  style={{
                    background: 'var(--color-cream)',
                    color: 'var(--color-brown)',
                    border: '1px solid rgba(93, 64, 55, 0.08)',
                  }}
                >
                  <span className="text-2xl">🖼️</span>
                  <span className="text-xs font-semibold">Upload Photo</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isRegistered) { setShowRegistration(true); return; }
                    videoFileInputRef.current?.click();
                  }}
                  className="py-6 rounded-2xl flex flex-col items-center gap-1.5 cursor-pointer"
                  style={{
                    background: 'var(--color-cream)',
                    color: 'var(--color-brown)',
                    border: '1px solid rgba(93, 64, 55, 0.08)',
                  }}
                >
                  <span className="text-2xl">🎞️</span>
                  <span className="text-xs font-semibold">Upload Video</span>
                </motion.button>
              </div>

              {/* Hidden Inputs */}
              <input
                ref={photoCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <input
                ref={photoFileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <input
                ref={videoCameraInputRef}
                type="file"
                accept="video/*"
                capture="environment"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />

              {/* Gallery */}
              <div>
                <h3
                  className="text-lg mb-4"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
                >
                  Tonight's Memories
                </h3>
                <PhotoGallery photos={photos} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(250, 247, 242, 0.9)' }}>
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-8 h-8 rounded-full border-2 border-t-transparent mx-auto mb-3"
                style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
              />
              <p className="text-sm font-medium animate-pulse" style={{ color: 'var(--color-brown)' }}>Uploading memory...</p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
