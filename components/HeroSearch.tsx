import React from 'react';
import { Activity, Database, Calendar, ChevronDown, BarChart2 } from 'lucide-react';

interface HeroSearchProps {
  onSearch: () => void;
  lastUpdated?: Date;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const YEARS = [2023, 2024, 2025, 2026];

const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, lastUpdated, selectedYear, onYearChange }) => {
  
  return (
    <div className="relative overflow-hidden bg-slate-900 pb-10 pt-32 sm:pt-40 lg:pt-48 shadow-2xl z-10">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         {/* Main Gradient Base */}
         <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950"></div>
         
         {/* Decorative Orbs */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>
         
         {/* Mesh/Grid Pattern Overlay */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 lg:gap-12">
          
          {/* Left Content: Title & Subtitle */}
          <div className="w-full lg:w-2/3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium mb-4 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
              Live Official Data Sources
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4">
              亞太樞紐機場 <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300">
                客運量數據看板
              </span>
            </h1>
            
            <p className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-xl font-light leading-relaxed flex items-center flex-wrap gap-2">
               <Database size={16} className="text-cyan-500"/>
               <span>HKG · TPE · SIN · BKK · ICN</span>
               <span className="hidden sm:inline mx-2 text-slate-600">|</span>
               <span className="text-slate-400">即時監控與趨勢分析</span>
            </p>
          </div>

          {/* Right Content: Year Selector (Glassmorphism Card) */}
          <div className="w-full lg:w-auto min-w-[280px]">
             <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl hover:bg-white/10 transition-colors duration-300 group">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-slate-300 text-sm font-medium flex items-center">
                     <Calendar size={16} className="mr-2 text-blue-400" />
                     統計年份
                   </span>
                   <BarChart2 size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
                
                <div className="relative">
                  <select 
                    value={selectedYear}
                    onChange={(e) => onYearChange(Number(e.target.value))}
                    className="w-full appearance-none bg-slate-900/50 hover:bg-slate-800/80 text-white pl-4 pr-10 py-3 rounded-xl border border-blue-500/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-bold text-lg cursor-pointer transition-all shadow-inner"
                  >
                    {YEARS.map(year => (
                      <option key={year} value={year}>{year} 年統計</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-blue-400">
                    <ChevronDown size={20} />
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-end">
                   <span className="text-[10px] text-slate-500 bg-slate-900/30 px-2 py-1 rounded">
                      最後更新: {lastUpdated ? lastUpdated.toLocaleTimeString() : '剛剛'}
                   </span>
                </div>
             </div>
          </div>

        </div>
      </div>
      
      {/* Bottom Fade Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>
    </div>
  );
};

export default HeroSearch;