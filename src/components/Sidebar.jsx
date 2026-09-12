import React from 'react';
import { Package, Grid, Image, Layers, Settings, FolderOpen, SlidersHorizontal } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { label: 'Catalog Assets', icon: Package, active: true },
    { label: 'Media Library', icon: FolderOpen, active: false },
    { label: 'Transform Presets', icon: Grid, active: false },
    { label: 'Batch Operations', icon: Layers, active: false },
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white flex flex-col justify-between shrink-0">
      <div className="p-5">
        {/* Brand */}
        <div className="flex items-center space-x-2.5 mb-8">
          <div className="w-7 h-7 rounded bg-neutral-900 flex items-center justify-center text-white">
            <Image className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-neutral-900 tracking-tight leading-none">
              Content Factory
            </h1>
            <p className="text-[11px] text-neutral-500 font-normal mt-1">Creative Operations</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          <div className="px-2 pb-2 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  item.active
                    ? 'bg-neutral-100 text-neutral-900 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Icon className="w-4 h-4 text-neutral-500" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Settings */}
      <div className="p-4 border-t border-neutral-100 space-y-1">
        <button className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
          <span>Pipeline Rules</span>
        </button>
        <button className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors">
          <Settings className="w-4 h-4 text-neutral-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
