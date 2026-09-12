import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Download, FolderSearch, Loader2 } from 'lucide-react';
import { fetchProducts } from '../services/api';
import { Button } from '../components/ui/UI';

export default function AssetLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
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
        console.warn('Asset library fetch notice:', err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Flatten real Cloudinary assets from user products
  const realAssets = products.flatMap(product => {
    const list = [];
    if (product.originalAsset) {
      list.push({
        id: `${product.id}_orig`,
        productName: product.name,
        name: 'Original Master Image',
        platform: 'Master',
        category: 'E-commerce',
        specs: `${product.originalAsset.width || '1000'} × ${product.originalAsset.height || '1000'}`,
        format: (product.originalAsset.format || 'jpg').toUpperCase(),
        url: product.originalAsset.url
      });
    }

    const ecommerce = product.assets?.ecommerce || [];
    ecommerce.forEach((ast, idx) => {
      list.push({
        id: `${product.id}_eco_${idx}`,
        productName: product.name,
        name: ast.type === 'transparent-product' ? 'Background Removed Cutout' : 'Smart Crop Asset',
        platform: ast.type === 'transparent-product' ? 'Cutout' : 'Crop',
        category: 'E-commerce',
        specs: ast.type === 'transparent-product' ? 'Dynamic Cutout' : '600 × 600 Fill',
        format: (ast.format || 'png').toUpperCase(),
        url: ast.url
      });
    });

    return list;
  });

  const categories = ['All', 'E-commerce'];

  // Filter Assets
  const filteredAssets = realAssets.filter((asset) => {
    const matchesCategory = activeCategory === 'All' || asset.category === activeCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.platform.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Asset Library</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Search and export generated media across all catalog items and platform presets.
        </p>
      </div>

      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products, tags, or assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-neutral-200 rounded text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-1.5 bg-neutral-100 p-1 rounded border border-neutral-200 self-start sm:self-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeCategory === cat
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
          <span>Loading asset library...</span>
        </div>
      ) : filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-white border border-neutral-200 rounded overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-colors">
              <div className="aspect-square bg-neutral-100 border-b border-neutral-200 relative overflow-hidden">
                <img src={asset.url} alt={asset.name} className="w-full h-full object-contain p-2" />
                <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-900 text-white">
                  {asset.platform}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">{asset.productName}</div>
                  <h3 className="text-xs font-bold text-neutral-900 mt-0.5">{asset.name}</h3>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{asset.specs} • {asset.format}</p>
                </div>
                <div className="flex items-center space-x-2 pt-2 border-t border-neutral-100">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center space-x-1 py-1 px-2.5 rounded border border-neutral-200 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                    <span>View</span>
                  </a>
                  <a
                    href={asset.url}
                    download
                    className="inline-flex items-center justify-center p-1.5 rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-500" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty Asset State */
        <div className="bg-white border border-neutral-200 rounded p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
            <FolderSearch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Your generated assets will appear here</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Upload a product image to populate your media library with Cloudinary processed variants.
            </p>
          </div>
          {searchQuery && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            >
              Clear Search Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
