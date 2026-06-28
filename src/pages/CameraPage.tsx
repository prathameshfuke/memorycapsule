import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { isCapsuleUnlocked, getGuestInfo } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PHOTO_FILTERS } from '../lib/constants';
import type { Photo } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/shared/Button';

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
      className="max-w-[320px] mx-auto space-y-4"
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
        <Button variant="ghost" onClick={onBack} className="flex-1">
          back
        </Button>
        <Button variant="primary" onClick={handleUpload} className="flex-1">
          save memory
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Media Gallery (reusable for CapsulePage) ─── */
export function MediaGallery({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) {
    return <p className="text-center text-sm text-[var(--color-dust)]">No shared memories found.</p>;
  }
  return (
    <div
      className="grid gap-4 justify-center"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 220px))' }}
    >
      {photos.map((photo) => {
        const guestInfo = getGuestInfo(photo.guest_name);
        return (
          <div key={photo.id} className="relative rounded-[4px] overflow-hidden bg-[var(--color-cream)] border border-[var(--color-dust)] group">
            <div className="w-full h-full" style={{ aspectRatio: '1/1' }}>
              {photo.type === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    src={photo.photo_url}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-ink)]/70 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[var(--color-cream)] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={photo.photo_url}
                  alt="Memory"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
            {/* Uploader Pill Overlay */}
            <div className="absolute bottom-2 left-2 right-2 bg-[var(--color-ink)]/75 backdrop-blur-[2px] rounded-[4px] px-2 py-1.5 flex items-center gap-1.5 border border-white/10">
              <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-[var(--color-cream)] border border-white/20">
                <img src={guestInfo.avatar} alt={guestInfo.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[var(--color-cream)] font-semibold truncate">
                {guestInfo.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.82;

/* ─── Main Camera Page ─── */
export default function CameraPage() {
  const { guestName, isRegistered, setShowRegistration } = useGuest();
  const { isLocked } = useBirthdayLock();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('failed to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('failed to read image file'));
    reader.readAsDataURL(file);
  });

  const compressImage = (dataUrl: string) => new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(MAX_IMAGE_DIMENSION / image.width, MAX_IMAGE_DIMENSION / image.height, 1);
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('failed to prepare image for upload'));
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
    };
    image.onerror = () => reject(new Error('failed to prepare image for upload'));
    image.src = dataUrl;
  });

  const prepareImageForUpload = async (file: File) => {
    const dataUrl = await fileToDataUrl(file);
    return compressImage(dataUrl);
  };

  const fetchPhotos = useCallback(async () => {
    const mode = localStorage.getItem('mode');
    const unlocked = isCapsuleUnlocked();
    if (mode !== 'admin' && !unlocked) return;
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

  /* ─── Birthday Girl View ─── */
  if (mode === 'birthday_girl') {
    if (isLocked) {
      return (
        <PageWrapper className="bg-[var(--color-parchment)]">
          <div className="sealed-state">
            <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)]">Sealed</span>
            <h1 className="text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
              sealed album
            </h1>
            <p className="text-sm text-[var(--color-dust)] font-[family-name:var(--font-body)] leading-relaxed">
              Photos and videos are being collected in your album. The gallery will unlock on your birthday morning.
            </p>
            <p className="text-sm uppercase tracking-[0.2em] font-bold text-red mt-2">
              Locked until July 5
            </p>
          </div>
        </PageWrapper>
      );
    } else {
      return (
        <PageWrapper className="bg-[var(--color-parchment)]">
        <div className="page-container">
            <div className="text-center mb-16">
              <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
                Photos & videos collected
              </span>
              <h1 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
                shared gallery
              </h1>
            </div>
            <MediaGallery photos={photos} />
          </div>
        </PageWrapper>
      );
    }
  }

  /* ─── Guest/Admin Upload Mode ─── */
  const validateFile = (file: File, type: 'photo' | 'video'): boolean => {
    if (!isRegistered) {
      setShowRegistration(true);
      return false;
    }
    const photoLimit = 10 * 1024 * 1024;
    const videoLimit = 50 * 1024 * 1024;
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Single file -> show filter preview
    if (files.length === 1) {
      const file = files[0];
      if (!validateFile(file, 'photo')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Multiple files -> compress each image before upload
      Array.from(files).forEach((file, idx) => {
        if (!validateFile(file, 'photo')) return;
        prepareImageForUpload(file)
          .then((dataUrl) => {
            const fileName = `${guestName || 'guest'}_${Date.now()}_${idx}_photo.jpg`;
            uploadMedia(dataUrl, fileName, 'image/jpeg', false, 'none');
          })
          .catch((err) => {
            console.error(err);
            setErrorMessage(err.message || 'failed to prepare image for upload');
          });
      });
    }
  };

  const uploadMedia = (fileDataUrl: string, fileName: string, fileType: string, isVideo: boolean, filterId: string | null) => {
    setIsUploading(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.setRequestHeader('Content-Type', 'application/json');

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
              drive_file_id: null,
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
        try {
          const response = JSON.parse(xhr.responseText);
          setErrorMessage(response.error || 'failed to upload asset');
        } catch {
          setErrorMessage(xhr.responseText || 'failed to upload asset');
        }
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
    <PageWrapper className="bg-[var(--color-parchment)]">
      {/* Success Overlay */}
      <AnimatePresence>
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-ink)] text-[var(--color-cream)]"
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-ink)]/95 text-[var(--color-cream)] p-8"
          >
            <div className="w-full max-w-[320px] text-center space-y-4">
              <h3 className="text-xl font-light font-[family-name:var(--font-display)]">
                sealing media in capsule
              </h3>
              <div className="w-full h-1 bg-[var(--color-dust)]/20 overflow-hidden rounded-full">
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

      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
            Leave a memory
          </span>
          <h1 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
            album
          </h1>
        </motion.div>

        {errorMessage && (
          <div className="p-4 border border-[var(--color-blush)] text-[var(--color-blush)] text-xs text-center rounded-[4px] uppercase tracking-wider mb-8">
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
            >
              {/* Centered dropzones */}
              <div className="flex flex-col md:flex-row gap-6 items-center justify-center mb-16">
                {/* Photo Dropzone */}
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-dust)]/40 hover:border-[var(--color-blush)] bg-[var(--color-cream)] rounded-[4px] cursor-pointer transition-colors text-center"
                  style={{ width: '100%', maxWidth: '320px', aspectRatio: '4/5' }}
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] group-hover:text-[var(--color-ink)] transition-colors mb-4">
                    photo upload
                  </span>
                  <p className="text-sm italic font-[family-name:var(--font-display)] text-[var(--color-dust)] max-w-[200px] leading-relaxed">
                    drop photos here, or tap to choose
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-dust)]/60 mt-4">
                    select multiple
                  </p>
                </div>

                {/* Video Dropzone */}
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-dust)]/40 hover:border-[var(--color-blush)] bg-[var(--color-cream)] rounded-[4px] cursor-pointer transition-colors text-center"
                  style={{ width: '100%', maxWidth: '320px', aspectRatio: '4/5' }}
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] group-hover:text-[var(--color-ink)] transition-colors mb-4">
                    video upload
                  </span>
                  <p className="text-sm italic font-[family-name:var(--font-display)] text-[var(--color-dust)] max-w-[200px] leading-relaxed">
                    drop a video here, or tap to choose
                  </p>
                </div>
              </div>

              {/* Hidden file inputs — photos now accept multiple */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
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

              {/* Gallery (after unlock) */}
              {!isLocked && photos.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] text-center mb-8">
                    Shared Gallery
                  </h2>
                  <MediaGallery photos={photos} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
