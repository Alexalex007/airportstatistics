import React, { useState, useEffect, useMemo } from 'react';
import { X, BarChart2, CheckSquare, Square, Filter } from 'lucide-react';
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
import { AirportDefinition, SearchState } from '../types';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  allAirports: AirportDefinition[];
  results: Record<string, SearchState>;
  year: number;
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

const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  allAirports,
  results,
  year
}) => {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  // Initialize selection when modal opens or airports change
  useEffect(() => {
    if (isOpen && selectedCodes.length === 0) {
      // Default to selecting all airports that have data
      const availableCodes = allAirports
        .filter(ap => results[ap.code]?.data?.chartData?.length)
        .map(ap => ap.code);
      setSelectedCodes(availableCodes);
    }
  }, [isOpen, allAirports, results]);

  const toggleAirport = (code: string) => {
    setSelectedCodes(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const toggleAll = () => {
    const availableCodes = allAirports
      .filter(ap => results[ap.code]?.data?.chartData?.length)
      .map(ap => ap.code);
      
    if (selectedCodes.length === availableCodes.length) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(availableCodes);
    }
  };

  // Transform data for Recharts
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    return months.map((month, index) => {
      const dataPoint: any = { name: month };
      
      selectedCodes.forEach(code => {
        const airportData = results[code]?.data?.chartData;
        // Find data for this month (flexible matching e.g., "2024 Jan")
        const monthStats = airportData?.find(d => d.period.includes(month));
        
        if (monthStats && monthStats.passengers > 0) {
          dataPoint[code] = monthStats.passengers;
        } else {
          dataPoint[code] = null; // Recharts handles null nicely (breaks the line)
        }
      });
      
      return dataPoint;
    });
  }, [selectedCodes, results]);

  const formatYAxis = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
        <div className="flex items-center gap-3">
           <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
             <BarChart2 size={24} />
           </div>
           <div>
             <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
               多機場數據比對實驗室
             </h2>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
               {year} 年度趨勢分析
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

      {/* Main Content - Split View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Controls Sidebar (Mobile: Top, Desktop: Left) */}
        <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto custom-scrollbar shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Filter size={14} /> 選擇顯示機場
            </h3>
            <button 
              onClick={toggleAll}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {selectedCodes.length === allAirports.length ? '取消全選' : '全選'}
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {allAirports.map((airport, idx) => {
              const isSelected = selectedCodes.includes(airport.code);
              const hasData = !!results[airport.code]?.data;
              const color = COLORS[idx % COLORS.length];

              return (
                <button
                  key={airport.code}
                  onClick={() => hasData && toggleAirport(airport.code)}
                  disabled={!hasData}
                  className={`
                    flex items-center px-3 py-3 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group
                    ${!hasData ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-800' : 
                      isSelected 
                        ? 'bg-white dark:bg-slate-800 border-blue-500/50 shadow-md transform scale-[1.02]' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }
                  `}
                >
                  {/* Color Indicator Bar */}
                  {isSelected && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1.5" 
                      style={{ backgroundColor: color }}
                    />
                  )}

                  <div className={`mr-3 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                    {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                  
                  <div className="flex flex-col">
                    <span className={`text-base font-black ${isSelected ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-500'}`}>
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

        {/* Chart Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col">
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 relative">
            
            {selectedCodes.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <BarChart2 size={48} className="mb-4 opacity-20" />
                <p>請選擇左側機場以檢視圖表</p>
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
                    formatter={(value: number) => new Intl.NumberFormat('zh-TW').format(value)}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
                  />
                  
                  {allAirports.map((airport, idx) => {
                    if (!selectedCodes.includes(airport.code)) return null;
                    const color = COLORS[idx % COLORS.length];
                    
                    return (
                      <Line
                        key={airport.code}
                        type="monotone"
                        dataKey={airport.code}
                        stroke={color}
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 7, strokeWidth: 0 }}
                        connectNulls
                        animationDuration={1500}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
            
          </div>
          <div className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
             圖表顯示各機場 {year} 年度的單月客運量趨勢。點擊圖例可快速聚焦。
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComparisonModal;