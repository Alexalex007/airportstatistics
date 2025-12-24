import React from 'react';
import { Activity, Database, Calendar, ChevronDown } from 'lucide-react';

interface HeroSearchProps {
  onSearch: () => void;
  lastUpdated?: Date;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const YEARS = [2023, 2024, 2025, 2026];

const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, lastUpdated, selectedYear, onYearChange }) => {
  
  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-xl">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
         <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
         <div className="absolute bottom-10 left-10 w-72 h-72 bg-cyan-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
        <div className="text-center md:text-left w-full md:w-auto overflow-hidden">
          {/* Title: Adjusted text size to ensure single line on mobile (text-[1.1rem]) while staying large on desktop */}
          <h1 className="text-[1.1rem] sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 flex items-center justify-center md:justify-start whitespace-nowrap overflow-hidden text-ellipsis">
            <Activity className="mr-2 sm:mr-3 text-cyan-400 w-5 h-5 sm:w-8 sm:h-8 flex-shrink-0" />
            亞太樞紐機場 <span className="text-cyan-400 ml-2">客運量數據看板</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-base max-w-2xl flex items-center justify-center md:justify-start mb-4 md:mb-0">
             <Database size={16} className="mr-2 text-slate-400"/>
             HKG, TPE, SIN, BKK, ICN 官方統計數據
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end w-full md:w-auto">
          
          {/* Year Selector - Dropdown Style */}
          <div className="flex items-center">
             <div className="flex items-center px-3 text-slate-300 text-sm font-medium mr-2">
                <Calendar size={16} className="mr-2" />
                <span>年份:</span>
             </div>
             <div className="relative">
               <select 
                 value={selectedYear}
                 onChange={(e) => onYearChange(Number(e.target.value))}
                 className="appearance-none bg-slate-800 hover:bg-slate-700 text-white pl-4 pr-10 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer transition-colors shadow-lg"
               >
                 {YEARS.map(year => (
                   <option key={year} value={year}>{year}</option>
                 ))}
               </select>
               <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                 <ChevronDown size={16} />
               </div>
             </div>
          </div>
          
          {/* Data status text removed */}
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;