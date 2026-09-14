import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ExternalLink, Download, FolderSearch, Loader2, Filter,
  X, Tag, Eye, Info, RefreshCw, AlertCircle, ArrowUpRight, Sparkles
} from 'lucide-react';
import { searchAssets, fetchProducts } from '../services/api';
import { Button, Badge } from '../components/ui/UI';

export default function AssetLibrary() {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedAssetType, setSelectedAssetType] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Data & UI State
  const [assets, setAssets] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Asset Detail Modal State
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Debounce search query input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load product list for product filter dropdown
  useEffect(() => {
    fetchProducts()
      .then((res) => {
        if (res && res.data) setUserProducts(res.data);
      })
      .catch((err) => console.warn('Could not fetch products for filter:', err.message));
  }, []);

  // Execute server-side Cloudinary Search + Firestore query
  const performSearch = useCallback(async () => {
    setLoading(true);
    setSearchError(null);
    try {
      const res = await searchAssets({
        q: debouncedQuery,
        category: selectedAssetType,
        platform: selectedPlatform,
        productId: selectedProduct,
      });

      if (res && res.data) {
        let fetched = res.data;

        if (selectedFormat !== 'All') {
          fetched = fetched.filter(
            (ast) => (ast.format || '').toLowerCase() === selectedFormat.toLowerCase()
          );
        }

        fetched.sort((a, b) => {
          if (sortBy === 'oldest') {
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          }
          if (sortBy === 'product') {
            return a.productName.localeCompare(b.productName);
          }
          if (sortBy === 'type') {
            return a.type.localeCompare(b.type);
          }
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        setAssets(fetched);
        setTotalCount(fetched.length);
      }
    } catch (err) {
      console.error('Search request failed:', err);
      setSearchError(err.message || 'Unable to search assets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedAssetType, selectedPlatform, selectedProduct, selectedFormat, sortBy]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedAssetType('All');
    setSelectedPlatform('All');
    setSelectedProduct('All');
    setSelectedFormat('All');
    setSortBy('newest');
  };

  const assetTypeOptions = ['All', 'E-commerce', 'Social', 'Web'];
  const platformOptions = [
    'All',
    'Marketplace',
    'Instagram',
    'Instagram Story',
    'Website',
    'Mobile',
  ];
  const formatOptions = ['All', 'jpg', 'png', 'webp'];

  const hasActiveFilters =
    searchQuery ||
    selectedAssetType !== 'All' ||
    selectedPlatform !== 'All' ||
    selectedProduct !== 'All' ||
    selectedFormat !== 'All' ||
    sortBy !== 'newest';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-amber-900/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Media Library</h1>
          <p className="text-xs text-stone-400 mt-1">
            Search, filter, and manage high-res transformed media assets powered by Cloudinary.
          </p>
        </div>
        <div className="text-xs text-stone-300 font-mono bg-stone-900 px-4 py-2 rounded-xl border border-amber-900/30 self-start sm:self-auto flex items-center space-x-2">
          <span className="text-stone-500">Total Assets:</span>
          <span className="font-bold text-amber-400">{totalCount}</span>
        </div>
      </div>

      {/* Search Bar & Controls Bar */}
      <div className="glass-panel rounded-2xl p-5 space-y-4 border border-amber-900/20">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search products, tags, platforms (e.g. shoe, Instagram, marketplace)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-stone-900/90 border border-amber-900/30 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-stone-400 shrink-0 font-mono">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 bg-stone-900 border border-amber-900/30 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500/60"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="product">By Product Name</option>
              <option value="type">By Asset Type</option>
            </select>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-amber-900/20 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1 font-mono tracking-widest">
              Asset Type
            </label>
            <select
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.target.value)}
              className="w-full px-3 py-2 bg-stone-900 border border-amber-900/30 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500/60"
            >
              {assetTypeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1 font-mono tracking-widest">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-stone-900 border border-amber-900/30 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500/60"
            >
              {platformOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1 font-mono tracking-widest">
              Product Filter
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 bg-stone-900 border border-amber-900/30 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500/60"
            >
              <option value="All">All Products ({userProducts.length})</option>
              {userProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1 font-mono tracking-widest">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 bg-stone-900 border border-amber-900/30 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500/60"
            >
              {formatOptions.map((opt) => (
                <option key={opt} value={opt}>{opt.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-amber-900/20">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-stone-400 font-medium font-mono">Active filters:</span>
              {debouncedQuery && (
                <Badge variant="gold">Query: "{debouncedQuery}"</Badge>
              )}
              {selectedAssetType !== 'All' && (
                <Badge variant="gold">Type: {selectedAssetType}</Badge>
              )}
              {selectedPlatform !== 'All' && (
                <Badge variant="gold">Platform: {selectedPlatform}</Badge>
              )}
            </div>

            <button
              onClick={handleClearFilters}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Grid Container */}
      {loading ? (
        <div className="p-16 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-3 glass-panel rounded-2xl">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span>Searching Cloudinary media vault...</span>
        </div>
      ) : searchError ? (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 border border-red-900/40">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white">Unable to search assets</h3>
            <p className="text-xs text-stone-400 mt-1">{searchError}</p>
          </div>
          <Button onClick={performSearch} variant="secondary" size="sm">
            Try Again
          </Button>
        </div>
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all border border-amber-900/20"
            >
              {/* Asset Preview Container */}
              <div className="aspect-square bg-stone-950 border-b border-amber-900/20 relative overflow-hidden group flex items-center justify-center p-3">
                <img
                  src={asset.url}
                  alt={asset.title}
                  className="max-h-full max-w-full object-contain"
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-stone-900/90 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                  {asset.platform}
                </span>
                <button
                  onClick={() => setSelectedAsset(asset)}
                  className="absolute inset-0 bg-stone-950/85 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-2"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Inspect Metadata</span>
                </button>
              </div>

              {/* Asset Metadata Content */}
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-[10px] text-amber-400 uppercase font-bold tracking-widest font-mono">
                    {asset.productName}
                  </div>
                  <h3 className="text-xs font-bold text-white mt-0.5 truncate">
                    {asset.title}
                  </h3>
                  <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                    {asset.specs} · {asset.format.toUpperCase()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-3 border-t border-amber-900/20">
                  <button
                    onClick={() => setSelectedAsset(asset)}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-amber-900/30 text-xs font-semibold text-stone-300 hover:bg-stone-800 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-stone-400" />
                    <span>Inspect</span>
                  </button>
                  <a
                    href={asset.url}
                    download
                    className="inline-flex items-center justify-center p-2 rounded-xl luxury-gradient-button text-stone-950"
                    title="Download Asset"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 border border-amber-900/20">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-amber-900/30 flex items-center justify-center mx-auto text-amber-400">
            <FolderSearch className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No assets found</h3>
            <p className="text-xs text-stone-400 mt-1">
              Try modifying your search or upload a new product.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Asset Metadata Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-amber-900/30">
            <div className="flex items-start justify-between border-b border-amber-900/20 pb-4">
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-bold font-mono tracking-widest">
                  Cloudinary Metadata
                </span>
                <h2 className="text-lg font-bold text-white">{selectedAsset.title}</h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Source: <span className="font-semibold text-stone-200">{selectedAsset.productName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-stone-950 rounded-xl border border-amber-900/30 flex items-center justify-center p-4">
              <img
                src={selectedAsset.url}
                alt={selectedAsset.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-stone-900/60 p-4 rounded-xl border border-amber-900/30">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Platform</span>
                <span className="font-bold text-white">{selectedAsset.platform}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Asset Type</span>
                <span className="font-bold text-white">{selectedAsset.type}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Format</span>
                <span className="font-bold text-white">{selectedAsset.format.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Dimensions</span>
                <span className="font-mono text-amber-300 font-bold">{selectedAsset.specs}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Public ID</span>
                <span className="font-mono text-stone-300 text-[11px] truncate block" title={selectedAsset.publicId}>
                  {selectedAsset.publicId || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-amber-900/20">
              <button
                onClick={() => {
                  const pId = selectedAsset.productId;
                  setSelectedAsset(null);
                  navigate(`/products/${pId}`);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl border border-amber-900/30 text-xs font-semibold text-stone-300 hover:bg-stone-800 transition-colors"
              >
                <span>View Product Showcase</span>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <a
                  href={selectedAsset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl border border-amber-900/30 text-xs font-semibold text-stone-300 hover:bg-stone-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                  <span>Open URL</span>
                </a>
                <a
                  href={selectedAsset.url}
                  download
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2 rounded-xl luxury-gradient-button text-stone-950 font-bold text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
