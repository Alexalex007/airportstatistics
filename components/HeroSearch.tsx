import React from 'react';
import { Globe, Calendar, ChevronDown, BarChart2, Layers } from 'lucide-react';

interface HeroSearchProps {
  onSearch: () => void;
  lastUpdated?: Date;
  selectedYear: number;
  onYearChange: (year: number) => void;
  // New Props for Monthly View
  viewMode: 'yearly' | 'monthly';
  onViewModeChange: (mode: 'yearly' | 'monthly') => void;
  selectedMonth: number;
  onMonthChange: (monthIndex: number) => void;
}

const YEARS = [2023, 2024, 2025, 2026];
const MONTHS = [
  "01月 (Jan)", "02月 (Feb)", "03月 (Mar)", "04月 (Apr)", 
  "05月 (May)", "06月 (Jun)", "07月 (Jul)", "08月 (Aug)", 
  "09月 (Sep)", "10月 (Oct)", "11月 (Nov)", "12月 (Dec)"
];

const HeroSearch: React.FC<HeroSearchProps> = ({ 
  onSearch, 
  lastUpdated, 
  selectedYear, 
  onYearChange,
  viewMode,
  onViewModeChange,
  selectedMonth,
  onMonthChange
}) => {
  
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
          <div className="w-full lg:w-1/2">
            <h1 className="text-[22px] xs:text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-4 transition-colors duration-300 whitespace-nowrap overflow-visible">
              亞太樞紐機場
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-cyan-300 dark:via-blue-300 dark:to-indigo-300 inline-block ml-1 sm:ml-2">
                客運量數據看板
              </span>
            </h1>
            
            <div className="flex items-center mt-5 w-full max-w-lg lg:max-w-xl">
               <Globe size={20} className="text-blue-600 dark:text-cyan-500 mr-3 shrink-0"/>
               <span className="hidden sm:block text-sm sm:text-base font-bold tracking-widest font-mono text-slate-700 dark:text-slate-300 truncate">
                 HKG · TPE · SIN · BKK · ICN · MNL
               </span>
               <div className="flex sm:hidden w-full justify-between items-center text-[13px] xs:text-sm font-bold font-mono text-slate-700 dark:text-slate-300">
                  <span>HKG</span><span>TPE</span><span>SIN</span><span>BKK</span><span>ICN</span><span>MNL</span>
               </div>
            </div>
          </div>

          {/* Right Content: Controls Card */}
          <div className="w-full lg:w-auto min-w-[280px] sm:min-w-[400px]">
             <div className="
                backdrop-blur-xl border p-4 sm:p-5 rounded-2xl shadow-xl transition-all duration-300 group
                bg-white/80 border-white/60 shadow-blue-100/50
                dark:bg-slate-800/40 dark:border-white/10 dark:shadow-black/20 dark:hover:bg-slate-800/60
             ">
                {/* 1. View Mode Toggle (Glassmorphism & Sliding Pill) */}
                <div className="relative flex items-center bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-xl mb-4 border border-white/20 dark:border-white/5 shadow-inner">
                   
                   {/* Sliding Pill Background */}
                   <div 
                      className={`
                        absolute inset-y-1 w-[calc(50%-4px)] rounded-lg shadow-md transition-all duration-300 ease-out z-0
                        bg-white dark:bg-slate-700 ring-1 ring-black/5 dark:ring-white/10
                      `}
                      style={{
                        transform: viewMode === 'yearly' ? 'translateX(0)' : 'translateX(100%)',
                        left: viewMode === 'yearly' ? '4px' : 'calc(4px - 100% + 100%)' // Fix for width calc
                      }}
                   />

                   <button
                     onClick={() => onViewModeChange('yearly')}
                     className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors duration-300 ${
                       viewMode === 'yearly' 
                         ? 'text-blue-600 dark:text-blue-400' 
                         : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                     }`}
                   >
                     <BarChart2 size={16} />
                     年度趨勢
                   </button>
                   <button
                     onClick={() => onViewModeChange('monthly')}
                     className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors duration-300 ${
                       viewMode === 'monthly' 
                         ? 'text-purple-600 dark:text-purple-400' 
                         : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                     }`}
                   >
                     <Layers size={16} />
                     單月排名
                   </button>
                </div>

                {/* 2. Selectors */}
                <div className="flex gap-3">
                   {/* Year Selector */}
                   <div className="flex-1 relative">
                      <div className="absolute top-2 left-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10 pointer-events-none">
                        統計年份
                      </div>
                      <select 
                        value={selectedYear}
                        onChange={(e) => onYearChange(Number(e.target.value))}
                        className="
                          w-full appearance-none pl-3 pr-8 pt-6 pb-2 rounded-xl border font-bold text-base cursor-pointer transition-all outline-none shadow-sm
                          bg-white border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
                          dark:bg-slate-900/60 dark:border-slate-700 dark:text-white dark:focus:border-blue-400
                        "
                      >
                        {YEARS.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 bottom-3 pointer-events-none text-slate-400">
                        <ChevronDown size={16} />
                      </div>
                   </div>

                   {/* Month Selector (Only visible in Monthly mode) */}
                   {viewMode === 'monthly' && (
                     <div className="flex-1 relative animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="absolute top-2 left-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10 pointer-events-none">
                          選擇月份
                        </div>
                        <select 
                          value={selectedMonth}
                          onChange={(e) => onMonthChange(Number(e.target.value))}
                          className="
                            w-full appearance-none pl-3 pr-8 pt-6 pb-2 rounded-xl border font-bold text-base cursor-pointer transition-all outline-none shadow-sm
                            bg-white border-slate-200 text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10
                            dark:bg-slate-900/60 dark:border-slate-700 dark:text-white dark:focus:border-purple-400
                          "
                        >
                          {MONTHS.map((month, idx) => (
                            <option key={idx} value={idx}>{month}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 bottom-3 pointer-events-none text-slate-400">
                          <ChevronDown size={16} />
                        </div>
                     </div>
                   )}
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
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent dark:via-slate-700/50"></div>
    </div>
  );
};

export default HeroSearch;