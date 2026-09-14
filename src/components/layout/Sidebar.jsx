import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Package, Grid, Image, Sparkles, ChevronLeft, ChevronRight, LogOut, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function PremiumStudioLogo({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M16 3L27 9.35V22.65L16 29L5 22.65V9.35L16 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16 7.5L22.5 18.75H9.5L16 7.5Z"
        fill="currentColor"
      />
      <path
        d="M16 24.5L9.5 13.25H22.5L16 24.5Z"
        fill="currentColor"
        opacity="0.65"
      />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Package },
    { label: 'Generated Content', path: '/products', icon: Grid },
    { label: 'Media Library', path: '/assets', icon: Image },
    { label: 'Content Factory', path: '/social-factory', icon: Sparkles },
  ];

  const sidebarContent = (
    <aside className={`h-full border-r border-amber-900/20 bg-stone-950/90 backdrop-blur-xl flex flex-col justify-between shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div>
        {/* Brand Header */}
        <div className={`h-16 flex items-center border-b border-amber-900/20 overflow-hidden relative ${collapsed ? 'justify-center px-2' : 'justify-between px-3.5'}`}>
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl luxury-gradient-bg flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 shrink-0">
              <PremiumStudioLogo className="w-4 h-4 text-white dark:text-stone-950" />
            </div>
            {!collapsed && (
              <div className="truncate min-w-0">
                <span className="text-xs sm:text-sm font-bold luxury-gradient-text tracking-tight block truncate">
                  Content Factory
                </span>
                <span className="text-[9px] text-amber-400 uppercase tracking-widest font-mono block truncate">
                  Pro Cloudinary Suite
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-stone-500/10 transition-colors hidden md:flex items-center justify-center shrink-0 ${collapsed ? 'absolute top-1/2 -translate-y-1/2 right-1' : 'ml-1'}`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1.5">
          {!collapsed && (
            <div className="px-3 py-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase font-mono">
              Workspace Operations
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/80 border border-transparent'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${collapsed ? 'w-5 h-5' : ''}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Account Footer */}
      <div className="p-3 border-t border-amber-900/20 bg-stone-950/80 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 mb-2">
            <div className="flex items-center justify-between text-[10px] font-semibold text-amber-400 uppercase tracking-wider font-mono">
              <span>Cloudinary Active</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-stone-300 mt-1 font-medium">Ready for high-res render</p>
          </div>
        )}

        <div className={`flex items-center justify-between space-x-2 px-3 py-2 rounded-xl bg-stone-900/90 border border-amber-900/30 text-xs ${collapsed ? 'justify-center px-0 bg-transparent border-0' : ''}`}>
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-7 h-7 rounded-lg luxury-gradient-bg flex items-center justify-center text-white dark:text-stone-950 font-bold text-xs shrink-0 shadow-sm">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="font-semibold text-stone-200 text-xs truncate">
                  {currentUser?.email ? currentUser.email.split('@')[0] : 'User Workspace'}
                </p>
                <p className="text-[10px] text-stone-400 truncate mt-0.5">{currentUser?.email}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-stone-950/85 backdrop-blur-md z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 md:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>
    </>
  );
}
