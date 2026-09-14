import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Package, Grid, Image, Settings, User, ChevronLeft, ChevronRight, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
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

  return (
    <aside className={`border-r border-neutral-200 bg-white flex flex-col justify-between shrink-0 transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div>
        {/* Brand */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-neutral-100">
          {!collapsed && (
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded bg-neutral-900 flex items-center justify-center text-white font-semibold text-xs">
                C
              </div>
              <span className="text-xs font-bold text-neutral-900 tracking-tight">
                Content Factory
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-6 h-6 mx-auto rounded bg-neutral-900 flex items-center justify-center text-white font-semibold text-xs">
              C
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors hidden md:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {!collapsed && (
            <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
              Operations
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 text-neutral-500" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Account Area */}
      <div className="p-3 border-t border-neutral-100 space-y-1">
        <div className={`flex items-center justify-between space-x-2 px-2.5 py-2 rounded text-xs text-neutral-700 ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="flex items-center space-x-2 truncate">
            <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
            </div>
            {!collapsed && (
              <div className="truncate leading-none">
                <p className="font-medium text-neutral-900 text-[11px] truncate">
                  {currentUser?.email ? currentUser.email.split('@')[0] : 'User'}
                </p>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">{currentUser?.email}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
