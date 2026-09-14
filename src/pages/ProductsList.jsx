import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, renameProduct, deleteProduct } from '../services/api';
import { Button, StatusDot, Badge } from '../components/ui/UI';
import { Plus, Image as ImageIcon, Loader2, MoreVertical, Edit2, Trash2, Eye, X, Sparkles } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/20 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Generated Content Catalog</h1>
          <p className="text-xs text-stone-400 mt-1">
            Manage master media uploads and Cloudinary multi-channel content formats.
          </p>
        </div>
        <Button onClick={() => navigate('/upload')} size="md" className="gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4 text-stone-950" />
          <span>Create Content</span>
        </Button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-3 glass-panel rounded-2xl">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span>Loading content catalog...</span>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const assetCount =
              (product.assets?.ecommerce?.length || 0) +
              (product.assets?.social?.length || 0) +
              (product.assets?.web?.length || 0) +
              (product.originalAsset ? 1 : 0);

            return (
              <div
                key={product.id}
                className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between relative group border border-amber-900/20"
              >
                <div
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="aspect-square bg-stone-950 border-b border-amber-900/20 relative overflow-hidden cursor-pointer flex items-center justify-center p-3"
                >
                  <img
                    src={product.originalAsset?.url}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-stone-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    {assetCount} assets
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-stone-500">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : 'Recent'}
                    </span>
                    <StatusDot status={product.processingStatus || 'completed'} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">{product.name}</h3>
                    <p className="text-xs text-stone-400 mt-0.5">{product.category}</p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-amber-900/20">
                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    {/* Dropdown Menu Trigger */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === product.id ? null : product.id);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuOpenId === product.id && (
                        <div
                          className="absolute right-0 bottom-full mb-2 w-36 glass-panel rounded-xl shadow-2xl z-20 py-1.5 text-xs border border-amber-900/30"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setMenuOpenId(null);
                              setRenameTarget(product);
                              setNewName(product.name);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-stone-800/80 flex items-center space-x-2 text-stone-200"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-stone-400" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => {
                              setMenuOpenId(null);
                              setDeleteTarget(product);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-red-950/60 text-red-400 flex items-center space-x-2 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
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
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 my-8 border border-amber-900/20">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-amber-900/30 flex items-center justify-center mx-auto text-amber-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No products found</h3>
            <p className="text-xs text-stone-400 mt-1">
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
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-amber-900/30">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">Rename Product</h3>
              <button
                onClick={() => setRenameTarget(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  Product Title
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-900/90 border border-amber-900/30 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/60"
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
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center border border-red-900/40">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 text-red-400 flex items-center justify-center mx-auto border border-red-800/60">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete "{deleteTarget.name}"?</h3>
              <p className="text-xs text-stone-400 mt-1">
                This will permanently remove the product and its generated Cloudinary media references.
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
