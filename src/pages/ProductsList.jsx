import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, renameProduct, deleteProduct } from '../services/api';
import { Button, StatusDot } from '../components/ui/UI';
import { Plus, Image as ImageIcon, Loader2, MoreVertical, Edit2, Trash2, Eye, X } from 'lucide-react';

export default function ProductsList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Dropdown state
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState(null);
  const [newName, setNewName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    fetchProducts()
      .then((res) => {
        if (res && res.data) setProducts(res.data);
      })
      .catch((err) => console.warn('Products list fetch notice:', err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameTarget || !newName.trim()) return;
    setIsRenaming(true);
    try {
      await renameProduct(renameTarget.id, newName.trim());
      setProducts((prev) =>
        prev.map((p) => (p.id === renameTarget.id ? { ...p, name: newName.trim() } : p))
      );
      setRenameTarget(null);
    } catch (err) {
      alert(err.message || 'Failed to rename product');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Product Catalog</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage master product uploads and Cloudinary media channels.
          </p>
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
          {products.map((product) => {
            const assetCount =
              (product.assets?.ecommerce?.length || 0) +
              (product.assets?.social?.length || 0) +
              (product.assets?.web?.length || 0) +
              (product.originalAsset ? 1 : 0);

            return (
              <div
                key={product.id}
                className="bg-white border border-neutral-200 rounded overflow-hidden hover:border-neutral-300 transition-colors flex flex-col justify-between relative group"
              >
                <div
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="aspect-square bg-neutral-100 border-b border-neutral-200 relative overflow-hidden cursor-pointer"
                >
                  <img
                    src={product.originalAsset?.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-neutral-900 text-white">
                    {assetCount} assets
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-400">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : 'Recent'}
                    </span>
                    <StatusDot status={product.processingStatus || 'completed'} />
                  </div>

                  <h3 className="text-xs font-bold text-neutral-900 truncate">{product.name}</h3>
                  <p className="text-[11px] text-neutral-500">{product.category}</p>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="inline-flex items-center space-x-1 text-xs font-medium text-neutral-700 hover:text-neutral-900"
                    >
                      <Eye className="w-3.5 h-3.5 text-neutral-400" />
                      <span>View</span>
                    </button>

                    {/* Dropdown Menu Trigger */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === product.id ? null : product.id);
                        }}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuOpenId === product.id && (
                        <div
                          className="absolute right-0 bottom-full mb-1 w-32 bg-white border border-neutral-200 rounded shadow-md z-20 py-1 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setMenuOpenId(null);
                              setRenameTarget(product);
                              setNewName(product.name);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-neutral-50 flex items-center space-x-2 text-neutral-700"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => {
                              setMenuOpenId(null);
                              setDeleteTarget(product);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center space-x-2 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Rename Dialog */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-xs font-bold text-neutral-900 uppercase">Rename Product</h3>
              <button
                onClick={() => setRenameTarget(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-900 focus:outline-none focus:border-neutral-400"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setRenameTarget(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isRenaming}>
                  {isRenaming ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl text-center">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Delete "{deleteTarget.name}"?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                This will permanently remove the product and its generated Cloudinary media references.
              </p>
            </div>

            <div className="flex justify-center space-x-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <button
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
