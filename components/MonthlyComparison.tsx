import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Trophy, Medal, Plane } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MonthlyDataPoint {
  code: string;
  name: string;
  value: number;
  prevValue?: number;
  growth?: number;
  isCustom?: boolean;
}

interface MonthlyComparisonProps {
  data: MonthlyDataPoint[];
  year: number;
  monthIndex: number;
  isDarkMode: boolean;
}

// Vivid Colors for ranking
const RANK_COLORS = [
  '#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'
];

const CustomTooltip = ({ active, payload, label, isDarkMode, t }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as MonthlyDataPoint;
    return (
      <div className={`p-3 rounded-xl border shadow-xl backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-700 text-slate-100' : 'bg-white/90 border-white text-slate-800'}`}>
        <p className="font-bold text-lg mb-1">{data.code}</p>
        <p className="text-xs opacity-70 mb-2">{data.name}</p>
        <div className="flex items-center gap-2">
           <span className="text-xl font-black font-mono">
             {new Intl.NumberFormat('zh-TW').format(data.value)}
           </span>
           <span className="text-xs">{t('passengers')}</span>
        </div>
        {data.growth !== undefined && (
           <div className={`text-xs font-bold mt-1 ${data.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {data.growth > 0 ? '+' : ''}{data.growth.toFixed(1)}% (YoY)
           </div>
        )}
      </div>
    );
  }
  return null;
};

const MonthlyComparison: React.FC<MonthlyComparisonProps> = ({ data, year, monthIndex, isDarkMode }) => {
  const { t } = useLanguage();
  
  // Sort data descending
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const maxVal = sortedData.length > 0 ? sortedData[0].value : 0;

  if (sortedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Plane size={48} className="mb-4 opacity-20" />
        <p>{t('noData')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Header & Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
               <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                 <span className="text-blue-600 dark:text-blue-400">{year} {t('fullMonths')[monthIndex]}</span> 
               </h2>
               <p className="text-slate-500 dark:text-slate-400 mt-1">
                 {t('totalPassengers')}: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{new Intl.NumberFormat('zh-TW').format(data.reduce((a, b) => a + b.value, 0))}</span> {t('passengers')}
               </p>
            </div>
            
            {/* Champion Badge */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 px-4 py-3 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
               <div className="bg-yellow-100 dark:bg-yellow-600/20 p-2 rounded-full text-yellow-600 dark:text-yellow-400">
                 <Trophy size={20} />
               </div>
               <div>
                  <div className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wider">Top 1</div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">
                     {sortedData[0].code}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 2. Chart Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
         <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="code" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontFamily: 'monospace' }}
                    tickFormatter={(val) => (val / 10000).toFixed(0) + 'w'}
                  />
                  <Tooltip cursor={{ fill: isDarkMode ? '#ffffff10' : '#00000005' }} content={<CustomTooltip isDarkMode={isDarkMode} t={t} />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1000}>
                    {sortedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RANK_COLORS[index % RANK_COLORS.length]} />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* 3. Detailed Ranking List */}
      <div className="grid grid-cols-1 gap-4">
         {sortedData.map((item, index) => {
            const isFirst = index === 0;
            const diffFromFirst = isFirst ? 0 : (item.value - sortedData[0].value);
            const diffPercent = isFirst ? 0 : ((item.value / sortedData[0].value) * 100);

            return (
               <div 
                 key={item.code}
                 className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
               >
                  {/* Progress Bar Background */}
                  <div 
                    className="absolute bottom-0 left-0 top-0 bg-slate-50 dark:bg-slate-800/50 transition-all duration-1000 ease-out z-0"
                    style={{ width: `${(item.value / maxVal) * 100}%` }}
                  ></div>

                  <div className="relative z-10 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        {/* Rank Number */}
                        <div className={`
                           w-8 h-8 flex items-center justify-center rounded-lg font-black text-lg
                           ${index < 3 ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-transparent text-slate-400'}
                        `}>
                           {index === 0 && <span className="text-yellow-500">1</span>}
                           {index === 1 && <span className="text-slate-400">2</span>}
                           {index === 2 && <span className="text-orange-400">3</span>}
                           {index > 2 && <span>{index + 1}</span>}
                        </div>

                        {/* Airport Info */}
                        <div>
                           <div className="flex items-baseline gap-2">
                              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{item.code}</h3>
                              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate max-w-[120px] sm:max-w-xs">{item.name}</span>
                           </div>
                           
                           {/* Mobile View Stats */}
                           <div className="sm:hidden mt-1 flex items-center gap-2 text-xs">
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                 {new Intl.NumberFormat('zh-TW').format(item.value)}
                              </span>
                              {item.growth !== undefined && (
                                 <span className={`${item.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {item.growth > 0 ? '+' : ''}{item.growth.toFixed(1)}%
                                 </span>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Desktop View Stats */}
                     <div className="hidden sm:flex items-center gap-8 text-right">
                        {!isFirst && (
                           <div className="flex flex-col items-end">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('diffFromFirst')}</span>
                              <span className="text-sm font-mono font-medium text-slate-500">
                                 {new Intl.NumberFormat('zh-TW').format(diffFromFirst)} ({diffPercent.toFixed(1)}%)
                              </span>
                           </div>
                        )}

                        <div className="flex flex-col items-end w-24">
                           <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('growth')}</span>
                           {item.growth !== undefined ? (
                              <div className={`flex items-center font-bold ${item.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                 {item.growth >= 0 ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                                 {item.growth > 0 ? '+' : ''}{item.growth.toFixed(1)}%
                              </div>
                           ) : (
                              <span className="text-slate-300">-</span>
                           )}
                        </div>

                        <div className="flex flex-col items-end w-32">
                           <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('passengers')}</span>
                           <span className="text-xl font-black font-mono text-slate-800 dark:text-slate-100">
                              {new Intl.NumberFormat('zh-TW').format(item.value)}
                           </span>
                        </div>
                     </div>

                     {/* Mobile Rank Only (simplified) */}
                     <div className="sm:hidden">
                        {/* Placeholder for alignment if needed */}
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
    </div>
  );
};

export default MonthlyComparison;