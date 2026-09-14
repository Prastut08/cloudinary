import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, ExternalLink, Download, ArrowLeft, Layers, AlertCircle,
  Loader2, ShieldCheck, Tag, Copy, Check, Flame
} from 'lucide-react';
import { fetchPublicShare } from '../services/api';

export default function ShareProduct() {
  const { shareToken } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPublicShare(shareToken)
      .then((res) => {
        if (res && res.data) setProduct(res.data);
      })
      .catch((err) => setError(err.message || 'Share link is invalid or expired.'))
      .finally(() => setLoading(false));
  }, [shareToken]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6 text-xs text-stone-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        <span>Loading shared product showcase...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6 radial-glow-crimson">
        <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center space-y-4 shadow-2xl border border-red-900/40">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <div>
            <h2 className="text-base font-bold text-white">Share Link Unavailable</h2>
            <p className="text-xs text-stone-400 mt-1">{error || 'This link has expired or does not exist.'}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 luxury-gradient-button text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Go to Platform
          </button>
        </div>
      </div>
    );
  }

  const ecommerceAssets = product.assets?.ecommerce || [];
  const socialAssets = product.assets?.social || [];
  const webAssets = product.assets?.web || [];
  const analysis = product.analysis || {};
  const tagsList = Array.isArray(analysis.tags)
    ? analysis.tags.map((t) => (typeof t === 'string' ? t : t.name))
    : [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 radial-glow-crimson radial-glow-amber selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner Header */}
      <header className="border-b border-amber-900/20 bg-stone-950/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl luxury-gradient-bg flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/20">
              <Flame className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <span className="text-sm font-bold luxury-gradient-text tracking-tight block">Content Factory</span>
              <span className="text-[10px] text-amber-300/90 font-mono uppercase tracking-wider">Public Asset Showcase</span>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-amber-900/30 text-xs font-semibold text-stone-200 bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Share Showcase</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Product Hero Header */}
        <div className="glass-panel rounded-2xl p-6 border border-amber-900/20">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-36 h-36 rounded-2xl bg-stone-950 border border-amber-900/30 overflow-hidden shrink-0 flex items-center justify-center p-3">
              <img
                src={product.originalAsset?.url}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                  {product.category || 'Commerce Asset'}
                </span>
                <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">{product.name}</h1>
                <p className="text-xs text-stone-400 mt-1">
                  Master image and generated platform variants powered by Cloudinary.
                </p>
              </div>

              {tagsList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tagsList.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Asset Packs Showcase */}
        {[
          { title: 'E-Commerce Channel Assets', items: ecommerceAssets },
          { title: 'Social Media Assets', items: socialAssets },
          { title: 'Web & Mobile Assets', items: webAssets },
        ].map((pack) => {
          if (!pack.items || pack.items.length === 0) return null;
          return (
            <div key={pack.title} className="space-y-4">
              <div className="border-b border-amber-900/20 pb-2">
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
                  {pack.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pack.items.map((ast, idx) => (
                  <div
                    key={idx}
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
                      </div>

                      <div className="flex items-center space-x-2 pt-3 border-t border-amber-900/20">
                        <a
                          href={ast.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-amber-900/30 text-xs font-semibold text-stone-300 hover:bg-stone-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                          <span>View Media</span>
                        </a>
                        <a
                          href={ast.url}
                          download
                          className="inline-flex items-center justify-center p-2 rounded-xl luxury-gradient-button text-stone-950"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
