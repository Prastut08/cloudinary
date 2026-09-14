import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Layers, CheckCircle2, Clock, UploadCloud, ArrowRight, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button, StatusDot, Badge } from '../components/ui/UI';
import { useAuth } from '../context/AuthContext';
import { fetchProducts } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then((res) => {
        if (res && res.data) {
          setProducts(res.data);
        }
      })
      .catch((err) => {
        console.warn('Dashboard fetch notice:', err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute stats
  const totalProducts = products.length;
  const totalAssets = products.reduce((acc, p) => {
    const ecoCount = p.assets?.ecommerce?.length || 0;
    const socCount = p.assets?.social?.length || 0;
    const webCount = p.assets?.web?.length || 0;
    const facCount = p.assets?.socialFactory?.length || 0;
    return acc + ecoCount + socCount + webCount + facCount + (p.originalAsset ? 1 : 0);
  }, 0);
  const processingCount = products.filter(p => p.processingStatus === 'processing' || p.processingStatus === 'uploading').length;
  const readyCount = products.filter(p => p.processingStatus === 'completed' || p.processingStatus === 'partial').length;

  const statCards = [
    { label: 'Media Items', value: totalProducts, icon: Package, note: 'Uploaded master media', badge: 'Primary' },
    { label: 'Transformed Formats', value: totalAssets, icon: Layers, note: 'Cloudinary outputs', badge: '+100%' },
    { label: 'Ready Content', value: readyCount, icon: CheckCircle2, note: 'Export ready', badge: 'Live' },
    { label: 'Active Processing', value: processingCount, icon: Clock, note: 'Cloudinary jobs', badge: 'Realtime' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative glass-panel-luxury rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl border border-amber-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight font-heading">
              One Upload. <span className="luxury-gradient-text">Every High-End Format.</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Transform any photo into instant multi-platform social media, web banners, and e-commerce assets with automated background removal and smart gravity cropping.
            </p>
          </div>
          <Button onClick={() => navigate('/upload')} size="lg" className="gap-2 shrink-0 self-start md:self-auto shadow-xl">
            <Plus className="w-4 h-4" />
            <span>Create Content</span>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-amber-900/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-400 uppercase tracking-wider font-mono">{card.label}</span>
                <div className="w-9 h-9 rounded-xl bg-stone-900 border border-amber-900/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-white tracking-tight">{card.value}</div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-stone-400">{card.note}</span>
                  <Badge variant="gold">{card.badge}</Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Card */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-amber-900/20">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl luxury-gradient-bg flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20 shrink-0">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Transform Any Master Photo</h3>
            <p className="text-xs text-stone-400 mt-1">Upload once to instantly construct social square, story 9:16, desktop web banner & transparent product PNGs.</p>
          </div>
        </div>
        <Button onClick={() => navigate('/upload')} variant="secondary" size="md" className="shrink-0">
          Create Content
        </Button>
      </div>

      {/* Recent Catalog Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-amber-900/20">
        <div className="px-6 py-4 border-b border-amber-900/20 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Recent Master Uploads</h3>
            <p className="text-xs text-stone-400 mt-0.5">Cloudinary media items stored in your workspace</p>
          </div>
          {products.length > 0 && (
            <Button onClick={() => navigate('/products')} variant="ghost" size="sm" className="gap-1.5 text-amber-300 hover:text-amber-200">
              <span>View catalog ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Loading user media from database...</span>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-amber-900/20 bg-stone-900/40 text-stone-400 font-semibold font-mono uppercase text-[10px]">
                  <th className="py-3.5 px-6">Media Item</th>
                  <th className="py-3.5 px-6">Classification</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/20 text-stone-300">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="hover:bg-stone-900/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-stone-900 border border-amber-900/30 overflow-hidden shrink-0 flex items-center justify-center">
                          <img
                            src={product.originalAsset?.url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-amber-300 transition-colors">{product.name}</div>
                          <div className="text-[10px] font-mono text-stone-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge variant="gold">{product.category || 'General Photo'}</Badge>
                    </td>
                    <td className="py-3.5 px-6">
                      <StatusDot status={product.processingStatus || 'completed'} />
                    </td>
                    <td className="py-3.5 px-6 text-right font-medium text-amber-400 group-hover:translate-x-1 transition-transform">
                      <span className="inline-flex items-center space-x-1">
                        <span>View details</span>
                        <span>→</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty Catalog State */
          <div className="p-12 text-center max-w-sm mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-amber-900/30 flex items-center justify-center mx-auto text-amber-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">No content yet</h4>
              <p className="text-xs text-stone-400 mt-1">
                Upload your first image to generate formats for social, web, and personal use.
              </p>
            </div>
            <Button onClick={() => navigate('/upload')} size="sm">
              Create Content
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
