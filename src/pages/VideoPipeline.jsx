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
    <div className="max-w-4xl mx-auto space-y-6 font-serif">
      {/* Editorial Header */}
      <div className="border-b border-[#E6DED1] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-normal text-[#1C1917] tracking-tight">
            Video Pipeline
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            One video upload → platform-ready video variants.
          </p>
        </div>

        {uploadState === 'uploaded' && (
          <button
            onClick={() => {
              setActiveVideo(null);
              setSelectedFile(null);
              setPreviewUrl(null);
              setFileMeta(null);
              setUploadState('idle');
            }}
            className="px-3 py-1.5 text-xs rounded border border-[#E6DED1] bg-[#FFFDF9] text-[#1C1917] hover:bg-[#F2ECDE]"
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
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Video Title
              </label>
              <input
                type="text"
                placeholder="e.g. Master Product Demo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploadState === 'uploading'}
                className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded text-xs text-[#1C1917] focus:outline-none focus:border-[#C5BBAA] disabled:opacity-50"
                required
              />
            </div>

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
                <div className="border border-[#E6DED1] rounded p-3 flex items-center justify-between bg-[#FDFBF7]">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-16 h-12 rounded bg-white border border-[#E6DED1] overflow-hidden shrink-0 flex items-center justify-center">
                      <video src={previewUrl} className="max-h-full max-w-full" />
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
                      className="text-xs text-[#78716C] hover:text-[#1C1917] underline ml-2 shrink-0"
                    >
                      Change
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!selectedFile || uploadState === 'uploading'}
                className="px-4 py-2 text-xs font-semibold rounded bg-[#1C1917] text-[#FFFDF9] hover:bg-[#2C2723] disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {uploadState === 'uploading' ? 'Processing Video...' : 'Upload Video'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* DISPLAY ACTIVE VIDEO VARIANTS ONCE UPLOADED */}
      {activeVideo && (
        <div className="space-y-6">
          {/* SOURCE VIDEO */}
          <div className="border border-[#E6DED1] rounded bg-[#FFFDF9] p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E6DED1] pb-2">
              <h2 className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                Source Video
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-full sm:w-64 aspect-video bg-[#F5EFE6] rounded border border-[#E6DED1] overflow-hidden flex items-center justify-center shrink-0">
                <video src={activeVideo.originalAsset?.url} controls className="max-h-full max-w-full" />
              </div>

              <div className="space-y-1.5 text-xs text-[#78716C]">
                <p className="font-semibold text-[#1C1917] text-sm">
                  {activeVideo.title}
                </p>
                <p className="font-mono text-[11px]">
                  {(activeVideo.originalAsset?.format || 'mp4').toLowerCase()} · {activeVideo.originalAsset?.duration ? `${Math.round(activeVideo.originalAsset.duration)}s` : 'Video'} · {activeVideo.originalAsset?.width || 1920} × {activeVideo.originalAsset?.height || 1080}
                  {activeVideo.originalAsset?.bytes && ` · ${(activeVideo.originalAsset.bytes / (1024 * 1024)).toFixed(2)} MB`}
                </p>
              </div>
            </div>
          </div>

          {/* PLATFORM VARIANTS GRID */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider border-b border-[#E6DED1] pb-2">
              Platform Variants
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VARIANTS_CONFIG.map((conf) => {
                const variantData = activeVideo.variants?.[conf.key];
                const variantUrl = variantData?.url;

                return (
                  <div
                    key={conf.key}
                    className="border border-[#E6DED1] rounded bg-[#FFFDF9] p-3 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs border-b border-[#E6DED1] pb-2">
                      <span className="font-semibold text-[#1C1917]">
                        {conf.label}
                      </span>
                      <span className="text-[11px] font-mono text-[#78716C]">
                        {conf.aspectRatio} · {conf.target}
                      </span>
                    </div>

                    <div className="aspect-video bg-[#F5EFE6] rounded border border-[#E6DED1] overflow-hidden flex items-center justify-center">
                      {variantUrl && variantUrl.includes('/video/upload/') ? (
                        <video src={variantUrl} controls playsInline preload="metadata" className="max-h-full max-w-full" />
                      ) : variantUrl ? (
                        <span className="text-xs text-red-600 font-sans p-2 text-center">Invalid video URL generated</span>
                      ) : (
                        <span className="text-xs text-[#78716C]">Processing...</span>
                      )}
                    </div>

                    {variantUrl && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E6DED1]">
                        <a
                          href={variantUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1C1917] underline text-[11px]"
                        >
                          Open ↗
                        </a>

                        <button
                          onClick={() => handleCopyUrl(variantUrl, conf.key)}
                          className="text-[#78716C] hover:text-[#1C1917] underline text-[11px]"
                        >
                          {copiedKey === conf.key ? 'Copied' : 'Copy URL'}
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

