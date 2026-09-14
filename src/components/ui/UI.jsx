import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none rounded-xl active:scale-95';
  
  const variants = {
    primary: 'luxury-gradient-button text-stone-950 font-bold shadow-lg shadow-amber-500/20 border border-amber-300/40',
    secondary: 'bg-stone-900/90 hover:bg-stone-800 text-amber-100 border border-amber-900/40 hover:border-amber-500/40 shadow-sm backdrop-blur-md hover:text-white',
    ghost: 'bg-transparent hover:bg-amber-500/10 text-stone-300 hover:text-amber-200',
    outline: 'bg-transparent hover:bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:border-amber-400/60',
    danger: 'bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/50 hover:border-red-600/80 shadow-sm'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-xs font-semibold rounded-xl',
    lg: 'px-5 py-2.5 text-sm font-semibold rounded-xl',
  };

  return (
    <button className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-stone-800/80 text-amber-100/90 border-stone-700/60',
    rose: 'bg-amber-500/10 text-amber-200 border-amber-500/30',
    gold: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    neutral: 'bg-stone-900/80 text-stone-400 border-stone-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border backdrop-blur-xs ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}

export function StatusDot({ status }) {
  const isReady = status === 'Ready' || status === 'Complete' || status === 'Passed' || status === 'completed';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-stone-300">
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isReady ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
      </span>
      <span className="capitalize">{status}</span>
    </span>
  );
}
