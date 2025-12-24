import React from 'react';
import { RefreshCw, Activity } from 'lucide-react';

interface HeroSearchProps {
  onSearch: (query: string) => void; // Kept for interface compatibility but used for refresh
  isLoading: boolean;
  lastUpdated?: Date;
}

const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, isLoading, lastUpdated }) => {
  
  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-xl">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
         <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
         <div className="absolute bottom-10 left-10 w-72 h-72 bg-cyan-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 flex items-center justify-center md:justify-start">
            <Activity className="mr-3 text-cyan-400" />
            亞太樞紐機場 <span className="text-cyan-400 ml-2">即時客運量監控</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
             監控 HKG, TPE, SIN, BKK, ICN 每月實際客運量與同期對比 (精確數據不四捨五入)
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end">
          <button
            onClick={() => onSearch("refresh")}
            disabled={isLoading}
            className={`
              flex items-center px-6 py-3 rounded-full font-bold text-white shadow-lg transition-all
              ${isLoading 
                ? 'bg-slate-700 cursor-not-allowed opacity-80' 
                : 'bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 border border-blue-400/30'
              }
            `}
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '正在更新數據...' : '立即刷新數據'}
          </button>
          
          {lastUpdated && (
            <span className="mt-2 text-xs text-slate-400 font-mono">
              最後更新: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;