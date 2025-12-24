import React from 'react';
import { Globe, Calendar, ChevronDown, BarChart2 } from 'lucide-react';

interface HeroSearchProps {
  onSearch: () => void;
  lastUpdated?: Date;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const YEARS = [2023, 2024, 2025, 2026];

const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, lastUpdated, selectedYear, onYearChange }) => {
  
  return (
    <div className="relative overflow-hidden transition-colors duration-500 bg-slate-50 dark:bg-slate-900 pb-10 pt-24 sm:pt-28 lg:pt-36 shadow-xl z-10">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500">
         {/* --- Light Mode Gradient (Sky Theme) --- */}
         <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 dark:opacity-0 transition-opacity duration-500"></div>
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 dark:opacity-0"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-100/60 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 dark:opacity-0"></div>

         {/* --- Dark Mode Gradient (Space Theme) --- */}
         <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 animate-pulse opacity-0 dark:opacity-100"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 opacity-0 dark:opacity-100"></div>
         
         {/* Texture Overlay (Shared) */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 mix-blend-soft-light"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 lg:gap-12">
          
          {/* Left Content: Title & Subtitle */}
          <div className="w-full lg:w-2/3">
            
            {/* 
                Title Redesign:
                - text-[22px]: 手機版使用 22px，確保「亞太樞紐機場客運量數據看板」(12字) 能在 320px+ 寬度螢幕上一行顯示。
                - sm:text-4xl / lg:text-5xl: 平板與電腦版字體放大，保持清晰度。
                - whitespace-nowrap: 強制不換行。
            */}
            <h1 className="text-[22px] xs:text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-4 transition-colors duration-300 whitespace-nowrap overflow-visible">
              亞太樞紐機場
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-cyan-300 dark:via-blue-300 dark:to-indigo-300 inline-block ml-1 sm:ml-2">
                客運量數據看板
              </span>
            </h1>
            
            <div className="flex items-center mt-5 w-full max-w-lg lg:max-w-xl">
               <Globe size={20} className="text-blue-600 dark:text-cyan-500 mr-3 shrink-0"/>
               
               {/* Mobile: Flex layout with justify-between to ensure full line usage without cutoff */}
               <div className="flex sm:hidden w-full justify-between items-center text-[13px] xs:text-sm font-bold font-mono text-slate-700 dark:text-slate-300">
                  <span>HKG</span>
                  <span>TPE</span>
                  <span>SIN</span>
                  <span>BKK</span>
                  <span>ICN</span>
                  <span>MNL</span>
               </div>

               {/* Desktop: Original elegant wide tracking with dots */}
               <span className="hidden sm:block text-sm sm:text-base font-bold tracking-widest font-mono text-slate-700 dark:text-slate-300 truncate">
                 HKG · TPE · SIN · BKK · ICN · MNL
               </span>
            </div>
          </div>

          {/* Right Content: Year Selector Card */}
          <div className="w-full lg:w-auto min-w-[280px] sm:min-w-[320px]">
             <div className="
                backdrop-blur-xl border p-5 rounded-2xl shadow-xl transition-all duration-300 group
                bg-white/80 border-white/60 shadow-blue-100/50
                dark:bg-slate-800/40 dark:border-white/10 dark:shadow-black/20 dark:hover:bg-slate-800/60
             ">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-xs font-bold uppercase tracking-wider flex items-center text-slate-500 dark:text-slate-400">
                     <Calendar size={14} className="mr-2 text-blue-600 dark:text-blue-400" />
                     統計年份
                   </span>
                   <BarChart2 size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                
                <div className="relative">
                  <select 
                    value={selectedYear}
                    onChange={(e) => onYearChange(Number(e.target.value))}
                    className="
                      w-full appearance-none pl-4 pr-10 py-3 rounded-xl border font-bold text-lg cursor-pointer transition-all outline-none shadow-sm
                      bg-white border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-blue-300
                      dark:bg-slate-900/60 dark:border-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:hover:border-slate-600
                    "
                  >
                    {YEARS.map(year => (
                      <option key={year} value={year}>{year} 年統計</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-blue-600 dark:text-blue-400">
                    <ChevronDown size={20} />
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-end">
                   <span className="text-[10px] font-medium px-2 py-1 rounded bg-slate-100 text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                      最後更新: {lastUpdated ? lastUpdated.toLocaleTimeString() : '剛剛'}
                   </span>
                </div>
             </div>
          </div>

        </div>
      </div>
      
      {/* Bottom Fade Line - Light Mode uses a subtle shadow, Dark mode uses fade */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent dark:via-slate-700/50"></div>
    </div>
  );
};

export default HeroSearch;