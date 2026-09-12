import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded';
  
  const variants = {
    primary: 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs',
    secondary: 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <button className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    neutral: 'bg-neutral-50 text-neutral-600 border-neutral-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}

export function StatusDot({ status }) {
  const isReady = status === 'Ready' || status === 'Complete' || status === 'Passed';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-700">
      <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
      <span>{status}</span>
    </span>
  );
}
