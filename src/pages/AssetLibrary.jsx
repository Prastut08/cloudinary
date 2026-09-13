import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ExternalLink, Download, FolderSearch, Loader2, Filter,
  X, Tag, Eye, Info, RefreshCw, AlertCircle, ArrowUpRight
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

        // Client-side format filter if specified
        if (selectedFormat !== 'All') {
          fetched = fetched.filter(
            (ast) => (ast.format || '').toLowerCase() === selectedFormat.toLowerCase()
          );
        }

        // Sorting
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
          // Default: newest
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
      <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Asset Library</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Search and manage your generated commerce media powered by Cloudinary.
          </p>
        </div>
        <div className="text-xs text-neutral-500 font-mono bg-neutral-100 px-3 py-1.5 rounded border border-neutral-200 self-start sm:self-auto">
          Total Assets: <span className="font-bold text-neutral-900">{totalCount}</span>
        </div>
      </div>

      {/* Search Bar & Controls Bar */}
      <div className="bg-white border border-neutral-200 rounded p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products, tags, platforms (e.g. shoe, Instagram, marketplace)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-neutral-400 shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-800 focus:outline-none focus:border-neutral-400"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="product">By Product Name</option>
              <option value="type">By Asset Type</option>
            </select>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-100 text-xs">
          {/* Asset Type Filter */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-400 mb-1">
              Asset Type
            </label>
            <select
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-neutral-800 focus:outline-none focus:border-neutral-400"
            >
              {assetTypeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-400 mb-1">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-neutral-800 focus:outline-none focus:border-neutral-400"
            >
              {platformOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-400 mb-1">
              Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-neutral-800 focus:outline-none focus:border-neutral-400"
            >
              <option value="All">All Products ({userProducts.length})</option>
              {userProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Format Filter */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-400 mb-1">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-neutral-800 focus:outline-none focus:border-neutral-400"
            >
              {formatOptions.map((opt) => (
                <option key={opt} value={opt}>{opt.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-neutral-400 font-medium">Active filters:</span>
              {debouncedQuery && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700">
                  Query: "{debouncedQuery}"
                </span>
              )}
              {selectedAssetType !== 'All' && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700">
                  Type: {selectedAssetType}
                </span>
              )}
              {selectedPlatform !== 'All' && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700">
                  Platform: {selectedPlatform}
                </span>
              )}
              {selectedProduct !== 'All' && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700">
                  Product ID Filter Active
                </span>
              )}
            </div>

            <button
              onClick={handleClearFilters}
              className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Grid / State Container */}
      {loading ? (
        <div className="p-16 text-center text-xs text-neutral-500 flex flex-col items-center justify-center gap-3 bg-white border border-neutral-200 rounded">
          <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
          <span>Searching Cloudinary media catalog...</span>
        </div>
      ) : searchError ? (
        /* CASE 3: Search Request Failed */
        <div className="bg-white border border-neutral-200 rounded p-12 text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Unable to search assets</h3>
            <p className="text-xs text-neutral-500 mt-1">{searchError}</p>
          </div>
          <Button onClick={performSearch} variant="secondary" size="sm">
            Try Again
          </Button>
        </div>
      ) : assets.length > 0 ? (
        /* Asset Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white border border-neutral-200 rounded overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-colors"
            >
              {/* Asset Preview Container */}
              <div className="aspect-square bg-neutral-100 border-b border-neutral-200 relative overflow-hidden group">
                <img
                  src={asset.url}
                  alt={asset.title}
                  className="w-full h-full object-contain p-2"
                />
                <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-900 text-white">
                  {asset.platform}
                </span>
                <button
                  onClick={() => setSelectedAsset(asset)}
                  className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect Metadata</span>
                </button>
              </div>

              {/* Asset Metadata Content */}
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
                    {asset.productName}
                  </div>
                  <h3 className="text-xs font-bold text-neutral-900 mt-0.5 truncate">
                    {asset.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    {asset.specs} · {asset.format.toUpperCase()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => setSelectedAsset(asset)}
                    className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-2.5 rounded border border-neutral-200 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <Info className="w-3 h-3 text-neutral-400" />
                    <span>Open</span>
                  </button>
                  <a
                    href={asset.url}
                    download
                    className="inline-flex items-center justify-center p-1.5 rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
                    title="Download Asset"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-500" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : hasActiveFilters ? (
        /* CASE 2: Assets exist, but search returns nothing */
        <div className="bg-white border border-neutral-200 rounded p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
            <FolderSearch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">No matching assets</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Try a different product name, tag, or platform filter.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleClearFilters}>
            Clear Search Filters
          </Button>
        </div>
      ) : (
        /* CASE 1: No assets exist at all */
        <div className="bg-white border border-neutral-200 rounded p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
            <FolderSearch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">No generated assets yet</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Upload a product to start building your Cloudinary media library.
            </p>
          </div>
          <Button onClick={() => navigate('/upload')} variant="primary" size="sm">
            Upload Product
          </Button>
        </div>
      )}

      {/* Structured Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold font-mono">
                  Asset Details & Metadata
                </span>
                <h2 className="text-base font-bold text-neutral-900">{selectedAsset.title}</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Source Product: <span className="font-semibold text-neutral-800">{selectedAsset.productName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Preview */}
            <div className="aspect-video bg-neutral-100 rounded border border-neutral-200 flex items-center justify-center p-4">
              <img
                src={selectedAsset.url}
                alt={selectedAsset.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Structured Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-neutral-50 p-4 rounded border border-neutral-200">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Platform</span>
                <span className="font-medium text-neutral-900">{selectedAsset.platform}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Asset Type</span>
                <span className="font-medium text-neutral-900">{selectedAsset.type}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Format</span>
                <span className="font-medium text-neutral-900">{selectedAsset.format.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Dimensions</span>
                <span className="font-medium font-mono text-neutral-900">{selectedAsset.specs}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Cloudinary Public ID</span>
                <span className="font-mono text-neutral-700 text-[11px] truncate block" title={selectedAsset.publicId}>
                  {selectedAsset.publicId || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Creation Date</span>
                <span className="text-neutral-700 text-[11px]">
                  {selectedAsset.createdAt ? new Date(selectedAsset.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Tags */}
            {selectedAsset.tags && selectedAsset.tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Searchable AI Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAsset.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200">
              <button
                onClick={() => {
                  const pId = selectedAsset.productId;
                  setSelectedAsset(null);
                  navigate(`/products/${pId}`);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <span>View Product Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <a
                  href={selectedAsset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1 px-3.5 py-2 rounded border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Open in Cloudinary URL</span>
                </a>
                <a
                  href={selectedAsset.url}
                  download
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1 px-4 py-2 rounded bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
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
