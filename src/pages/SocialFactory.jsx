import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, ExternalLink, Download, ArrowLeft, Layers, AlertCircle,
  Loader2, CheckCircle2, RefreshCw, Check, Filter, Image as ImageIcon
} from 'lucide-react';
import { Button, Badge } from '../components/ui/UI';
import { fetchProducts, fetchProductById, generateSocialFormatsAPI, regenerateSingleAsset, downloadProductZipArchive } from '../services/api';

export default function SocialFactory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productIdParam = searchParams.get('product');

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(productIdParam || '');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [regeneratingKey, setRegeneratingKey] = useState(null);

  // Checkbox state for selective format generation
  const FORMAT_PRESETS = [
    { key: 'instagramPost', name: 'Instagram Post (1:1)', category: 'Social', defaultChecked: true },
    { key: 'instagramPortrait', name: 'Instagram Portrait (4:5)', category: 'Social', defaultChecked: true },
    { key: 'instagramStory', name: 'Instagram Story / TikTok (9:16)', category: 'Social', defaultChecked: true },
    { key: 'youtubeThumbnail', name: 'YouTube Thumbnail (16:9)', category: 'Social', defaultChecked: true },
    { key: 'socialSquare', name: 'Generic Social Square (1:1)', category: 'Social', defaultChecked: true },
    { key: 'socialLandscape', name: 'Social Landscape Share (1.91:1)', category: 'Social', defaultChecked: true },
    { key: 'websiteDesktop', name: 'Website Desktop Hero Banner', category: 'Web', defaultChecked: true },
    { key: 'websiteMobile', name: 'Website Mobile Banner', category: 'Web', defaultChecked: true },
    { key: 'profile', name: 'Profile / Avatar Thumbnail', category: 'Profile', defaultChecked: true },
  ];

  const SMART_PACKS = [
    { id: 'all', name: 'ALL FORMATS', keys: FORMAT_PRESETS.map((p) => p.key) },
    { id: 'social', name: 'SOCIAL PACK', keys: ['instagramPost', 'instagramPortrait', 'instagramStory', 'youtubeThumbnail', 'socialSquare', 'socialLandscape'] },
    { id: 'web', name: 'WEB PACK', keys: ['websiteDesktop', 'websiteMobile'] },
    { id: 'personal', name: 'PERSONAL PACK', keys: ['profile', 'socialSquare'] },
    { id: 'commerce', name: 'COMMERCE PACK', keys: ['instagramPost', 'socialSquare', 'websiteMobile'] },
  ];

  const applyPackPreset = (packKeys) => {
    setSelectedFormatKeys(packKeys);
  };

  const [selectedFormatKeys, setSelectedFormatKeys] = useState(
    FORMAT_PRESETS.map((p) => p.key)
  );

  // Load product catalog for selector
  useEffect(() => {
    fetchProducts()
      .then((res) => {
        if (res && res.data) {
          setProducts(res.data);
          if (!selectedProductId && res.data.length > 0) {
            setSelectedProductId(res.data[0].id);
          }
        }
      })
      .catch((err) => console.warn('Could not load products for social factory:', err.message))
      .finally(() => setLoading(false));
  }, []);

  // Fetch full details of selected product when ID changes
  useEffect(() => {
    if (!selectedProductId) return;
    setLoading(true);
    fetchProductById(selectedProductId)
      .then((res) => {
        if (res && res.data) setSelectedProduct(res.data);
      })
      .catch((err) => console.warn('Could not load selected product:', err.message))
      .finally(() => setLoading(false));
  }, [selectedProductId]);

  const toggleFormatKey = (key) => {
    setSelectedFormatKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleGenerateFormats = async (keysToGenerate = null) => {
    if (!selectedProductId) return;
    setGenerating(true);
    const targetKeys = keysToGenerate || selectedFormatKeys;
    try {
      const res = await generateSocialFormatsAPI(selectedProductId, targetKeys);
      if (res && res.allSocialFactoryAssets) {
        setSelectedProduct((prev) => {
          if (!prev) return prev;
          const updated = { ...prev };
          if (!updated.assets) updated.assets = {};
          updated.assets.socialFactory = res.allSocialFactoryAssets;
          return updated;
        });
      }
    } catch (err) {
      alert(err.message || 'Format generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateSingleFormat = async (variantKey) => {
    setRegeneratingKey(variantKey);
    try {
      await handleGenerateFormats([variantKey]);
    } catch (err) {
      alert(err.message || 'Regeneration failed');
    } finally {
      setRegeneratingKey(null);
    }
  };

  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleDownloadAllZip = async () => {
    if (!selectedProductId || !selectedProduct) return;
    setIsDownloadingZip(true);
    try {
      await downloadProductZipArchive(selectedProductId, selectedProduct.name);
    } catch (err) {
      alert(err.message || 'ZIP download failed');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const socialFactoryAssets = selectedProduct?.assets?.socialFactory || [];

  // Group assets by category
  const filteredAssets = socialFactoryAssets.filter((ast) => {
    if (activeCategoryFilter === 'All') return true;
    return (ast.category || 'Social').toLowerCase() === activeCategoryFilter.toLowerCase();
  });

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="border-b border-neutral-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neutral-900" />
            Smart Social Media Content Factory
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            "One upload. Every format." Automatically generate platform-ready media variants powered by Cloudinary.
          </p>
        </div>

        {selectedProduct && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleGenerateFormats(null)}
              disabled={generating || selectedFormatKeys.length === 0}
              variant="primary"
              size="md"
              className="gap-1.5"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Formats...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate All Formats</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleDownloadAllZip}
              disabled={isDownloadingZip}
              variant="secondary"
              size="md"
              className="gap-1.5"
            >
              {isDownloadingZip ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing ZIP...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download All Formats</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-neutral-500 flex flex-col items-center justify-center gap-3 bg-white border border-neutral-200 rounded">
          <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
          <span>Loading product catalog for Social Factory...</span>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-neutral-200 rounded p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">No content yet</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Upload a product to generate social and web media formats automatically.
            </p>
          </div>
          <Button onClick={() => navigate('/upload')} size="sm">
            Upload Product
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Selector & Product Master Card */}
          <div className="bg-white border border-neutral-200 rounded p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-neutral-400 mb-1">
                  Select Master Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-900 font-semibold focus:outline-none focus:border-neutral-400"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-neutral-400 font-mono">
                Source: Master Upload + Cloudinary Cutout Engine
              </span>
            </div>

            {selectedProduct && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Original Preview */}
                <div className="md:col-span-4 bg-neutral-50 border border-neutral-200 rounded p-4 space-y-3">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 font-mono block">
                    Original Product Source
                  </span>
                  <div className="aspect-square bg-white rounded border border-neutral-200 overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={selectedProduct.originalAsset?.url}
                      alt={selectedProduct.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900">{selectedProduct.name}</h3>
                    <p className="text-[11px] text-neutral-500">{selectedProduct.category}</p>
                  </div>
                </div>

                {/* Preset Format Checkboxes & Smart Packs */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                      Smart Presets
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {SMART_PACKS.map((pack) => (
                        <button
                          key={pack.id}
                          type="button"
                          onClick={() => applyPackPreset(pack.keys)}
                          className="px-2.5 py-1 text-[10px] font-mono font-semibold rounded border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 transition-colors"
                        >
                          {pack.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="text-xs font-bold text-neutral-900 uppercase">
                      Select Formats to Generate
                    </span>
                    <div className="space-x-3 text-[11px] font-medium">
                      <button
                        onClick={() => setSelectedFormatKeys(FORMAT_PRESETS.map((p) => p.key))}
                        className="text-neutral-600 hover:text-neutral-900 underline"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedFormatKeys([])}
                        className="text-neutral-600 hover:text-neutral-900 underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-neutral-50 p-4 rounded border border-neutral-200 text-xs">
                    {FORMAT_PRESETS.map((preset) => (
                      <label
                        key={preset.key}
                        className="flex items-center space-x-2 p-1.5 rounded hover:bg-white transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFormatKeys.includes(preset.key)}
                          onChange={() => toggleFormatKey(preset.key)}
                          className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                        />
                        <span className="font-medium text-neutral-800">{preset.name}</span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={() => handleGenerateFormats(null)}
                      disabled={generating || selectedFormatKeys.length === 0}
                      size="sm"
                    >
                      {generating ? 'Processing...' : `Generate Selected (${selectedFormatKeys.length})`}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h2 className="text-sm font-bold text-neutral-900">
              Generated Social Media Formats ({socialFactoryAssets.length})
            </h2>
            <div className="flex space-x-1 bg-neutral-100 p-0.5 rounded border border-neutral-200 text-xs">
              {['All', 'Social', 'Web', 'Profile'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    activeCategoryFilter === cat
                      ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Generated Formats Grid */}
          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((ast) => (
                <div
                  key={ast.type}
                  className="bg-white border border-neutral-200 rounded-lg overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-colors shadow-xs"
                >
                  <div className="aspect-square bg-neutral-100 border-b border-neutral-200 relative overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={ast.url}
                      alt={ast.title}
                      className="max-h-full max-w-full object-contain"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-900 text-white">
                      {ast.platform}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-xs font-bold text-neutral-900">{ast.title}</h3>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {ast.specs} · {(ast.format || 'jpg').toUpperCase()}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Optimized (f_auto, q_auto)</p>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t border-neutral-100">
                      <a
                        href={ast.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-3 rounded border border-neutral-200 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Open</span>
                      </a>
                      <a
                        href={ast.url}
                        download
                        className="inline-flex items-center justify-center p-2 rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                        title="Download Format"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleRegenerateSingleFormat(ast.type)}
                        disabled={regeneratingKey === ast.type}
                        className="p-2 rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                        title="Regenerate single format"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 text-neutral-500 ${
                            regeneratingKey === ast.type ? 'animate-spin' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">No formats generated yet</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Click "Generate All Formats" above to build Instagram, YouTube, and website media variants instantly.
                </p>
              </div>
              <Button onClick={() => handleGenerateFormats(null)} size="sm">
                Generate Formats Now
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
