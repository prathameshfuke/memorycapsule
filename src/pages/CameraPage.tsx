import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { isCapsuleUnlocked } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PHOTO_FILTERS } from '../lib/constants';
import type { Photo } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';

/* ─── Filter Preview ─── */
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

    const maxSize = 800;
    const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const filter = PHOTO_FILTERS.find(f => f.id === filterId);
    ctx.filter = filter?.css || 'none';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (filterId === 'vhs') {
      ctx.filter = 'none';
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(0, y, canvas.width, 1);
      }
    }

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
      className="space-y-6"
    >
      <div className="rounded-[4px] border border-[var(--color-dust)] overflow-hidden bg-[var(--color-cream)]">
        <canvas ref={canvasRef} className="w-full h-auto block" />
      </div>

      {/* Filter Selector */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
          {PHOTO_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => applyFilter(filter.id)}
              className="px-4 py-2 rounded-[4px] text-xs uppercase tracking-[0.1em] transition-colors cursor-pointer"
              style={{
                background: selectedFilter === filter.id ? 'var(--color-ink)' : 'var(--color-cream)',
                color: selectedFilter === filter.id ? 'var(--color-cream)' : 'var(--color-dust)',
                border: `1px solid ${selectedFilter === filter.id ? 'var(--color-ink)' : 'var(--color-dust)'}`,
              }}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 border border-[var(--color-dust)] text-[var(--color-ink)] rounded-[4px] text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-[var(--color-cream)] transition-colors"
        >
          back
        </button>
        <button
          onClick={handleUpload}
          className="flex-1 py-3.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-[4px] text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-[var(--color-ink)]/90 transition-colors"
        >
          save memory
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Camera Page ─── */
export default function CameraPage() {
  const { guestName, isRegistered, setShowRegistration } = useGuest();
  const { isLocked } = useBirthdayLock();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Upload and progress state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(async () => {
    const mode = localStorage.getItem('mode');
    const unlocked = isCapsuleUnlocked();

    // Query gate: if not admin and locked, DO NOT query
    if (mode !== 'admin' && !unlocked) {
      return;
    }

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('photos')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) setPhotos(data as Photo[]);
      } catch (err) {
        console.error('Failed to fetch photos:', err);
      }
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const mode = localStorage.getItem('mode');

  if (mode === 'birthday_girl') {
    if (isLocked) {
      return (
        <PageWrapper className="bg-[#FAF7F2]">
          <div className="film-grain pointer-events-none fixed inset-0 z-40" />
          <div className="px-6 pt-24 pb-12 max-w-md mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center space-y-6">
            <h1 className="text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
              sealed album
            </h1>
            <p className="text-sm text-[var(--color-dust)] font-[family-name:var(--font-body)] leading-relaxed">
              Photos and videos are being collected in your album. The gallery will unlock on your birthday morning.
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-blush)] font-medium">
              Locked until July 5
            </p>
          </div>
        </PageWrapper>
      );
    } else {
      return (
        <PageWrapper className="bg-[#FAF7F2]">
          <div className="film-grain pointer-events-none fixed inset-0 z-40" />
          <div className="px-6 pt-24 pb-12 max-w-[860px] mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)]">
                Revealed
              </span>
              <h1 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
                shared gallery
              </h1>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8">
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className="polaroid"
                  style={{ transform: `rotate(${-2 + Math.random() * 4}deg)` }}
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
                  <span className="polaroid-caption text-[10px] text-center block pt-1.5 text-[var(--color-dust)]">
                    {photo.guest_name || 'guest'}
                  </span>
                </div>
              ))}
            </div>
            {photos.length === 0 && (
              <p className="text-center text-sm text-[var(--color-dust)] italic">No shared memories found.</p>
            )}
          </div>
        </PageWrapper>
      );
    }
  }

  // Client-side validation helper
  const validateFile = (file: File, type: 'photo' | 'video'): boolean => {
    if (!isRegistered) {
      setShowRegistration(true);
      return false;
    }

    const photoLimit = 10 * 1024 * 1024; // 10MB
    const videoLimit = 50 * 1024 * 1024; // 50MB

    if (type === 'photo' && file.size > photoLimit) {
      setErrorMessage('photos must be under 10MB');
      return false;
    }

    if (type === 'video' && file.size > videoLimit) {
      setErrorMessage('videos must be under 50MB');
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file, 'photo')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Perform upload using XMLHttpRequest to track progress
  const uploadMedia = (fileDataUrl: string, fileName: string, fileType: string, isVideo: boolean, filterId: string | null) => {
    setIsUploading(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.setRequestHeader('Content-Type', 'application/json');

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentage);
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const uploadResult = JSON.parse(xhr.responseText);
          if (uploadResult.error) throw new Error(uploadResult.error);

          if (isSupabaseConfigured()) {
            await supabase.from('photos').insert([{
              guest_name: guestName,
              photo_url: uploadResult.url,
              drive_file_id: uploadResult.fileId,
              filter_used: filterId,
              type: isVideo ? 'video' : 'photo',
            }]);
          }

          setIsUploading(false);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000);
          fetchPhotos();
        } catch (err: any) {
          console.error(err);
          setErrorMessage(err.message || 'failed to save upload metadata');
          setIsUploading(false);
        }
      } else {
        setErrorMessage('failed to upload asset to drive');
        setIsUploading(false);
      }
    };

    xhr.onerror = () => {
      setErrorMessage('network upload error occurred');
      setIsUploading(false);
    };

    xhr.send(JSON.stringify({
      fileName,
      fileType,
      fileData: fileDataUrl,
      guestName,
    }));
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file, 'video')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const fileName = `${guestName || 'guest'}_${Date.now()}_video.mp4`;
      uploadMedia(dataUrl, fileName, file.type || 'video/mp4', true, null);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (filteredImage: string, filterId: string) => {
    const fileName = `${guestName || 'guest'}_${Date.now()}_photo.jpg`;
    setCapturedImage(null);
    uploadMedia(filteredImage, fileName, 'image/jpeg', false, filterId);
  };

  return (
    <PageWrapper className="bg-[#FAF7F2]">
      {/* Film grain */}
      <div className="film-grain pointer-events-none fixed inset-0 z-40" />

      {/* Full screen Success Confirmation Overlay */}
      <AnimatePresence>
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1614] text-[#FAF7F2]"
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-light font-[family-name:var(--font-display)]">
                added to capsule
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)]">
                your contribution has been saved
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1614]/95 text-[#FAF7F2] p-8"
          >
            <div className="w-full max-w-xs text-center space-y-4">
              <h3 className="text-xl font-light font-[family-name:var(--font-display)]">
                sealing media in capsule
              </h3>
              
              {/* Progress track */}
              <div className="w-full h-1 bg-[var(--color-dust)]/20 overflow-hidden rounded-full relative">
                <motion.div
                  className="h-full bg-[var(--color-blush)]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-dust)]">
                {uploadProgress}% uploaded
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 pt-20 pb-8 max-w-[860px] mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <span className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)]">
            Archive memories
          </span>
          <h1
            className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]"
          >
            album
          </h1>
        </motion.div>

        {errorMessage && (
          <div
            className="p-3 border border-[var(--color-blush)] text-[var(--color-blush)] text-xs text-center rounded-[4px] uppercase tracking-wider"
          >
            {errorMessage}
          </div>
        )}

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
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Ruled drag-drop containers grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Target Frame (Polaroid representation) */}
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--color-dust)]/40 hover:border-[var(--color-blush)] bg-[var(--color-cream)] aspect-[4/5] rounded-[4px] cursor-pointer transition-colors text-center"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] group-hover:text-[var(--color-ink)] transition-colors">
                      photo upload
                    </span>
                    <p className="text-sm italic font-[family-name:var(--font-display)] text-[var(--color-dust)] max-w-[160px] mx-auto leading-relaxed">
                      drop a photo here, or tap to choose
                    </p>
                  </div>
                </div>

                {/* Video Target Frame */}
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--color-dust)]/40 hover:border-[var(--color-blush)] bg-[var(--color-cream)] aspect-[4/5] rounded-[4px] cursor-pointer transition-colors text-center"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] group-hover:text-[var(--color-ink)] transition-colors">
                      video upload
                    </span>
                    <p className="text-sm italic font-[family-name:var(--font-display)] text-[var(--color-dust)] max-w-[160px] mx-auto leading-relaxed">
                      drop a video here, or tap to choose
                    </p>
                  </div>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />

              {/* Shared items (Only visible after unlock) */}
              {!isLocked && photos.length > 0 && (
                <div className="space-y-6 pt-8">
                  <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-dust)] text-center">
                    Shared Gallery
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {photos.map((photo, i) => (
                      <div
                        key={photo.id}
                        className="polaroid"
                        style={{ transform: `rotate(${-2 + Math.random() * 4}deg)` }}
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
                        <span className="polaroid-caption text-[10px] text-center block pt-1.5 text-[var(--color-dust)]">
                          {photo.guest_name || 'guest'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
