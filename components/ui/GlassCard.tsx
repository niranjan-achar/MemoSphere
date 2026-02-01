import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  blur?: 'sm' | 'md' | 'lg';
}

export function GlassCard({ children, className = '', hover = false, blur = 'md' }: GlassCardProps) {
  const blurStyles = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  };

  return (
    <div
      className={`
        ${blurStyles[blur]}
        bg-white/70 dark:bg-gray-900/70
        border border-white/20 dark:border-gray-700/30
        rounded-2xl shadow-xl
        ${hover ? 'hover:shadow-2xl hover:scale-[1.02] transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
