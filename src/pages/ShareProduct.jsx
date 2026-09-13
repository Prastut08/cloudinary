import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, ExternalLink, Download, ArrowLeft, Layers, AlertCircle,
  Loader2, ShieldCheck, Tag, Copy, Check
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
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 text-xs text-neutral-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
        <span>Loading shared product showcase...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-lg p-8 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <div>
            <h2 className="text-base font-bold text-neutral-900">Share Link Unavailable</h2>
            <p className="text-xs text-neutral-500 mt-1">{error || 'This link has expired or does not exist.'}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 transition-colors"
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
    <div className="min-h-screen bg-[#fafafa] text-neutral-900">
      {/* Top Banner Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div>
              <span className="text-xs font-bold tracking-tight text-neutral-900 block">Commerce Content Factory</span>
              <span className="text-[10px] text-neutral-400 font-mono">Public Asset Showcase</span>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-neutral-200 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                <span>Share Showcase</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Product Hero Header */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-36 h-36 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center p-2">
              <img
                src={product.originalAsset?.url}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                  {product.category || 'Commerce Asset'}
                </span>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight mt-0.5">{product.name}</h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Master image and generated platform variants powered by Cloudinary.
                </p>
              </div>

              {tagsList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tagsList.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 font-medium text-neutral-700"
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
              <div className="border-b border-neutral-200 pb-2">
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  {pack.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pack.items.map((ast, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-neutral-200 rounded-lg overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-colors shadow-xs"
                  >
                    <div className="aspect-square bg-neutral-100 border-b border-neutral-200 relative overflow-hidden flex items-center justify-center p-3">
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
                      </div>

                      <div className="flex items-center space-x-2 pt-2 border-t border-neutral-100">
                        <a
                          href={ast.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-3 rounded border border-neutral-200 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-neutral-400" />
                          <span>View Media</span>
                        </a>
                        <a
                          href={ast.url}
                          download
                          className="inline-flex items-center justify-center p-2 rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
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
