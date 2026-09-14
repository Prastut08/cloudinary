import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, ExternalLink, Download, ArrowLeft, Layers, AlertCircle,
  Loader2, CheckCircle2, RefreshCw, Check, Filter, Image as ImageIcon
} from 'lucide-react';
import { Button, Badge } from '../components/ui/UI';
import { fetchProducts, fetchProductById, generateSocialFormatsAPI, downloadProductZipArchive } from '../services/api';

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

  const filteredAssets = socialFactoryAssets.filter((ast) => {
    if (activeCategoryFilter === 'All') return true;
    return (ast.category || 'Social').toLowerCase() === activeCategoryFilter.toLowerCase();
  });

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="border-b border-amber-900/20 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Content Factory Suite
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            "One upload. Every format." Automatically generate platform-ready media variants powered by Cloudinary.
          </p>
        </div>

        {selectedProduct && (
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => handleGenerateFormats(null)}
              disabled={generating || selectedFormatKeys.length === 0}
              variant="primary"
              size="md"
              className="gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  <span>Preparing Formats...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>Generate All Formats</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleDownloadAllZip}
              disabled={isDownloadingZip}
              variant="secondary"
              size="md"
              className="gap-2"
            >
              {isDownloadingZip ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Preparing ZIP...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-stone-400" />
                  <span>Download All ZIP</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-3 glass-panel rounded-2xl">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span>Loading product catalog for Social Factory...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 border border-amber-900/20">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-amber-900/30 flex items-center justify-center mx-auto text-amber-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No content yet</h3>
            <p className="text-xs text-stone-400 mt-1">
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
          <div className="glass-panel rounded-2xl p-6 space-y-6 border border-amber-900/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/20 pb-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1 font-mono tracking-widest">
                  Select Master Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="px-4 py-2 bg-stone-900 border border-amber-900/30 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-amber-500/60"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-stone-400 font-mono bg-stone-900 px-3 py-1.5 rounded-xl border border-amber-900/30">
                Source: Master Upload + Cloudinary Cutout Engine
              </span>
            </div>

            {selectedProduct && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4 bg-stone-900/60 border border-amber-900/30 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-bold uppercase text-stone-400 font-mono block tracking-wider">
                    Original Product Source
                  </span>
                  <div className="aspect-square bg-stone-950 rounded-xl border border-amber-900/30 overflow-hidden flex items-center justify-center p-3">
                    <img
                      src={selectedProduct.originalAsset?.url}
                      alt={selectedProduct.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedProduct.name}</h3>
                    <p className="text-xs text-stone-400">{selectedProduct.category}</p>
                  </div>
                </div>

                <div className="md:col-span-8 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-2 font-mono">
                      Smart Presets
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {SMART_PACKS.map((pack) => (
                        <button
                          key={pack.id}
                          type="button"
                          onClick={() => applyPackPreset(pack.keys)}
                          className="px-3 py-1.5 text-[10px] font-mono font-bold rounded-xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors"
                        >
                          {pack.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-900/20">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Select Formats to Generate
                    </span>
                    <div className="space-x-3 text-[11px] font-medium">
                      <button
                        onClick={() => setSelectedFormatKeys(FORMAT_PRESETS.map((p) => p.key))}
                        className="text-amber-400 hover:text-amber-300 underline"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedFormatKeys([])}
                        className="text-stone-400 hover:text-white underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-stone-900/60 p-4 rounded-2xl border border-amber-900/30 text-xs">
                    {FORMAT_PRESETS.map((preset) => (
                      <label
                        key={preset.key}
                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-stone-800/60 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFormatKeys.includes(preset.key)}
                          onChange={() => toggleFormatKey(preset.key)}
                          className="rounded border-amber-900/40 text-amber-500 focus:ring-amber-400 bg-stone-950"
                        />
                        <span className="font-semibold text-stone-200">{preset.name}</span>
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
          <div className="flex items-center justify-between border-b border-amber-900/20 pb-3">
            <h2 className="text-base font-bold text-white">
              Generated Social Media Formats ({socialFactoryAssets.length})
            </h2>
            <div className="flex space-x-1.5 bg-stone-900/80 p-1 rounded-xl border border-amber-900/30 text-xs">
              {['All', 'Social', 'Web', 'Profile'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    activeCategoryFilter === cat
                      ? 'luxury-gradient-bg text-stone-950 font-bold shadow-sm'
                      : 'text-stone-400 hover:text-white'
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
                  className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all border border-amber-900/20"
                >
                  <div className="aspect-square bg-stone-950 border-b border-amber-900/20 relative overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={ast.url}
                      alt={ast.title}
                      className="max-h-full max-w-full object-contain"
                    />
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-stone-900/90 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                      {ast.platform}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">{ast.title}</h3>
                      <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                        {ast.specs} · {(ast.format || 'jpg').toUpperCase()}
                      </p>
                      <p className="text-[10px] text-amber-400/80 mt-0.5 font-mono">Optimized (f_auto, q_auto)</p>
                    </div>

                    <div className="flex items-center space-x-2 pt-3 border-t border-amber-900/20">
                      <a
                        href={ast.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-amber-900/30 text-xs font-semibold text-stone-300 hover:bg-stone-800 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                        <span>Open</span>
                      </a>
                      <a
                        href={ast.url}
                        download
                        className="inline-flex items-center justify-center p-2 rounded-xl luxury-gradient-button text-stone-950"
                        title="Download Format"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleRegenerateSingleFormat(ast.type)}
                        disabled={regeneratingKey === ast.type}
                        className="p-2 rounded-xl border border-amber-900/30 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors disabled:opacity-50"
                        title="Regenerate single format"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${
                            regeneratingKey === ast.type ? 'animate-spin text-amber-400' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 border border-amber-900/20">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-amber-900/30 flex items-center justify-center mx-auto text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No formats generated yet</h3>
                <p className="text-xs text-stone-400 mt-1">
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
