import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Layers, CheckCircle2, Clock, UploadCloud, ArrowRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button, StatusDot } from '../components/ui/UI';
import { useAuth } from '../context/AuthContext';
import { fetchProducts } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Compute real user statistics
  const totalProducts = products.length;
  const totalAssets = products.reduce((acc, p) => {
    const ecoCount = p.assets?.ecommerce?.length || 0;
    const socCount = p.assets?.social?.length || 0;
    const webCount = p.assets?.web?.length || 0;
    return acc + ecoCount + socCount + webCount + (p.originalAsset ? 1 : 0);
  }, 0);
  const processingCount = products.filter(p => p.processingStatus === 'processing' || p.processingStatus === 'uploading').length;
  const readyCount = products.filter(p => p.processingStatus === 'completed' || p.processingStatus === 'partial').length;

  const statCards = [
    { label: 'Products', value: totalProducts, icon: Package, note: 'User catalog' },
    { label: 'Generated Assets', value: totalAssets, icon: Layers, note: 'Cloudinary processed media' },
    { label: 'Ready Assets', value: readyCount, icon: CheckCircle2, note: 'Processed & available' },
    { label: 'Processing', value: processingCount, icon: Clock, note: 'Active operations' },
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Welcome, {currentUser?.email?.split('@')[0] || 'Merchant'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your product media and generated assets across all channels.
          </p>
        </div>
        <Button onClick={() => navigate('/upload')} size="md" className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Upload Product</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-neutral-200 rounded p-5">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-medium text-neutral-500">{card.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-neutral-900 tracking-tight">{card.value}</div>
                <div className="text-[11px] text-neutral-400 font-normal mt-0.5">{card.note}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Upload Action */}
      <div className="bg-white border border-neutral-200 rounded p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Transform a new product image</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Upload a raw photo to run Cloudinary background removal & smart cropping.</p>
          </div>
        </div>
        <Button onClick={() => navigate('/upload')} variant="secondary" size="md">
          Upload Product
        </Button>
      </div>

      {/* Products Section */}
      <div className="bg-white border border-neutral-200 rounded overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Your Product Catalog</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Media assets uploaded to your account</p>
          </div>
          {products.length > 0 && (
            <Button onClick={() => navigate('/products')} variant="ghost" size="sm" className="gap-1 text-neutral-600">
              <span>View all ({products.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
            <span>Loading user products from database...</span>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-neutral-500 font-medium">
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.originalAsset?.url}
                          alt={product.name}
                          className="w-9 h-9 rounded object-cover border border-neutral-200 shrink-0"
                        />
                        <div>
                          <div className="font-medium text-neutral-900">{product.name}</div>
                          <div className="text-[10px] font-mono text-neutral-400">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 font-normal text-neutral-600">{product.category}</td>
                    <td className="py-3 px-6">
                      <StatusDot status={product.processingStatus || 'completed'} />
                    </td>
                    <td className="py-3 px-6 text-right font-medium text-neutral-900">
                      <span className="hover:underline">View details →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty Catalog State */
          <div className="p-12 text-center max-w-sm mx-auto space-y-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">No products yet</h4>
              <p className="text-xs text-neutral-500 mt-1">
                Upload your first product to start generating commerce assets.
              </p>
            </div>
            <Button onClick={() => navigate('/upload')} size="sm">
              Upload Product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
