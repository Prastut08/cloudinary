import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/UI';
import { uploadVideoMedia, fetchVideoById, generateVideoVariantsAPI } from '../services/api';

export default function VideoPipeline() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoIdParam = searchParams.get('id');

  // Form & File state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
      const res = await uploadVideoMedia(title.trim(), selectedFile, description.trim());
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

  // Helper to compute poster JPG URL from video transformation URL if posterUrl is not present
  const getPosterUrl = (variantData, url) => {
    if (variantData?.posterUrl) return variantData.posterUrl;
    if (!url) return '';
    return url
      .replace('/f_mp4/', '/f_jpg/')
      .replace('/video/upload/', '/video/upload/f_jpg/')
      .replace(/\.mp4(\?.*)?$/, '.jpg$1');
  };

  // All 6 platform ratio variants catalog
  const VARIANTS_CONFIG = [
    {
      key: 'reels916',
      label: 'Instagram / Reels',
      aspectRatio: '9:16',
      target: '1080 × 1920',
      desc: 'Vertical 9:16 smart-cropped for Reels, TikTok & Shorts',
      icon: '📱',
    },
    {
      key: 'portrait45',
      label: 'Instagram / Portrait',
      aspectRatio: '4:5',
      target: '1080 × 1350',
      desc: 'Portrait 4:5 optimized for Instagram Feed & LinkedIn',
      icon: '📸',
    },
    {
      key: 'square11',
      label: 'Instagram / Square',
      aspectRatio: '1:1',
      target: '1080 × 1080',
      desc: 'Square 1:1 crop for Feed & Catalog',
      icon: '⬜',
    },
    {
      key: 'youtube169',
      label: 'YouTube / Widescreen',
      aspectRatio: '16:9',
      target: '1920 × 1080',
      desc: 'Full HD 16:9 widescreen for YouTube & TV',
      icon: '🎬',
    },
    {
      key: 'web43',
      label: 'Web / Catalog Banner',
      aspectRatio: '4:3',
      target: '1200 × 900',
      desc: 'Catalog banner format for web & tablet',
      icon: '🖥️',
    },
    {
      key: 'cinematic219',
      label: 'Cinematic / Ultra-wide',
      aspectRatio: '21:9',
      target: '1920 × 822',
      desc: 'Ultra-wide cinematic format for hero sections',
      icon: '🎞️',
    },
  ];

  const availableVariants = activeVideo?.variants || {};

  // Filter displaying variants
  const displayedVariants = VARIANTS_CONFIG.filter(
    (conf) => availableVariants[conf.key]
  );

  // AI-recommended variants
  const aiRecommended = displayedVariants.filter(
    (conf) => availableVariants[conf.key]?.aiRecommended
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-serif">
      {/* Editorial Header */}
      <div className="border-b border-[#E6DED1] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-normal text-[#1C1917] tracking-tight">
            Video Pipeline
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Upload video + describe your target platform → Multi-ratio video variants via Cloudinary.
          </p>
        </div>

        {uploadState === 'uploaded' && (
          <button
            onClick={() => {
              setActiveVideo(null);
              setSelectedFile(null);
              setPreviewUrl(null);
              setFileMeta(null);
              setTitle('');
              setDescription('');
              setUploadState('idle');
              setError(null);
            }}
            className="px-3 py-1.5 text-xs rounded border border-[#E6DED1] bg-[#FFFDF9] text-[#1C1917] hover:bg-[#F2ECDE] transition-colors"
          >
            Upload New Video
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      {/* UPLOAD FORM WHEN IDLE OR UPLOADING */}
      {uploadState !== 'uploaded' && (
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="border border-[#E6DED1] rounded bg-[#FFFDF9] p-5 space-y-4 shadow-xs">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Video Title
              </label>
              <input
                type="text"
                placeholder="e.g. Product Launch Promo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploadState === 'uploading'}
                className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded text-xs text-[#1C1917] focus:outline-none focus:border-[#C5BBAA] disabled:opacity-50"
                required
              />
            </div>

            {/* Description for AI-Driven Ratio Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Description <span className="font-normal text-[#78716C]">— Describe where you'll use this video</span>
              </label>
              <textarea
                placeholder="e.g. 'Short video for Instagram Reels and YouTube' or 'Cinematic brand video for website hero and TikTok'"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploadState === 'uploading'}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded text-xs text-[#1C1917] focus:outline-none focus:border-[#C5BBAA] disabled:opacity-50 resize-none leading-relaxed"
              />
              <p className="text-[10px] text-[#A8A29E] mt-1 leading-snug">
                💡 <strong>AI Hint:</strong> Keywords like <em>reels, tiktok, shorts, youtube, square, portrait, cinematic, website, banner, desktop, mobile, story, feed, hero</em> auto-target specific ratios. Leave empty to generate all 6 ratios.
              </p>
            </div>

            {/* File Upload & Instant Visible Preview */}
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Source Video File
              </label>

              {!previewUrl ? (
                <div className="border border-dashed border-[#D7CCC0] rounded p-6 text-center bg-[#FDFBF7] relative hover:bg-[#F9F5EE] transition-colors">
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/*"
                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                    disabled={uploadState === 'uploading'}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <p className="text-xs font-medium text-[#1C1917]">
                    Select video file (MP4, MOV, WEBM)
                  </p>
                  <p className="text-[11px] text-[#78716C] mt-0.5">
                    Up to 100MB
                  </p>
                </div>
              ) : (
                <div className="border border-[#E6DED1] rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between bg-[#FDFBF7] gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-24 h-16 rounded bg-[#0F172A] border border-[#E6DED1] overflow-hidden shrink-0 flex items-center justify-center relative">
                      <video
                        src={previewUrl}
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedData={(e) => { e.target.currentTime = 0.1; }}
                        className="max-h-full max-w-full object-contain"
                      />
                      <span className="absolute bottom-1 right-1 text-[8px] bg-black/60 text-white px-1 rounded font-mono">
                        PREVIEW
                      </span>
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-[#1C1917] truncate">
                        {selectedFile?.name}
                      </p>
                      {fileMeta && (
                        <p className="text-[11px] text-[#78716C] mt-0.5 font-mono">
                          {fileMeta.format} · {fileMeta.width} × {fileMeta.height} · {fileMeta.duration} · {fileMeta.size}
                        </p>
                      )}
                    </div>
                  </div>

                  {uploadState !== 'uploading' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setFileMeta(null);
                      }}
                      className="text-xs text-[#78716C] hover:text-[#1C1917] underline ml-2 shrink-0 self-end sm:self-center"
                    >
                      Change File
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!selectedFile || uploadState === 'uploading'}
                className="px-4 py-2 text-xs font-semibold rounded bg-[#1C1917] text-[#FFFDF9] hover:bg-[#2C2723] disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadState === 'uploading' ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Ingesting & Generating Variants...</span>
                  </>
                ) : (
                  'Upload & Generate Video Ratios'
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* DISPLAY ACTIVE VIDEO VARIANTS ONCE UPLOADED */}
      {activeVideo && (
        <div className="space-y-6">
          {/* SOURCE VIDEO CARD WITH VISIBLE POSTER & PLAYER */}
          <div className="border border-[#E6DED1] rounded bg-[#FFFDF9] p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E6DED1] pb-2">
              <h2 className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                Source Master Video
              </h2>
              {activeVideo.description && (
                <span className="text-[10px] text-[#78716C] italic max-w-xs truncate" title={activeVideo.description}>
                  "{activeVideo.description}"
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-full sm:w-72 h-44 bg-[#0F172A] rounded border border-[#E6DED1] overflow-hidden flex items-center justify-center shrink-0 relative">
                <video
                  src={activeVideo.originalAsset?.url}
                  poster={getPosterUrl(activeVideo.originalAsset, activeVideo.originalAsset?.url)}
                  controls
                  playsInline
                  preload="metadata"
                  onLoadedData={(e) => { if (e.target.currentTime === 0) e.target.currentTime = 0.1; }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-1.5 text-xs text-[#78716C]">
                <p className="font-semibold text-[#1C1917] text-sm">
                  {activeVideo.title}
                </p>
                <p className="font-mono text-[11px]">
                  {(activeVideo.originalAsset?.format || 'mp4').toLowerCase()} · {activeVideo.originalAsset?.duration ? `${Math.round(activeVideo.originalAsset.duration)}s` : 'Video'} · {activeVideo.originalAsset?.width || 1920} × {activeVideo.originalAsset?.height || 1080}
                  {activeVideo.originalAsset?.bytes && ` · ${(activeVideo.originalAsset.bytes / (1024 * 1024)).toFixed(2)} MB`}
                </p>
                {activeVideo.description && (
                  <p className="text-[11px] text-[#44403C] mt-2 bg-[#F5EFE6] p-2 rounded border border-[#E6DED1]">
                    <strong>Target Use Case:</strong> {activeVideo.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* AI RECOMMENDATION BANNER */}
          {aiRecommended.length > 0 && (
            <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded text-xs text-[#92400E] flex items-start gap-2">
              <span className="text-sm">✨</span>
              <div>
                <strong>AI Target Selection Active:</strong> Cloudinary generated{' '}
                <strong>{aiRecommended.length}</strong> matching ratio variant{aiRecommended.length > 1 ? 's' : ''}
                {' '}for your description: {' '}
                <strong>{aiRecommended.map((v) => v.label).join(', ')}</strong>.
              </div>
            </div>
          )}

          {/* PLATFORM VARIANTS GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E6DED1] pb-2">
              <h2 className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                Platform Video Variants ({displayedVariants.length} Generated)
              </h2>
              {displayedVariants.length < VARIANTS_CONFIG.length && (
                <span className="text-[10px] text-[#A8A29E]">
                  Ratios matched strictly to your description keywords
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedVariants.map((conf) => {
                const variantData = availableVariants[conf.key];
                const variantUrl = variantData?.url;
                const posterUrl = getPosterUrl(variantData, variantUrl);
                const isAiPick = variantData?.aiRecommended;

                return (
                  <div
                    key={conf.key}
                    className={`border rounded bg-[#FFFDF9] p-3 space-y-3 shadow-xs transition-all ${
                      isAiPick
                        ? 'border-[#FDE68A] ring-1 ring-[#FDE68A]/40'
                        : 'border-[#E6DED1]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs border-b border-[#E6DED1] pb-2">
                      <span className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                        <span>{conf.icon}</span>
                        {conf.label}
                        {isAiPick && (
                          <span className="text-[9px] bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded-full font-bold">
                            AI Pick
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] font-mono text-[#78716C]">
                        {conf.aspectRatio}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#A8A29E] -mt-1 mb-1">
                      {conf.desc} · {conf.target}
                    </div>

                    {/* VIDEO CONTAINER WITH AUTOMATIC PREVIEW PICTURE POSTER FOR THIS RATIO */}
                    <div className="h-60 bg-[#0F172A] rounded border border-[#E6DED1] overflow-hidden flex items-center justify-center relative group">
                      {variantUrl ? (
                        <video
                          src={variantUrl}
                          poster={posterUrl}
                          controls
                          playsInline
                          preload="metadata"
                          onLoadedData={(e) => { if (e.target.currentTime === 0) e.target.currentTime = 0.1; }}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-[#94A3B8]">Processing...</span>
                      )}

                      {/* Aspect Ratio Badge Overlay */}
                      <span className="absolute top-2 left-2 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded font-mono backdrop-blur-xs border border-white/10">
                        {conf.aspectRatio}
                      </span>
                    </div>

                    {variantData?.aiMatchReason && (
                      <p className="text-[9px] text-[#92400E] bg-[#FFFBEB] px-2 py-1 rounded">
                        🎯 {variantData.aiMatchReason}
                      </p>
                    )}

                    {/* STANDARD ACTIONS BAR */}
                    {variantUrl && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E6DED1]">
                        <a
                          href={variantUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1C1917] underline text-[11px] font-medium"
                        >
                          Open Video ↗
                        </a>

                        <button
                          onClick={() => handleCopyUrl(variantUrl, conf.key)}
                          className="text-[#78716C] hover:text-[#1C1917] underline text-[11px]"
                        >
                          {copiedKey === conf.key ? 'Copied!' : 'Copy URL'}
                        </button>

                        <a
                          href={variantUrl}
                          download
                          className="text-[#C9A227] hover:underline text-[11px] font-semibold"
                        >
                          Download
                        </a>
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

