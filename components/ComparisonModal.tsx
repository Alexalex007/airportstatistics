import React, { useState, useMemo, useEffect } from 'react';
import { X, BarChart2, CheckSquare, Square, Filter, Trash2, Calendar, Plus } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AirportDefinition } from '../types';
import { fetchAirportStats, getAvailableYears } from '../services/geminiService';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  allAirports: AirportDefinition[];
  results?: any; 
  year?: number; 
}

interface ChartSeries {
  id: string; // Unique ID: "HKG-2024"
  code: string;
  name: string;
  year: number;
  data: number[];
  color: string;
}

const COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#6366f1', // Indigo
  '#d946ef', // Fuchsia
];

const DATA_PREFIX = 'skymetrics_data_';
// Define selectable years range
const YEARS_RANGE = [2026, 2025, 2024, 2023, 2019]; 

const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  allAirports,
  year = 2025
}) => {
  // State
  const [targetYear, setTargetYear] = useState<number>(year);
  const [seriesList, setSeriesList] = useState<ChartSeries[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Initialize with current year's data if provided/needed, 
  // currently we start empty or could auto-select something.
  // Let's start clean or user can select.

  const getNextColor = () => {
    const usedColors = seriesList.map(s => s.color);
    // Find first unused color from palette
    const available = COLORS.find(c => !usedColors.includes(c));
    // If all used, cycle through
    return available || COLORS[seriesList.length % COLORS.length];
  };

  const toggleSeries = async (airport: AirportDefinition) => {
    const targetId = `${airport.code}-${targetYear}`;
    
    // 1. If exists, remove it
    if (seriesList.some(s => s.id === targetId)) {
      setSeriesList(prev => prev.filter(s => s.id !== targetId));
      return;
    }

    // 2. If not exists, fetch and add
    setLoadingStates(prev => ({ ...prev, [airport.code]: true }));

    try {
      let chartData: { passengers: number }[] = [];
      
      if (airport.isCustom) {
        // Local Storage
        const key = `${DATA_PREFIX}${airport.code}_${targetYear}`;
        const savedStr = localStorage.getItem(key);
        if (savedStr) {
          const parsed = JSON.parse(savedStr);
          chartData = parsed.chartData;
        } else {
          // Fallback or empty if not found
          chartData = []; 
        }
      } else {
        // API / Service
        // Note: fetchAirportStats might throw if year data missing, we handle it
        try {
           const result = await fetchAirportStats(airport.code, targetYear);
           chartData = result.chartData;
        } catch (e) {
           chartData = [];
        }
      }

      // Check if valid data exists
      const hasData = chartData && chartData.some(d => d.passengers > 0);
      
      if (!hasData) {
        alert(`${airport.name} 暫無 ${targetYear} 年的數據`);
        setLoadingStates(prev => ({ ...prev, [airport.code]: false }));
        return;
      }

      const dataArray = chartData.map(d => d.passengers);
      
      const newSeries: ChartSeries = {
        id: targetId,
        code: airport.code,
        name: airport.name,
        year: targetYear,
        data: dataArray,
        color: getNextColor()
      };

      setSeriesList(prev => [...prev, newSeries]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStates(prev => ({ ...prev, [airport.code]: false }));
    }
  };

  const removeSeriesById = (id: string) => {
    setSeriesList(prev => prev.filter(s => s.id !== id));
  };

  const toggleAllCurrentYear = () => {
    // Check how many of visible airports are selected for *targetYear*
    const relevantIds = allAirports.map(ap => `${ap.code}-${targetYear}`);
    const selectedCount = seriesList.filter(s => relevantIds.includes(s.id)).length;
    
    if (selectedCount === allAirports.length) {
      // Unselect all for this year
      setSeriesList(prev => prev.filter(s => s.year !== targetYear));
    } else {
      // Select all for this year (sequentially to manage async/colors? 
      // Actually strictly better to let user select one by one to avoid spamming, 
      // but "Select All" is requested. Let's do a simple loop but be careful about API limits if real.
      // Here it's mock/simulated, so it's fine.
      
      // We'll filter only those not yet selected
      allAirports.forEach(ap => {
         const id = `${ap.code}-${targetYear}`;
         if (!seriesList.some(s => s.id === id)) {
           toggleSeries(ap);
         }
      });
    }
  };

  // Recharts Data Transformation
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, index) => {
      const dataPoint: any = { name: month };
      seriesList.forEach(series => {
        const val = series.data[index];
        dataPoint[series.id] = (val && val > 0) ? val : null;
      });
      return dataPoint;
    });
  }, [seriesList]);

  const formatYAxis = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-200">
      
      {/* Header - Fixed at Top */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-20">
        <div className="flex items-center gap-3">
           <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
             <BarChart2 size={24} />
           </div>
           <div>
             <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
               多機場數據比對實驗室
             </h2>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
               點選機場以加入圖表，切換年份可進行跨時空比對
             </p>
           </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content - Scrollable Area */}
      {/* Changed: Removed overflow-hidden from mobile view, allow vertical scrolling for the whole area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        
        {/* SIDEBAR: Controls */}
        {/* Changed: Removed fixed h-[40vh] for mobile, allow auto height so it flows naturally */}
        <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 flex-shrink-0">
          
          {/* 1. Year Selector (Tabs) */}
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Calendar size={12} /> 設定目標年份
            </h3>
            <div className="flex space-x-2 overflow-x-auto custom-scrollbar pb-2">
              {YEARS_RANGE.map(y => (
                <button
                  key={y}
                  onClick={() => setTargetYear(y)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all
                    ${targetYear === y 
                      ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md transform scale-105' 
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}
                  `}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Airport Grid */}
          {/* Changed: Adjusted overflow handling for desktop only */}
          <div className="lg:flex-1 lg:overflow-y-auto px-4 py-2 custom-scrollbar">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                選擇 {targetYear} 年數據
              </h3>
              <button 
                onClick={toggleAllCurrentYear}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                全選/取消 ({targetYear})
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {allAirports.map((airport, idx) => {
                const targetId = `${airport.code}-${targetYear}`;
                const isSelected = seriesList.some(s => s.id === targetId);
                const isLoading = loadingStates[airport.code];
                const seriesColor = seriesList.find(s => s.id === targetId)?.color;

                return (
                  <button
                    key={airport.code}
                    onClick={() => toggleSeries(airport)}
                    disabled={isLoading}
                    className={`
                      flex items-center px-3 py-3 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group
                      ${isSelected 
                          ? 'bg-blue-50/50 dark:bg-slate-800 border-blue-500/50 shadow-sm' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }
                      ${isLoading ? 'opacity-70 cursor-wait' : ''}
                    `}
                  >
                    {/* Active Indicator Bar */}
                    {isSelected && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5" 
                        style={{ backgroundColor: seriesColor }}
                      />
                    )}

                    <div className={`mr-3 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
                      {isLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                      ) : (
                        isSelected ? <CheckSquare size={18} /> : <Square size={18} />
                      )}
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <span className={`text-base font-black truncate ${isSelected ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-500'}`}>
                        {airport.code}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
                        {airport.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Active List (Bottom) */}
          <div className="bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 p-4 lg:max-h-[160px] lg:overflow-y-auto custom-scrollbar">
             <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Filter size={12} /> 已選項目 ({seriesList.length})
             </h3>
             {seriesList.length === 0 ? (
               <p className="text-[10px] text-slate-400 italic">尚未選擇任何數據</p>
             ) : (
               <div className="space-y-1">
                 {seriesList.map(series => (
                   <div key={series.id} className="flex items-center justify-between group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-2 py-1.5">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: series.color }}></div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {series.code}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-mono">
                          {series.year}
                        </span>
                      </div>
                      <button 
                        onClick={() => removeSeriesById(series.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* CHART AREA */}
        {/* Changed: Added min-h-[500px] so chart has space on mobile, changed overflow behavior */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-[500px] lg:min-h-0 lg:h-full lg:overflow-hidden">
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 relative min-h-[300px]">
            
            {seriesList.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <BarChart2 size={48} className="mb-4 opacity-20" />
                <p>請從左側選擇機場與年份</p>
                <div className="flex items-center gap-2 mt-4 text-xs opacity-60 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                   <span>💡 提示：切換上方年份標籤可添加不同年份的數據</span>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={formatYAxis}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '12px', 
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontSize: '13px', fontWeight: 600, padding: '2px 0' }}
                    labelStyle={{ color: '#64748b', marginBottom: '8px', fontWeight: 'bold' }}
                    formatter={(value: number, name: string) => {
                       const s = seriesList.find(item => item.id === name);
                       const label = s ? `${s.code} ${s.year}` : name;
                       return [new Intl.NumberFormat('zh-TW').format(value), label];
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
                    formatter={(value) => {
                       const s = seriesList.find(item => item.id === value);
                       return s ? `${s.code} '${s.year.toString().slice(-2)}` : value;
                    }}
                  />
                  
                  {seriesList.map((series) => (
                    <Line
                      key={series.id}
                      type="monotone"
                      dataKey={series.id}
                      stroke={series.color}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 7, strokeWidth: 0 }}
                      connectNulls
                      animationDuration={1500}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComparisonModal;