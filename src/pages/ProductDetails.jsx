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
      <div className="h-64 flex items-center justify-center text-xs text-stone-400 gap-3 glass-panel rounded-2xl">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        <span>Fetching Cloudinary product media signals...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto p-8 glass-panel rounded-2xl text-center space-y-4 my-12 border border-red-900/40">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-white">Product Not Found</h3>
          <p className="text-xs text-stone-400 mt-1">{error || 'This product does not exist or has been deleted.'}</p>
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
      {/* Navigation & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/20 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-stone-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library</span>
          </button>
          <span className="text-stone-700">|</span>
          <span className="text-xs font-mono text-amber-400/80">ID: {product.id || id}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            variant="primary"
            size="sm"
            className="gap-2"
          >
            {isDownloadingZip ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-950" />
                <span>Preparing ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-stone-950" />
                <span>Download All ({totalAssetsCount})</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleShareProduct}
            disabled={isSharing}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Share Showcase</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => setIsRenameOpen(true)}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            <Edit2 className="w-3.5 h-3.5 text-stone-400" />
            <span>Rename</span>
          </Button>

          <Button
            onClick={() => setIsDeleteOpen(true)}
            variant="danger"
            size="sm"
            className="gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Share Link Banner */}
      {shareUrl && (
        <div className="glass-panel-luxury rounded-2xl p-4 flex items-center justify-between text-xs text-amber-200 border border-amber-500/30">
          <div className="flex items-center space-x-3 truncate">
            <Share2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold shrink-0">Public Showcase Link:</span>
            <span className="font-mono text-amber-300 truncate">{shareUrl}</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              setCopiedShare(true);
              setTimeout(() => setCopiedShare(false), 2000);
            }}
            className="px-3 py-1.5 luxury-gradient-button text-stone-950 font-bold rounded-xl text-xs hover:opacity-90 shrink-0 transition-opacity"
          >
            {copiedShare ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}

      {/* Product Master Overview Card */}
      <div className="glass-panel rounded-2xl p-6 border border-amber-900/20">
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="flex items-center space-x-5">
            <div className="w-28 h-28 rounded-2xl bg-stone-950 border border-amber-900/30 overflow-hidden shrink-0 flex items-center justify-center p-2">
              <img src={originalUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-white tracking-tight">{product.name}</h1>
                <Badge variant="gold">{product.category || 'General Photo'}</Badge>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Transformed Formats: <span className="font-bold text-amber-300">{totalAssetsCount} available</span>
              </p>
              <p className="text-xs text-stone-400">
                Cloudinary Public ID: <span className="font-mono text-stone-300">{product.originalAsset?.publicId || 'N/A'}</span>
              </p>
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-amber-900/20 pt-4 md:pt-0 md:pl-6 space-y-3 min-w-[240px]">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
              Commerce Readiness
            </h3>
            <div className="flex items-center space-x-3">
              <div>
                <div className="text-3xl font-extrabold text-white">{readinessScore} <span className="text-xs text-stone-500 font-normal">/ 100</span></div>
                <p className="text-xs text-emerald-400 mt-0.5 font-semibold">{readinessStatus}</p>
              </div>
              <StatusDot status={product.processingStatus || 'completed'} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights & Quality Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 space-y-3 border border-amber-900/20">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI Vision Insights
          </h3>
          <div>
            <span className="text-[11px] text-stone-400 block mb-1.5 font-mono">Detected Tags</span>
            {tagsList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tagsList.map((tag) => (
                  <Badge key={tag} variant="gold">{tag}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic font-mono">Standard Cloudinary Auto-Tagging</p>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-3 border border-amber-900/20">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            Quality & Optics
          </h3>
          <div>
            <span className="text-[11px] text-stone-400 block mb-1 font-mono">Focus Rating</span>
            <span className="text-xs font-semibold text-white">
              {analysis.qualityScore !== null && analysis.qualityScore !== undefined ? `${analysis.qualityScore} / 100` : 'High Precision Render'}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-3 border border-amber-900/20">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Compliance & Watermark
          </h3>
          <div>
            <span className="text-[11px] text-stone-400 block mb-1 font-mono">Watermark Check</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {analysis.watermarkStatus || 'Clean Composition'}
            </span>
          </div>
        </div>
      </div>

      {/* Before / After Comparison */}
      <div className="glass-panel rounded-2xl p-6 space-y-4 border border-amber-900/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/20 pb-3">
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
              Cloudinary Composition Engine (Before / After)
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Compare master raw upload with transformed Cloudinary cutout assets</p>
          </div>
          <div className="flex space-x-1.5 bg-stone-900 p-1 rounded-xl border border-amber-900/30 text-xs">
            <button
              onClick={() => setCompareCrop('transparent')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${compareCrop === 'transparent' ? 'luxury-gradient-bg text-stone-950 font-bold' : 'text-stone-400 hover:text-white'}`}
            >
              Background Removed
            </button>
            <button
              onClick={() => setCompareCrop('heroCutout')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${compareCrop === 'heroCutout' ? 'luxury-gradient-bg text-stone-950 font-bold' : 'text-stone-400 hover:text-white'}`}
            >
              Desktop Hero
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-400">Master Raw Photo</span>
            <div className="aspect-square bg-stone-950 rounded-2xl border border-amber-900/30 overflow-hidden flex items-center justify-center p-3">
              <img src={originalUrl} alt="Before" className="max-h-full max-w-full object-contain" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-400">Cloudinary Processed Output ({compareCrop})</span>
            <div className="aspect-square bg-stone-950 rounded-2xl border border-amber-900/30 overflow-hidden flex items-center justify-center p-3">
              <img src={compareImageSrc} alt="After" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Asset Packs Display */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Generated Asset Packs ({totalAssetsCount})</h2>
        </div>

        {[
          { title: 'E-Commerce Channel Assets', items: ecommerceAssets },
          { title: 'Social Media Platform Assets', items: socialAssets },
          { title: 'Web & Mobile Assets', items: webAssets },
        ].map((pack) => {
          if (!pack.items || pack.items.length === 0) return null;
          return (
            <div key={pack.title} className="space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
                {pack.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {pack.items.map((ast, idx) => (
                  <div key={idx} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all border border-amber-900/20">
                    <div className="aspect-video bg-stone-950 border-b border-amber-900/20 relative overflow-hidden flex items-center justify-center p-3">
                      <img src={ast.url} alt={ast.title} className="max-h-full max-w-full object-contain" />
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-stone-900/90 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                        {ast.platform}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-white">{ast.title}</h4>
                        <p className="text-[11px] text-stone-400 font-mono mt-0.5">{ast.specs}</p>
                      </div>

                      <div className="flex items-center space-x-2 pt-3 border-t border-amber-900/20">
                        <a
                          href={ast.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl border border-amber-900/30 text-xs font-semibold text-stone-300 hover:bg-stone-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                          <span>Open</span>
                        </a>
                        <a
                          href={ast.url}
                          download
                          className="inline-flex items-center justify-center p-2 rounded-xl luxury-gradient-button text-stone-950"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleRegenerate(ast.type)}
                          disabled={regeneratingKey === ast.type}
                          className="p-2 rounded-xl border border-amber-900/30 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors disabled:opacity-50"
                          title="Regenerate asset"
                        >
                          <RefreshCw className={`w-4 h-4 ${regeneratingKey === ast.type ? 'animate-spin text-amber-400' : ''}`} />
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
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-amber-900/30">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">Rename Product</h3>
              <button onClick={() => setIsRenameOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-900/90 border border-amber-900/30 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
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
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center border border-red-900/40">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 text-red-400 flex items-center justify-center mx-auto border border-red-800/60">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete "{product.name}"?</h3>
              <p className="text-xs text-stone-400 mt-1">
                This will permanently remove the product and its generated Cloudinary media references.
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
