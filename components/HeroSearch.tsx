import React from 'react';
import { RefreshCw, Activity, Database, Calendar } from 'lucide-react';

interface HeroSearchProps {
  onSearch: () => void;
  lastUpdated?: Date;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const YEARS = [2023, 2024, 2025];

const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, lastUpdated, selectedYear, onYearChange }) => {
  
  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-xl">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
         <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
         <div className="absolute bottom-10 left-10 w-72 h-72 bg-cyan-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 flex items-center justify-center md:justify-start">
            <Activity className="mr-3 text-cyan-400" />
            亞太樞紐機場 <span className="text-cyan-400 ml-2">客運量數據看板</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl flex items-center justify-center md:justify-start mb-4 md:mb-0">
             <Database size={16} className="mr-2 text-slate-400"/>
             HKG, TPE, SIN, BKK, ICN 官方統計數據 (手動更新)
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end w-full md:w-auto">
          
          {/* Year Selector */}
          <div className="bg-slate-800/50 p-1 rounded-lg flex items-center mb-4 backdrop-blur-sm border border-slate-700">
             <div className="flex items-center px-3 text-slate-400 text-sm font-medium mr-2">
                <Calendar size={16} className="mr-2" />
                <span>年份:</span>
             </div>
             {YEARS.map(year => (
               <button
                 key={year}
                 onClick={() => onYearChange(year)}
                 className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                   selectedYear === year 
                     ? 'bg-blue-600 text-white shadow-md' 
                     : 'text-slate-300 hover:text-white hover:bg-slate-700'
                 }`}
               >
                 {year}
               </button>
             ))}
          </div>

          <div className="flex flex-col items-center md:items-end">
            {lastUpdated && (
              <span className="text-xs text-slate-400 font-mono flex items-center">
                <RefreshCw size={12} className="mr-1 inline" /> 
                資料狀態: 已更新
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;