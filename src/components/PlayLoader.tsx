import React from 'react';

export const PlayLoader: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-2">
      <div className="relative w-16 h-16">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 border-4 border-emerald-500 rounded-full opacity-20"
            style={{
              animation: `ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite ${i * 0.3}s`,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-emerald-500 border-b-8 border-b-transparent animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2 w-24 bg-emerald-500/20 rounded-full animate-pulse" />
        <div className="h-2 w-16 bg-emerald-500/20 rounded-full animate-pulse" />
      </div>
    </div>
  );
};