import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import { Button, StatusDot } from '../components/ui/UI';
import { Plus, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ProductsList() {
  const navigate = useNavigate();
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
        console.warn('Products list fetch notice:', err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Product Catalog</h1>
          <p className="text-xs text-neutral-500 mt-1">Manage master product uploads and Cloudinary media channels.</p>
        </div>
        <Button onClick={() => navigate('/upload')} size="md" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Product</span>
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
          <span>Loading catalog...</span>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="bg-white border border-neutral-200 rounded overflow-hidden cursor-pointer hover:border-neutral-300 transition-colors flex flex-col justify-between"
            >
              <div className="aspect-square bg-neutral-100 border-b border-neutral-200 relative overflow-hidden">
                <img src={product.originalAsset?.url} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-400">ID: {product.id}</span>
                  <StatusDot status={product.processingStatus || 'completed'} />
                </div>
                <h3 className="text-xs font-bold text-neutral-900 truncate">{product.name}</h3>
                <p className="text-[11px] text-neutral-500">{product.category}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty Catalog State */
        <div className="bg-white border border-neutral-200 rounded p-12 text-center max-w-md mx-auto space-y-3 my-8">
          <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">No products found</h3>
            <p className="text-xs text-neutral-500 mt-1">
              You haven't uploaded any product images to your account yet.
            </p>
          </div>
          <Button onClick={() => navigate('/upload')} size="sm">
            Upload Product
          </Button>
        </div>
      )}
    </div>
  );
}
