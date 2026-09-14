import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/UI';
import { uploadProductMedia } from '../services/api';

export default function UploadProduct() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('General Photo');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (file) => {
    setError(null);
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Please select a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds 15MB limit. Please choose a smaller image.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (!productName.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setProductName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !productName.trim()) return;

    setError(null);
    setIsUploading(true);

    try {
      const response = await uploadProductMedia(productName.trim(), category, selectedFile);
      if (response && response.productId) {
        navigate('/social-factory?product=' + response.productId, {
          state: {
            productId: response.productId,
            productName: productName.trim(),
            previewUrl: previewUrl || response.data?.originalAsset?.url,
            productData: response.data
          }
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to process image through Cloudinary pipeline.');
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-amber-900/20 pb-5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cloudinary Media Pipeline</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Content Studio</h1>
        <p className="text-xs text-stone-400 mt-1">
          Upload an image once. Automatically generate multi-platform social media, web hero banners, and background-removed PNG cutouts.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800/60 rounded-2xl text-red-300 text-xs flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Media Meta Section */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-amber-900/20">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
            1. Media Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Title / Media Name
              </label>
              <input
                type="text"
                placeholder="e.g. Summer Vacation, Luxury Watch, Event Poster"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={isUploading}
                className="w-full px-3.5 py-2.5 bg-stone-900/90 border border-amber-900/30 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Classification / Channel Use
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isUploading}
                className="w-full px-3.5 py-2.5 bg-stone-900/90 border border-amber-900/30 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors disabled:opacity-50"
              >
                <option value="General Photo">General Photo</option>
                <option value="Product">Product / Commerce</option>
                <option value="Portrait">Portrait / Person</option>
                <option value="Landscape">Landscape / Travel</option>
                <option value="Food">Food & Dining</option>
                <option value="Event">Event / Celebration</option>
                <option value="Artwork">Artwork / Poster</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upload Dropzone Section */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-amber-900/20">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
            2. Master Source Image
          </h2>

          {!previewUrl ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                isDragging
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-amber-900/30 bg-stone-900/40 hover:bg-stone-900/70 hover:border-amber-900/50'
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              />

              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-2xl luxury-gradient-bg flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Click to browse or drop master photo
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Supports ultra high-res PNG, JPG, or WEBP up to 15MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-amber-900/30 rounded-2xl p-4 flex items-center justify-between bg-stone-900/60">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl bg-stone-950 border border-amber-900/30 overflow-hidden shrink-0 flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                    {selectedFile?.name || 'Selected media image'}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {(selectedFile?.size ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '1.2')} MB • Ready for Cloudinary pipeline
                  </p>
                </div>
              </div>

              {!isUploading && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/')}
            disabled={isUploading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="gap-2 px-6"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                <span>Processing Cloudinary Media...</span>
              </>
            ) : (
              <>
                <span>Generate All Formats</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
