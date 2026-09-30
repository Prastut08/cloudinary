import React, { useState, useEffect } from 'react';
import { generateLumaVideo, fetchLumaTaskStatus, fetchLumaHistory } from '../services/api';

export default function KlingVideoGenerator() {
  // Form State
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState(5);
  const [mode, setMode] = useState('std');

  // Status & Task State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetchLumaHistory();
      if (res && res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.warn('Could not load video history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Poll task status if a task is processing
  useEffect(() => {
    if (!currentTask || currentTask.status === 'completed' || currentTask.status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetchLumaTaskStatus(currentTask.id);
        if (res && res.data) {
          setCurrentTask(res.data);
          if (res.data.status === 'completed' && res.data.videoUrl) {
            setActiveVideoUrl(res.data.videoUrl);
            loadHistory();
          }
        }
      } catch (err) {
        console.warn('Task polling notice:', err.message);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentTask]);

  const handleFileChange = (file) => {
    setError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Image size exceeds 20MB limit.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image to generate video from.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setActiveVideoUrl(null);

    try {
      const res = await generateLumaVideo({
        file: selectedFile,
        prompt: prompt.trim(),
        duration,
        aspectRatio,
        mode,
        title: title.trim() || 'AI Generated Video',
      });

      if (res && res.data) {
        setCurrentTask(res.data);
        if (res.data.videoUrl) {
          setActiveVideoUrl(res.data.videoUrl);
        }
        loadHistory();
      } else {
        throw new Error('Invalid response received from server.');
      }
    } catch (err) {
      setError(err.message || 'Video generation request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const PROMPT_PRESETS = [
    'Cinematic slow pan from left to right with soft studio lighting',
    '360-degree rotation showing full product details in high resolution',
    'Subtle ambient breeze with elegant particle reflections',
    'Dynamic camera zoom-in focusing on central product detail',
    'Dramatic slow motion reveal with cinematic studio backdrop',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-serif">
      {/* Page Header */}
      <div className="border-b border-[#E6DED1] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-normal text-[#1C1917] tracking-tight">
              Luma AI Video Generator
            </h1>
            <span className="text-[10px] bg-[#EEF2FF] text-[#3730A3] px-2.5 py-0.5 rounded-full font-sans font-semibold border border-[#C7D2FE]">
              Luma Dream Machine Active
            </span>
          </div>
          <p className="text-xs text-[#78716C] mt-1">
            Transform product photos into high-definition AI motion videos using Luma AI (Ray-2 Engine).
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-sans">
          ⚠️ {error}
        </div>
      )}

      {/* Main Generator Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-[#E6DED1] rounded bg-[#FFFDF9] p-6 space-y-6 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Image Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  1. Upload Source Image
                </label>

                {!previewUrl ? (
                  <div className="border-2 border-dashed border-[#D7CCC0] rounded-lg p-8 text-center bg-[#FDFBF7] relative hover:bg-[#F9F5EE] transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/*"
                      onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                      disabled={isSubmitting}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="space-y-2">
                      <span className="text-2xl block">🖼️</span>
                      <p className="text-xs font-semibold text-[#1C1917]">
                        Click or drag product image here
                      </p>
                      <p className="text-[11px] text-[#78716C]">
                        Supports JPG, PNG, WEBP (up to 20MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-[#E6DED1] rounded p-3 bg-[#FDFBF7] space-y-3">
                    <div className="aspect-video bg-[#0F172A] rounded border border-[#E6DED1] overflow-hidden flex items-center justify-center relative">
                      <img
                        src={previewUrl}
                        alt="Selected source"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate font-semibold text-[#1C1917] max-w-[200px]">
                        {selectedFile?.name}
                      </span>
                      {!isSubmitting && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="text-xs text-[#78716C] hover:text-[#1C1917] underline"
                        >
                          Replace Image
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Product Motion Scene"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded text-xs text-[#1C1917] focus:outline-none focus:border-[#C5BBAA] font-sans"
                />
              </div>
            </div>

            {/* Right Column: Prompt & Configurations */}
            <div className="space-y-4">
              {/* Motion Prompt */}
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  2. Luma AI Motion & Animation Description
                </label>
                <textarea
                  placeholder="Describe how Luma AI should animate the scene (e.g., 'Smooth camera tilt up with gentle smoke drifting in background and studio lighting shift')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-[#E6DED1] rounded text-xs text-[#1C1917] focus:outline-none focus:border-[#C5BBAA] font-sans resize-none leading-relaxed"
                />

                {/* Inspiration Presets */}
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-[#A8A29E] block">Click preset inspiration:</span>
                  <div className="flex flex-wrap gap-1">
                    {PROMPT_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(preset)}
                        className="text-[9px] bg-[#F5EFE6] text-[#44403C] hover:bg-[#E6DED1] px-2 py-1 rounded transition-colors"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Configurations Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {/* Aspect Ratio */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-2 py-1.5 bg-white border border-[#E6DED1] rounded text-xs text-[#1C1917] focus:outline-none font-sans"
                  >
                    <option value="16:9">16:9 Widescreen</option>
                    <option value="9:16">9:16 Reels/TikTok</option>
                    <option value="1:1">1:1 Square</option>
                    <option value="4:3">4:3 Standard</option>
                    <option value="21:9">21:9 Cinematic</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    disabled={isSubmitting}
                    className="w-full px-2 py-1.5 bg-white border border-[#E6DED1] rounded text-xs text-[#1C1917] focus:outline-none font-sans"
                  >
                    <option value={5}>5 Seconds</option>
                    <option value={10}>10 Seconds</option>
                  </select>
                </div>

                {/* Engine Mode */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1C1917] mb-1">
                    Luma Model
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-2 py-1.5 bg-white border border-[#E6DED1] rounded text-xs text-[#1C1917] focus:outline-none font-sans"
                  >
                    <option value="std">Ray-2 Standard</option>
                    <option value="pro">Ray-2 Ultra</option>
                  </select>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={!selectedFile || isSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold rounded bg-[#1C1917] text-[#FFFDF9] hover:bg-[#2C2723] disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Generating with Luma AI...</span>
                    </>
                  ) : (
                    '🎬 Generate Luma Video'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ACTIVE GENERATION TASK CARD */}
      {currentTask && (
        <div className="border border-[#E6DED1] rounded bg-[#FFFDF9] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E6DED1] pb-3">
            <div>
              <h2 className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                Luma Video Status
              </h2>
              <p className="text-[11px] text-[#78716C] font-mono mt-0.5">
                Task ID: {currentTask.id || currentTask.taskId}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider font-sans ${
                currentTask.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : currentTask.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800 animate-pulse'
              }`}
            >
              {currentTask.status === 'completed' ? 'Succeeded' : currentTask.status}
            </span>
          </div>

          {/* API Note Banner */}
          {currentTask.apiNote && (
            <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded text-[11px] text-[#92400E] flex items-start gap-2 font-sans">
              <span className="text-sm shrink-0">💡</span>
              <p>{currentTask.apiNote}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Image */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#1C1917] block">Input Image:</span>
              <div className="h-56 bg-[#0F172A] rounded border border-[#E6DED1] overflow-hidden flex items-center justify-center">
                <img
                  src={currentTask.sourceImageUrl}
                  alt="Input Source"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Generated Video or Processing Indicator */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#1C1917] block">Generated Video:</span>
              <div className="h-56 bg-[#0F172A] rounded border border-[#E6DED1] overflow-hidden flex items-center justify-center relative">
                {activeVideoUrl ? (
                  <video
                    src={activeVideoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <svg className="animate-spin h-6 w-6 text-amber-400 mx-auto" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-xs text-[#94A3B8] font-sans">
                      Luma Dream Machine is rendering your video...
                    </p>
                    <p className="text-[10px] text-[#64748B] font-mono">
                      Target Ratio: {currentTask.aspectRatio} · Duration: {currentTask.duration}s
                    </p>
                  </div>
                )}
              </div>

              {activeVideoUrl && (
                <div className="flex items-center justify-between text-xs pt-2">
                  <a
                    href={activeVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1C1917] underline text-[11px]"
                  >
                    Open Full Video ↗
                  </a>
                  <button
                    onClick={() => handleCopy(activeVideoUrl, 'active_video')}
                    className="text-[#78716C] hover:text-[#1C1917] underline text-[11px]"
                  >
                    {copiedKey === 'active_video' ? 'Copied!' : 'Copy Video Link'}
                  </button>
                  <a
                    href={activeVideoUrl}
                    download
                    className="text-[#C9A227] hover:underline text-[11px] font-semibold"
                  >
                    Download Video
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GENERATION HISTORY GALLERY */}
      <div className="space-y-4 pt-4 border-t border-[#E6DED1]">
        <h2 className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
          Generated Luma Videos ({history.length})
        </h2>

        {loadingHistory ? (
          <div className="text-xs text-[#78716C]">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#78716C] border border-dashed border-[#E6DED1] rounded bg-[#FFFDF9]">
            No videos generated yet. Upload an image above to generate your first AI video.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item) => (
              <div key={item.id} className="border border-[#E6DED1] rounded bg-[#FFFDF9] p-3 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs border-b border-[#E6DED1] pb-2">
                  <span className="font-semibold text-[#1C1917] truncate max-w-[180px]">
                    {item.title || 'Luma AI Video'}
                  </span>
                  <span className="text-[10px] font-mono text-[#78716C]">
                    {item.aspectRatio} · {item.duration}s
                  </span>
                </div>

                <div className="h-48 bg-[#0F172A] rounded border border-[#E6DED1] overflow-hidden flex items-center justify-center relative">
                  {item.videoUrl ? (
                    <video
                      src={item.videoUrl}
                      controls
                      playsInline
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <img
                      src={item.sourceImageUrl}
                      alt="Source Input"
                      className="max-h-full max-w-full object-contain opacity-75"
                    />
                  )}
                </div>

                {item.prompt && (
                  <p className="text-[10px] text-[#78716C] italic line-clamp-2" title={item.prompt}>
                    "{item.prompt}"
                  </p>
                )}

                {item.videoUrl && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E6DED1]">
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1C1917] underline text-[11px]"
                    >
                      Open ↗
                    </a>
                    <button
                      onClick={() => handleCopy(item.videoUrl, item.id)}
                      className="text-[#78716C] hover:text-[#1C1917] underline text-[11px]"
                    >
                      {copiedKey === item.id ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a
                      href={item.videoUrl}
                      download
                      className="text-[#C9A227] hover:underline text-[11px] font-semibold"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
