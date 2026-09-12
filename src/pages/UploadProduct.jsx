import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/UI';
import { uploadProductMedia } from '../services/api';

export default function UploadProduct() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Footwear');
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
      // Direct call to Express Backend (Authentication token attached automatically)
      const response = await uploadProductMedia(productName.trim(), category, selectedFile);
      
      // Navigate to Processing screen with created product details
      if (response && response.productId) {
        navigate('/processing', {
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
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Create product assets</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Upload a raw product image and generate optimized media variants for every sales channel.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Meta Section */}
        <div className="bg-white border border-neutral-200 rounded p-6 space-y-4">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            1. Product Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                placeholder="e.g. Leather Minimalist Sneaker"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-800 focus:outline-none focus:border-neutral-400 transition-colors disabled:opacity-50"
              >
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
                <option value="Bags & Luggage">Bags & Luggage</option>
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upload Dropzone Section */}
        <div className="bg-white border border-neutral-200 rounded p-6 space-y-4">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            2. Master Product Image
          </h2>

          {!previewUrl ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-10 text-center transition-all ${
                isDragging
                  ? 'border-neutral-900 bg-neutral-100/50'
                  : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-300'
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />

              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 rounded bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 shadow-xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">
                    Click to browse or drag and drop raw photo
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Supports high-resolution PNG, JPG, or WEBP up to 15MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-neutral-200 rounded p-4 flex items-center justify-between bg-neutral-50/40">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded bg-white border border-neutral-200 overflow-hidden shrink-0">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900 truncate max-w-xs sm:max-w-md">
                    {selectedFile?.name || 'Selected product image'}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {(selectedFile?.size ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '1.2')} MB • Ready for processing
                  </p>
                </div>
              </div>

              {!isUploading && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded transition-colors"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
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
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading & Processing...</span>
              </>
            ) : (
              <>
                <span>Generate Assets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
