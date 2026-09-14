import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Bell, Menu, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/UI';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header className="h-16 border-b border-amber-900/20 bg-stone-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 transition-colors">
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onMenuClick}
          className="p-2 text-stone-400 hover:text-amber-500 rounded-xl hover:bg-stone-500/10 md:hidden transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search products, SKUs, or Cloudinary tags..."
            className="w-full pl-10 pr-4 py-2 bg-stone-900/90 border border-amber-900/30 rounded-xl text-xs text-amber-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all backdrop-blur-xs"
          />
        </div>
      </div>

      {/* Action Header Controls */}
      <div className="flex items-center space-x-3 ml-4">
        {/* Single-Click Premium Theme Button */}
        <button
          onClick={toggleTheme}
          type="button"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none border shadow-sm group active:scale-90 shrink-0 ${
            theme === 'dark'
              ? 'bg-stone-900/90 border-amber-500/30 hover:border-amber-400/60 hover:bg-stone-800 text-amber-400'
              : 'bg-white border-[#e6ded1] hover:bg-[#f5efe6] hover:border-[#d7ccc0] text-[#1c1917]'
          }`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-[#1c1917] group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
          )}
        </button>

        <button className="p-2 text-stone-400 hover:text-amber-500 rounded-xl hover:bg-stone-500/10 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        </button>

        <div className="h-5 w-px border-r border-amber-900/20 hidden sm:block" />

        {/* Primary Action Button */}
        <Button onClick={() => navigate('/upload')} size="md" className="gap-2">
          <Plus className="w-4 h-4 text-stone-950" />
          <span className="hidden sm:inline">Upload Product</span>
          <span className="sm:hidden">Upload</span>
        </Button>
      </div>
    </header>
  );
}
