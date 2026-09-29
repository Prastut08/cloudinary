import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/UI';
import { uploadVideoMedia, fetchVideoById } from '../services/api';

export default function VideoPipeline() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoIdParam = searchParams.get('id');

  // Form & File state
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);

  // Status & Data state
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | uploaded | error
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // If URL has ?id=vid_xxx, fetch that video document
  useEffect(() => {
    if (!videoIdParam) return;
    fetchVideoById(videoIdParam)
      .then((res) => {
        if (res && res.data) {
          setActiveVideo(res.data);
          setUploadState('uploaded');
        }
      })
      .catch((err) => {
        console.warn('Could not load video:', err.message);
      });
  }, [videoIdParam]);

  const handleFileChange = (file) => {
    setError(null);
    if (!file) return;

    // Validate video type
    if (!file.type.startsWith('video/') && !['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'].includes(file.type)) {
      setError('Unsupported file type. Please select a valid video file (MP4, MOV, WEBM, etc.).');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('Video file exceeds 100MB size limit.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Default title from filename if empty
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Read metadata via HTML5 Video element
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      setFileMeta({
        width: tempVideo.videoWidth,
        height: tempVideo.videoHeight,
        duration: tempVideo.duration ? `${Math.round(tempVideo.duration)}s` : 'Unknown',
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        format: file.type.split('/')[1]?.toUpperCase() || 'VIDEO',
      });
    };
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !title.trim()) return;

    setError(null);
    setUploadState('uploading');

    try {
      const res = await uploadVideoMedia(title.trim(), selectedFile);
      if (res && res.data) {
        setActiveVideo(res.data);
        setUploadState('uploaded');
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err) {
      setError(err.message || 'Video upload failed. Please try again.');
      setUploadState('error');
    }
  };

  const handleCopyUrl = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const VARIANTS_CONFIG = [
    {
      key: 'reels916',
      label: 'Instagram / Reels',
      aspectRatio: '9:16',
      target: '1080 × 1920',
      desc: 'Vertical 9:16 reframed with Cloudinary smart cropping (g_auto)',
    },
    {
      key: 'square11',
      label: 'Instagram / Square',
      aspectRatio: '1:1',
      target: '1080 × 1080',
      desc: '1:1 square crop optimized for Instagram Feed',
    },
    {
      key: 'youtube169',
      label: 'YouTube',
      aspectRatio: '16:9',
      target: '1920 × 1080',
      desc: 'Full HD 16:9 widescreen format',
    },
    {
      key: 'web169',
      label: 'Landscape / Web',
      aspectRatio: '16:9',
      target: '1280 × 720',
      desc: 'Web-optimized 720p CDN delivery',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-serif">
      {/* Editorial Header */}
      <div className="border-b border-[#D9D2C6] dark:border-[#38342E] pb-4">
        <h1 className="text-2xl font-normal text-[#171717] dark:text-[#F4EFE5] tracking-tight">
          Video Pipeline
        </h1>
        <p className="text-xs text-[#6B675F] dark:text-[#A8A39A] mt-1 leading-relaxed max-w-xl">
          One video upload → platform-ready video variants. Preserves the master source video while generating 9:16 Reels, 1:1 Square, 16:9 YouTube, and Web formats via Cloudinary CDN.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-[#FFFDF8] dark:bg-[#211F1B] border border-red-300 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs rounded">
          {error}
        </div>
      )}

      {/* STEP 1: VIDEO UPLOAD FORM */}
      <div className="border border-[#D9D2C6] dark:border-[#38342E] rounded bg-[#FFFDF8] dark:bg-[#211F1B] p-5 space-y-4">
        <h2 className="text-xs font-semibold text-[#171717] dark:text-[#F4EFE5] uppercase tracking-widest">
          1. Upload Master Video
        </h2>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#171717] dark:text-[#F4EFE5] mb-1">
              Video Title
            </label>
            <input
              type="text"
              placeholder="e.g. Product Demo Reel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploadState === 'uploading'}
              className="w-full px-3 py-2 bg-[#FFFDF8] dark:bg-[#171614] border border-[#D9D2C6] dark:border-[#38342E] rounded text-xs text-[#171717] dark:text-[#F4EFE5] focus:outline-none disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] dark:text-[#F4EFE5] mb-1">
              Source Video File
            </label>

            {!previewUrl ? (
              <div className="border border-dashed border-[#D9D2C6] dark:border-[#38342E] rounded p-6 text-center bg-[#F6F1E8]/40 dark:bg-[#171614]/40 relative">
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/*"
                  onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                  disabled={uploadState === 'uploading'}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <p className="text-xs font-medium text-[#171717] dark:text-[#F4EFE5]">
                  Select video file (MP4, MOV, WEBM)
                </p>
                <p className="text-[11px] text-[#6B675F] dark:text-[#A8A39A] mt-0.5">
                  Up to 100MB limit
                </p>
              </div>
            ) : (
              <div className="border border-[#D9D2C6] dark:border-[#38342E] rounded p-3 space-y-3 bg-[#FFFDF8] dark:bg-[#211F1B]">
                <div className="aspect-video bg-[#F6F1E8] dark:bg-[#171614] rounded overflow-hidden flex items-center justify-center">
                  <video src={previewUrl} controls className="max-h-48 max-w-full" />
                </div>

                {fileMeta && (
                  <div className="flex flex-wrap gap-4 text-[11px] text-[#6B675F] dark:text-[#A8A39A]">
                    <span>Resolution: <strong className="text-[#171717] dark:text-[#F4EFE5]">{fileMeta.width} × {fileMeta.height}</strong></span>
                    <span>Duration: <strong className="text-[#171717] dark:text-[#F4EFE5]">{fileMeta.duration}</strong></span>
                    <span>Format: <strong className="text-[#171717] dark:text-[#F4EFE5]">{fileMeta.format}</strong></span>
                    <span>Size: <strong className="text-[#171717] dark:text-[#F4EFE5]">{fileMeta.size}</strong></span>
                  </div>
                )}

                {uploadState !== 'uploading' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setFileMeta(null);
                    }}
                    className="text-xs text-[#6B675F] hover:text-[#171717] underline"
                  >
                    Change video file
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={!selectedFile || uploadState === 'uploading'}
              size="md"
            >
              {uploadState === 'uploading' ? 'Uploading & Processing Video...' : 'Upload & Generate Video Variants'}
            </Button>
          </div>
        </form>
      </div>

      {/* STEP 2: ACTIVE VIDEO DISPLAY & SOURCE INFO */}
      {activeVideo && (
        <div className="space-y-6">
          {/* SOURCE VIDEO CARD */}
          <div className="border border-[#D9D2C6] dark:border-[#38342E] rounded bg-[#FFFDF8] dark:bg-[#211F1B] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#D9D2C6] dark:border-[#38342E] pb-2">
              <h2 className="text-xs font-semibold text-[#171717] dark:text-[#F4EFE5] uppercase tracking-widest">
                Source Master Video (Preserved)
              </h2>
              <span className="text-[11px] text-[#6B675F] dark:text-[#A8A39A]">
                ID: {activeVideo.id || 'vid_source'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="aspect-video bg-[#F6F1E8] dark:bg-[#171614] rounded border border-[#D9D2C6] dark:border-[#38342E] overflow-hidden flex items-center justify-center">
                <video src={activeVideo.originalAsset?.url} controls className="max-h-full max-w-full" />
              </div>

              <div className="space-y-2 text-xs text-[#6B675F] dark:text-[#A8A39A]">
                <p><strong className="text-[#171717] dark:text-[#F4EFE5]">Title:</strong> {activeVideo.title}</p>
                <p><strong className="text-[#171717] dark:text-[#F4EFE5]">Resolution:</strong> {activeVideo.originalAsset?.width || 'N/A'} × {activeVideo.originalAsset?.height || 'N/A'}</p>
                <p><strong className="text-[#171717] dark:text-[#F4EFE5]">Aspect Ratio:</strong> {activeVideo.originalAsset?.aspectRatio || '16:9'}</p>
                <p><strong className="text-[#171717] dark:text-[#F4EFE5]">Format:</strong> {(activeVideo.originalAsset?.format || 'mp4').toUpperCase()}</p>
                {activeVideo.originalAsset?.duration && (
                  <p><strong className="text-[#171717] dark:text-[#F4EFE5]">Duration:</strong> {Math.round(activeVideo.originalAsset.duration)} seconds</p>
                )}
                {activeVideo.originalAsset?.bytes && (
                  <p><strong className="text-[#171717] dark:text-[#F4EFE5]">File Size:</strong> {(activeVideo.originalAsset.bytes / (1024 * 1024)).toFixed(2)} MB</p>
                )}
              </div>
            </div>
          </div>

          {/* STEP 3: GENERATED PLATFORM VARIANTS */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-[#171717] dark:text-[#F4EFE5] uppercase tracking-widest border-b border-[#D9D2C6] dark:border-[#38342E] pb-2">
              Platform-Ready Video Variants
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VARIANTS_CONFIG.map((conf) => {
                const variantData = activeVideo.variants?.[conf.key];
                const variantUrl = variantData?.url;

                return (
                  <div
                    key={conf.key}
                    className="border border-[#D9D2C6] dark:border-[#38342E] rounded bg-[#FFFDF8] dark:bg-[#211F1B] p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-[#D9D2C6] dark:border-[#38342E] pb-2 mb-3">
                        <span className="text-xs font-semibold text-[#171717] dark:text-[#F4EFE5]">
                          {conf.label}
                        </span>
                        <span className="text-[11px] font-mono text-[#6B675F] dark:text-[#A8A39A]">
                          {conf.aspectRatio} · {conf.target}
                        </span>
                      </div>

                      {variantUrl ? (
                        <div className="aspect-video bg-[#F6F1E8] dark:bg-[#171614] rounded border border-[#D9D2C6] dark:border-[#38342E] overflow-hidden flex items-center justify-center mb-3">
                          <video src={variantUrl} controls className="max-h-full max-w-full" />
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-[#6B675F]">
                          Generating variant...
                        </div>
                      )}

                      <p className="text-[11px] text-[#6B675F] dark:text-[#A8A39A] leading-relaxed">
                        {conf.desc}
                      </p>
                    </div>

                    {variantUrl && (
                      <div className="space-y-2 pt-2 border-t border-[#D9D2C6] dark:border-[#38342E] text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={variantUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#171717] dark:text-[#F4EFE5] underline"
                          >
                            Open Video ↗
                          </a>

                          <button
                            onClick={() => handleCopyUrl(variantUrl, conf.key)}
                            className="text-[#6B675F] dark:text-[#A8A39A] hover:text-[#171717] underline"
                          >
                            {copiedKey === conf.key ? 'Copied!' : 'Copy Cloudinary URL'}
                          </button>

                          <a
                            href={variantUrl}
                            download
                            className="text-[#C9A227] hover:underline font-semibold"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
