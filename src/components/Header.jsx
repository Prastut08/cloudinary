import React from 'react';
import { Upload, Search, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-14 border-b border-neutral-200 bg-white px-6 flex items-center justify-between shrink-0">
      {/* Search Input */}
      <div className="relative w-80">
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
        <button className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-1.5 rounded text-xs font-medium transition-colors shadow-xs">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Product</span>
        </button>
      </div>
    </header>
  );
}
