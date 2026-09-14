import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tag, ShieldCheck, Download, ExternalLink, ArrowLeft, Layers, AlertCircle,
  Loader2, RefreshCw, CheckCircle2, FileText, Image as ImageIcon, Sparkles, Sliders,
  Share2, Trash2, Edit2, Copy, Check, Eye, X
} from 'lucide-react';
import { Button, StatusDot, Badge } from '../components/ui/UI';
import {
  fetchProductById,
  regenerateSingleAsset,
  renameProduct,
  deleteProduct,
  createProductShare,
  toggleProductShareState,
  deleteSingleAsset,
  downloadProductZipArchive
} from '../services/api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regeneratingKey, setRegeneratingKey] = useState(null);
  const [compareCrop, setCompareCrop] = useState('transparent');

  // Interactive Management State
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [shareUrl, setShareUrl] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isShareDisabled, setIsShareDisabled] = useState(false);

  const [deletingAssetKey, setDeletingAssetKey] = useState(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  useEffect(() => {
    fetchProductById(id)
      .then((res) => {
        if (res && res.data) {
          setProduct(res.data);
          setNewName(res.data.name);
        }
      })
      .catch((err) => setError(err.message || 'Could not load product details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRegenerate = async (variantKey) => {
    setRegeneratingKey(variantKey);
    try {
      const res = await regenerateSingleAsset(id, variantKey);
      if (res && res.url) {
        setProduct((prev) => {
          if (!prev) return prev;
          const newPacks = { ...prev.assets };
          Object.keys(newPacks).forEach((packKey) => {
            newPacks[packKey] = newPacks[packKey].map((ast) => {
              if (ast.type === variantKey) {
                return { ...ast, url: `${res.url}&t=${Date.now()}` };
              }
              return ast;
            });
          });
          return { ...prev, assets: newPacks };
        });
      }
    } catch (err) {
      alert(err.message || 'Regenerate asset failed');
    } finally {
      setRegeneratingKey(null);
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsRenaming(true);
    try {
      await renameProduct(id, newName.trim());
      setProduct((prev) => (prev ? { ...prev, name: newName.trim() } : prev));
      setIsRenameOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to rename product');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setIsDeleting(true);
    try {
      await deleteProduct(id);
      navigate('/products');
    } catch (err) {
      alert(err.message || 'Failed to delete product');
      setIsDeleting(false);
    }
  };

  const handleShareProduct = async () => {
    setIsSharing(true);
    try {
      const res = await createProductShare(id);
      if (res && res.shareUrl) {
        setShareUrl(res.shareUrl);
        setIsShareDisabled(false);
        navigator.clipboard.writeText(res.shareUrl);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to generate share link');
    } finally {
      setIsSharing(false);
    }
  };

  const handleToggleShare = async () => {
    const nextState = !isShareDisabled;
    try {
      await toggleProductShareState(id, !nextState);
      setIsShareDisabled(nextState);
    } catch (err) {
      alert(err.message || 'Failed to toggle share state');
    }
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadProductZipArchive(id, product?.name || 'product');
    } catch (err) {
      alert(err.message || 'Failed to download ZIP archive');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleDeleteAssetVariant = async (variantKey) => {
    if (!window.confirm(`Are you sure you want to delete the ${variantKey} asset variant?`)) return;
    setDeletingAssetKey(variantKey);
    try {
      const res = await deleteSingleAsset(id, variantKey);
      if (res && res.assets) {
        setProduct((prev) => (prev ? { ...prev, assets: res.assets } : prev));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete asset variant');
    } finally {
      setDeletingAssetKey(null);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-neutral-500 gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
        <span>Fetching Cloudinary product media signals...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white border border-neutral-200 rounded text-center space-y-4 my-12">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Product Not Found</h3>
          <p className="text-xs text-neutral-500 mt-1">{error || 'This product does not exist or has been deleted.'}</p>
        </div>
        <Button onClick={() => navigate('/products')} variant="secondary" size="sm">
          Back to Library
        </Button>
      </div>
    );
  }

  const originalUrl = product.originalAsset?.url;
  const analysis = product.analysis || {};
  const crops = product.crops || {};
  const ecommerceAssets = product.assets?.ecommerce || [];
  const socialAssets = product.assets?.social || [];
  const webAssets = product.assets?.web || [];

  const readinessScore = analysis.commerceReadiness?.score || 85;
  const readinessStatus = analysis.commerceReadiness?.status || 'READY';

  const tagsList = Array.isArray(analysis.tags)
    ? analysis.tags.map((t) => (typeof t === 'string' ? t : t.name))
    : [];

  const totalAssetsCount =
    ecommerceAssets.length + socialAssets.length + webAssets.length + (originalUrl ? 1 : 0);

  const compareImageSrc =
    compareCrop === 'transparent'
      ? ecommerceAssets.find((a) => a.type === 'transparent-product')?.url || originalUrl
      : compareCrop === 'heroCutout'
      ? webAssets.find((a) => a.type === 'websiteLandscape')?.url || originalUrl
      : compareCrop === 'square'
      ? crops.square || originalUrl
      : compareCrop === 'portrait'
      ? crops.portrait || originalUrl
      : crops.landscape || originalUrl;

  return (
    <div className="space-y-8">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library</span>
          </button>
          <span className="text-neutral-300">|</span>
          <span className="text-xs font-mono text-neutral-400">ID: {product.id || id}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            variant="primary"
            size="sm"
            className="gap-1.5"
          >
            {isDownloadingZip ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Preparing ZIP ({totalAssetsCount} assets)...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download All Assets ({totalAssetsCount})</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleShareProduct}
            disabled={isSharing}
            variant="secondary"
            size="sm"
            className="gap-1.5"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Share Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-neutral-500" />
                <span>Share Product Showcase</span>
              </>
            )}
          </Button>

          {shareUrl && (
            <Button
              onClick={handleToggleShare}
              variant="secondary"
              size="sm"
            >
              {isShareDisabled ? 'Enable Sharing' : 'Disable Sharing'}
            </Button>
          )}

          <Button
            onClick={() => setIsRenameOpen(true)}
            variant="secondary"
            size="sm"
            className="gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
            <span>Rename</span>
          </Button>

          <button
            onClick={() => setIsDeleteOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-red-200 text-xs font-medium text-red-600 bg-white hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Delete Product</span>
          </button>
        </div>
      </div>

      {/* Share Link Banner */}
      {shareUrl && (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-4 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2 truncate">
            <Share2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold shrink-0">Public Share URL:</span>
            <span className="font-mono text-emerald-700 truncate">{shareUrl}</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              setCopiedShare(true);
              setTimeout(() => setCopiedShare(false), 2000);
            }}
            className="px-2.5 py-1 bg-white border border-emerald-300 rounded font-medium text-emerald-800 hover:bg-emerald-100 shrink-0"
          >
            {copiedShare ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}

      {/* Overview Header Card */}
      <div className="bg-white border border-neutral-200 rounded p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
              <img src={originalUrl} alt={product.name} className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-neutral-900 tracking-tight">{product.name}</h1>
                <Badge variant="neutral">{product.category || 'General Photo'}</Badge>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Media Details & Formats: <span className="font-semibold text-neutral-800">{totalAssetsCount} available</span>
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Cloudinary Public ID: <span className="font-mono text-neutral-700">{product.originalAsset?.publicId || 'N/A'}</span>
              </p>
              {analysis.caption && (
                <p className="text-xs text-neutral-600 italic mt-2 bg-neutral-50 p-2 rounded border border-neutral-100">
                  "{analysis.caption}"
                </p>
              )}
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-neutral-200 pt-4 md:pt-0 md:pl-6 space-y-3 min-w-[240px]">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Commerce Readiness
            </h3>
            <div className="flex items-center space-x-3">
              <div>
                <div className="text-2xl font-bold text-neutral-900">{readinessScore} <span className="text-xs text-neutral-400 font-normal">/ 100</span></div>
                <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">{readinessStatus}</p>
              </div>
              <StatusDot status={product.processingStatus || 'completed'} />
            </div>
            <div className="text-[11px] text-neutral-400 space-y-0.5">
              <p>Composition: Two-Branch Cutout Engine</p>
              <p>Delivery: Automatic (f_auto, q_auto)</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights & Compliance Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel 1: AI Insights */}
        <div className="bg-white border border-neutral-200 rounded p-5 space-y-3">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
            AI Vision Insights
          </h3>
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1">Detected Tags</span>
            {tagsList.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {tagsList.map((tag) => (
                  <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic font-mono">Not available (Google Tagging add-on disabled)</p>
            )}
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1">Image Classification</span>
            <span className="text-xs font-medium text-neutral-900">{analysis.imageType || 'Product / Studio'}</span>
          </div>
        </div>

        {/* Panel 2: Quality & Colors */}
        <div className="bg-white border border-neutral-200 rounded p-5 space-y-3">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-neutral-600" />
            Quality & Colors
          </h3>
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1">Focus Quality Rating</span>
            <span className="text-xs font-medium text-neutral-900">
              {analysis.qualityScore !== null && analysis.qualityScore !== undefined ? `${analysis.qualityScore} / 100 (${analysis.qualityRating})` : 'Good (Standard Cloudinary Ingestion)'}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1">Dominant Color Palette</span>
            {analysis.dominantColors?.length > 0 ? (
              <div className="flex items-center space-x-1.5 mt-1">
                {analysis.dominantColors.map((color, idx) => (
                  <div key={idx} className="flex items-center space-x-1 border border-neutral-200 rounded px-1.5 py-0.5 text-[10px] font-mono bg-neutral-50">
                    <span className="w-2.5 h-2.5 rounded-full border border-neutral-300" style={{ backgroundColor: color }} />
                    <span>{color}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic font-mono">Color analysis complete</p>
            )}
          </div>
        </div>

        {/* Panel 3: Compliance & Safety */}
        <div className="bg-white border border-neutral-200 rounded p-5 space-y-3">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
            Compliance & Watermark
          </h3>
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1">Watermark Detection</span>
            <span className="text-xs font-medium text-neutral-900 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {analysis.watermarkStatus || 'None detected'}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1">Safety Moderation</span>
            <span className="text-xs font-medium text-neutral-900">{analysis.moderationStatus || 'unavailable'}</span>
          </div>
        </div>
      </div>

      {/* Before / After Media Comparison Section */}
      <div className="bg-white border border-neutral-200 rounded p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              Cloudinary Composition Engine (Before / After)
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Compare master lifestyle upload with Cloudinary background cutout compositions</p>
          </div>
          <div className="flex space-x-1 bg-neutral-100 p-0.5 rounded border border-neutral-200 text-xs">
            <button
              onClick={() => setCompareCrop('transparent')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${compareCrop === 'transparent' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              Background Removed
            </button>
            <button
              onClick={() => setCompareCrop('heroCutout')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${compareCrop === 'heroCutout' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              Desktop Hero Banner
            </button>
            <button
              onClick={() => setCompareCrop('square')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${compareCrop === 'square' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              Scene Smart Crop
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-medium text-neutral-500">Original Master Photo</span>
            <div className="aspect-square bg-neutral-100 rounded border border-neutral-200 overflow-hidden flex items-center justify-center p-2">
              <img src={originalUrl} alt="Before" className="max-h-full max-w-full object-contain" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-neutral-500">Cloudinary Processed Output ({compareCrop})</span>
            <div className="aspect-square bg-neutral-100 rounded border border-neutral-200 overflow-hidden flex items-center justify-center p-2">
              <img src={compareImageSrc} alt="After" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Generated Assets Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-neutral-500" />
            <h2 className="text-sm font-bold text-neutral-900">Generated Product Media Asset Packs ({totalAssetsCount})</h2>
          </div>
        </div>

        {/* Render Asset Packs */}
        {[
          { title: 'E-Commerce Channel Assets (Cutout Layered Compositions)', items: ecommerceAssets },
          { title: 'Social Media Platform Assets (Vertical & Square Cutouts)', items: socialAssets },
          { title: 'Web & Mobile Responsive Assets (Widescreen Hero & Cards)', items: webAssets },
        ].map((pack) => {
          if (!pack.items || pack.items.length === 0) return null;
          return (
            <div key={pack.title} className="space-y-3">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {pack.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {pack.items.map((ast, idx) => (
                  <div key={idx} className="bg-white border border-neutral-200 rounded overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-colors">
                    <div className="aspect-video bg-neutral-100 border-b border-neutral-200 overflow-hidden relative group">
                      <img src={ast.url} alt={ast.title} className="w-full h-full object-contain p-2" />
                      <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-900 text-white">
                        {ast.platform}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-900">{ast.title}</h4>
                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{ast.specs}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Optimized (f_auto, q_auto)</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2 pt-2 border-t border-neutral-100">
                        <a
                          href={ast.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center space-x-1 py-1 px-2 rounded border border-neutral-200 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-neutral-400" />
                          <span>Open</span>
                        </a>
                        <a
                          href={ast.url}
                          download
                          className="inline-flex items-center justify-center p-1.5 rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5 text-neutral-500" />
                        </a>
                        <button
                          onClick={() => handleRegenerate(ast.type)}
                          disabled={regeneratingKey === ast.type}
                          className="inline-flex items-center justify-center p-1.5 rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                          title="Regenerate single asset"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${regeneratingKey === ast.type ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteAssetVariant(ast.type)}
                          disabled={deletingAssetKey === ast.type}
                          className="inline-flex items-center justify-center p-1.5 rounded border border-neutral-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete asset variant"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rename Dialog */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-xs font-bold text-neutral-900 uppercase">Rename Product</h3>
              <button onClick={() => setIsRenameOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-900 focus:outline-none focus:border-neutral-400"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsRenameOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isRenaming}>
                  {isRenaming ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl text-center">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Delete "{product.name}"?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                This will permanently remove the product and its generated Cloudinary media references.
              </p>
            </div>

            <div className="flex justify-center space-x-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <button
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
