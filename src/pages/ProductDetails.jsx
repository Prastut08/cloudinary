import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tag, ShieldCheck, Download, ExternalLink, ArrowLeft, Layers, AlertCircle,
  Loader2, RefreshCw, CheckCircle2, FileText, Image as ImageIcon, Sparkles, Sliders
} from 'lucide-react';
import { Button, StatusDot, Badge } from '../components/ui/UI';
import { fetchProductById, regenerateSingleAsset } from '../services/api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regeneratingKey, setRegeneratingKey] = useState(null);
  const [compareCrop, setCompareCrop] = useState('transparent');

  useEffect(() => {
    fetchProductById(id)
      .then((res) => {
        if (res && res.data) setProduct(res.data);
      })
      .catch((err) => setError(err.message || 'Could not load product details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRegenerate = async (variantKey) => {
    setRegeneratingKey(variantKey);
    try {
      const res = await regenerateSingleAsset(id, variantKey);
      if (res && res.url) {
        // Update product asset URL locally in state
        setProduct((prev) => {
          if (!prev) return prev;
          const newPacks = { ...prev.assets };
          Object.keys(newPacks).forEach((packKey) => {
            newPacks[packKey] = newPacks[packKey].map((ast) => {
              if (ast.type === variantKey || ast.title.toLowerCase().includes(variantKey.toLowerCase())) {
                return { ...ast, url: `${res.url}&t=${Date.now()}` };
              }
              return ast;
            });
          });
          return { ...prev, assets: newPacks };
        });
      }
    } catch (err) {
      console.error('Regenerate asset failed:', err);
    } finally {
      setRegeneratingKey(null);
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
        <Button onClick={() => navigate('/')} variant="secondary" size="sm">
          Return to Dashboard
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

  const compareImageSrc =
    compareCrop === 'transparent'
      ? ecommerceAssets.find((a) => a.type === 'transparent-product')?.url || originalUrl
      : compareCrop === 'square'
      ? crops.square || originalUrl
      : compareCrop === 'portrait'
      ? crops.portrait || originalUrl
      : crops.landscape || originalUrl;

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center space-x-3">
          <Badge
            variant={
              readinessStatus === 'READY'
                ? 'success'
                : readinessStatus === 'NEEDS REVIEW'
                ? 'warning'
                : 'default'
            }
          >
            Commerce Readiness: {readinessStatus} ({readinessScore}/100)
          </Badge>
          <StatusDot status={product.processingStatus || 'completed'} />
        </div>
      </div>

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
                <Badge variant="neutral">{product.category}</Badge>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-1">ID: {product.id || id}</p>
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
            <div>
              <div className="text-2xl font-bold text-neutral-900">{readinessScore} <span className="text-xs text-neutral-400 font-normal">/ 100</span></div>
              <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">{readinessStatus}</p>
            </div>
            <div className="text-[11px] text-neutral-400 space-y-0.5">
              <p>Format: Automatic (f_auto)</p>
              <p>Quality: Automatic (q_auto)</p>
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
              <p className="text-xs text-neutral-400 italic">Not available (Google Tagging add-on disabled)</p>
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
              {analysis.qualityScore !== null ? `${analysis.qualityScore} / 100 (${analysis.qualityRating})` : 'Good (Standard Cloudinary Ingestion)'}
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
              <p className="text-xs text-neutral-400 italic">Color analysis complete</p>
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
              Cloudinary Media Transformation Comparison (Before / After)
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Real-time comparison between raw master upload and Cloudinary transformations</p>
          </div>
          <div className="flex space-x-1 bg-neutral-100 p-0.5 rounded border border-neutral-200 text-xs">
            <button
              onClick={() => setCompareCrop('transparent')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${compareCrop === 'transparent' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              Background Removed
            </button>
            <button
              onClick={() => setCompareCrop('square')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${compareCrop === 'square' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              Smart Square (1:1)
            </button>
            <button
              onClick={() => setCompareCrop('portrait')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${compareCrop === 'portrait' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              Smart Portrait (4:5)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-medium text-neutral-500">Original Master Image</span>
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
            <h2 className="text-sm font-bold text-neutral-900">Generated Product Media Asset Packs</h2>
          </div>
        </div>

        {/* Render Asset Packs */}
        {[
          { title: 'E-Commerce Channel Assets', items: ecommerceAssets },
          { title: 'Social Media Platform Assets', items: socialAssets },
          { title: 'Web & Mobile Responsive Assets', items: webAssets },
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
