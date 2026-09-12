import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Bell } from 'lucide-react';
import { Button } from '../ui/UI';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-neutral-200 bg-white px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Search Input */}
      <div className="relative w-64 sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search products, SKUs, or media tags..."
          className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
        />
      </div>

      {/* Action Header Items */}
      <div className="flex items-center space-x-3">
        <button className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-neutral-200" />

        {/* Primary Action Button */}
        <Button onClick={() => navigate('/upload')} size="md" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Product</span>
        </Button>
      </div>
    </header>
  );
}
