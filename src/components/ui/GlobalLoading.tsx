// components/ui/GlobalLoading.tsx

import React from "react";

interface GlobalLoadingProps {
  content?: React.ReactNode;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ content }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/20 z-10 backdrop-blur-[1px]">
      <div className="flex flex-col items-center space-y-2 bg-white/80 p-6 rounded-2xl shadow-md border border-gold-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-600" />

        {content || (
          <span className="font-display text-[9px] uppercase tracking-wider text-neutral-500 font-bold">
            Loading...
          </span>
        )}
      </div>
    </div>
  );
};

export default GlobalLoading;