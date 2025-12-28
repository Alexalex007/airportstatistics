import React, { useState, useMemo, useEffect } from 'react';
import { X, BarChart2, Plus, Calendar, Layers, TrendingUp, History, Plane } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { AirportDefinition } from '../types';
import { fetchAirportStats } from '../services/geminiService';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  allAirports: AirportDefinition[];
  results?: any; 
  year?: number; 
}

interface ChartSeries {
  id: string; // Unique ID: "HKG-2024" or "2024" (in history mode)
  code: string;
  name: string;
  year: number;
  data: number[]; // Array of 12 numbers
  total: number;
  peak: number;
  color: string;
}

// Mode Definitions
type ViewMode = 'compare' | 'history';
type ChartType = 'monthly' | 'cumulative';

// Neon / Vivid Color Palette
const COLORS = [
  '#3b82f6', // Blue 500
  '#ef4444', // Red 500
  '#10b981', // Emerald 500
  '#f59e0b', // Amber 500
  '#d946ef', // Fuchsia 500
  '#06b6d4', // Cyan 500
  '#8b5cf6', // Violet 500
  '#ec4899', // Pink 500
  '#84cc16', // Lime 500
  '#6366f1', // Indigo 500
];

const DATA_PREFIX = 'skymetrics_data_';
const YEARS_RANGE = [2026, 2025, 2024, 2023]; 

// --- Custom Active Dot Component ---
const CustomActiveDot = (props: any) => {
  const { cx, cy, stroke } = props;
  if (!cx || !cy) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill={stroke} fillOpacity={0.2} />
      <circle cx={cx} cy={cy} r={6} fill="#fff" stroke={stroke} strokeWidth={2} />
      <foreignObject x={cx - 10} y={cy - 10} width={20} height={20}>
         <div style={{ color: stroke, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <Plane size={14} style={{ transform: 'rotate(-45deg)' }} />
         </div>
      </foreignObject>
    </g>
  );
};

const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  allAirports,
  year = 2025
}) => {
  // --- State Management ---
  
  // 1. View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('compare');
  
  // 2. Multi-Airport Mode State
  const [targetYear, setTargetYear] = useState<number>(year);
  const [compareSeries, setCompareSeries] = useState<ChartSeries[]>([]);
  const [chartType, setChartType] = useState<ChartType>('monthly');

  // 3. Historical Mode State
  const [selectedHistoryAirport, setSelectedHistoryAirport] = useState<AirportDefinition>(allAirports[0]);
  const [historySeries, setHistorySeries] = useState<ChartSeries[]>([]);

  // 4. Shared UI State
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [hoveredSeriesId, setHoveredSeriesId] = useState<string | null>(null);

  // Helper: Assign color
  const getNextColor = (currentSeries: ChartSeries[]) => {
    const usedColors = currentSeries.map(s => s.color);
    const available = COLORS.find(c => !usedColors.includes(c));
    return available || COLORS[currentSeries.length % COLORS.length];
  };

  // --- Data Fetching Logic ---

  const fetchSeriesData = async (airport: AirportDefinition, reqYear: number): Promise<number[] | null> => {
    setLoadingStates(prev => ({ ...prev, [`${airport.code}-${reqYear}`]: true }));
    try {
      let chartData: { passengers: number }[] = [];
      if (airport.isCustom) {
        const key = `${DATA_PREFIX}${airport.code}_${reqYear}`;
        const savedStr = localStorage.getItem(key);
        if (savedStr) {
          chartData = JSON.parse(savedStr).chartData;
        }
      } else {
         const result = await fetchAirportStats(airport.code, reqYear);
         chartData = result.chartData;
      }
      return chartData.map(d => d.passengers);
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setLoadingStates(prev => ({ ...prev, [`${airport.code}-${reqYear}`]: false }));
    }
  };

  // Handler: Toggle Airport in "Compare Mode"
  const toggleCompareAirport = async (airport: AirportDefinition) => {
    const targetId = `${airport.code}-${targetYear}`;
    
    // Remove if exists
    if (compareSeries.some(s => s.id === targetId)) {
      setCompareSeries(prev => prev.filter(s => s.id !== targetId));
      return;
    }

    // Add
    const dataArray = await fetchSeriesData(airport, targetYear);
    if (!dataArray || !dataArray.some(v => v > 0)) {
       // Ideally use a toast here
       return;
    }

    const total = dataArray.reduce((a, b) => a + b, 0);
    const peak = Math.max(...dataArray);

    setCompareSeries(prev => [...prev, {
      id: targetId,
      code: airport.code,
      name: airport.name,
      year: targetYear,
      data: dataArray,
      total,
      peak,
      color: getNextColor(prev)
    }]);
  };

  // Handler: Toggle Year in "History Mode"
  const toggleHistoryYear = async (reqYear: number) => {
    const targetId = `${reqYear}`; // ID is just the year in this mode
    
    // Remove if exists
    if (historySeries.some(s => s.id === targetId)) {
      setHistorySeries(prev => prev.filter(s => s.id !== targetId));
      return;
    }

    // Add
    const dataArray = await fetchSeriesData(selectedHistoryAirport, reqYear);
    if (!dataArray || !dataArray.some(v => v > 0)) {
       return;
    }

    const total = dataArray.reduce((a, b) => a + b, 0);
    const peak = Math.max(...dataArray);

    setHistorySeries(prev => {
        // Sort series by year for better legend order
        const newSeries = [...prev, {
          id: targetId,
          code: reqYear.toString(), // Display as Year
          name: reqYear.toString(),
          year: reqYear,
          data: dataArray,
          total,
          peak,
          color: getNextColor(prev)
        }];
        return newSeries.sort((a, b) => b.year - a.year);
    });
  };

  // Reset history series when changing airport in History Mode
  const handleHistoryAirportChange = (airport: AirportDefinition) => {
    setSelectedHistoryAirport(airport);
    setHistorySeries([]); // Clear chart on airport switch
  };

  // --- Chart Data Transformation ---

  // Decide which list to use based on mode
  const activeSeries = viewMode === 'compare' ? compareSeries : historySeries;

  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    return months.map((month, index) => {
      const dataPoint: any = { name: month };
      
      activeSeries.forEach(series => {
        let val: number | null = null;

        if (viewMode === 'compare' && chartType === 'cumulative') {
          // Cumulative Logic
          let sum = 0;
          let hasData = false;
          // Sum up to current index
          for (let i = 0; i <= index; i++) {
            const v = series.data[i];
            if (v > 0) {
              sum += v;
              hasData = true;
            }
          }
          // Only show point if we have encountered data at least once. 
          // If the year hasn't started or no data yet, it might be weird.
          // For simplicity: if sum > 0, show it.
          val = sum > 0 ? sum : null;
        } else {
          // Normal Monthly Logic
          val = (series.data[index] && series.data[index] > 0) ? series.data[index] : null;
        }
        
        dataPoint[series.id] = val;
      });
      return dataPoint;
    });
  }, [activeSeries, viewMode, chartType]);

  const formatYAxis = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Re-fetch when changing year in Compare Mode (optional enhancement: could clear or auto-refetch)
  useEffect(() => {
     setCompareSeries([]); // Simple reset for now to avoid confusion
  }, [targetYear]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-300">
      
      {/* 1. Header & Mode Switcher */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-20">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
            {/* Title & Mode Tabs */}
            <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-1.5 rounded-lg text-white shadow-lg shadow-blue-500/20">
                  <BarChart2 size={18} />
                </div>
                <h2 className="hidden sm:block text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  SkyMetrics <span className="text-blue-600 dark:text-blue-400">Lab</span>
                </h2>
              </div>

              {/* View Mode Toggle (Segmented Control) */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                 <button
                   onClick={() => setViewMode('compare')}
                   className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                     viewMode === 'compare' 
                       ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                   }`}
                 >
                   <Layers size={14} />
                   <span className="whitespace-nowrap">多機場對比</span>
                 </button>
                 <button
                   onClick={() => setViewMode('history')}
                   className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                     viewMode === 'history' 
                       ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                   }`}
                 >
                   <History size={14} />
                   <span className="whitespace-nowrap">歷史趨勢</span>
                 </button>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
            >
              <X size={24} />
            </button>
        </div>
      </div>

      {/* 2. Chart Area (Center Fluid) */}
      <div className="flex-1 relative bg-white dark:bg-slate-950 overflow-hidden flex flex-col">
        
        {/* Floating Controls Overlay (Top Center) */}
        <div className="absolute top-4 left-0 right-0 z-10 flex flex-col items-center pointer-events-none gap-2">
           
           {/* Row 1: Main Control (Year for Compare / Airport for History) */}
           <div className="pointer-events-auto shadow-lg rounded-full">
              {viewMode === 'compare' ? (
                // Compare Mode: Year Selector
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-full border border-slate-200 dark:border-slate-700 flex space-x-1">
                   {YEARS_RANGE.map(y => (
                     <button
                       key={y}
                       onClick={() => setTargetYear(y)}
                       className={`
                         px-3 py-1 rounded-full text-xs font-bold transition-all
                         ${targetYear === y 
                           ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow' 
                           : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
                       `}
                     >
                       {y}
                     </button>
                   ))}
                </div>
              ) : (
                // History Mode: Airport Selector (Simple Dropdown Simulation via horizontal scroll or select)
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-900/50 flex items-center gap-2">
                   <span className="text-xs font-bold text-slate-400 uppercase">Subject:</span>
                   <select 
                      value={selectedHistoryAirport.code}
                      onChange={(e) => {
                        const ap = allAirports.find(a => a.code === e.target.value);
                        if(ap) handleHistoryAirportChange(ap);
                      }}
                      className="bg-transparent text-sm font-black text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                   >
                      {allAirports.map(ap => (
                        <option key={ap.code} value={ap.code}>{ap.code} - {ap.name}</option>
                      ))}
                   </select>
                </div>
              )}
           </div>

           {/* Row 2: Sub Control (Chart Type for Compare Mode Only) */}
           {viewMode === 'compare' && (
             <div className="pointer-events-auto">
               <div className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-0.5 rounded-full border border-slate-200 dark:border-slate-700 flex text-[10px] font-bold">
                  <button
                    onClick={() => setChartType('monthly')}
                    className={`px-3 py-1 rounded-full transition-all ${chartType === 'monthly' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-slate-500'}`}
                  >
                    單月流量
                  </button>
                  <button
                    onClick={() => setChartType('cumulative')}
                    className={`px-3 py-1 rounded-full transition-all ${chartType === 'cumulative' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-300 shadow-sm' : 'text-slate-500'}`}
                  >
                    累計流量
                  </button>
               </div>
             </div>
           )}
        </div>

        <div className="flex-1 w-full h-full p-4 sm:p-6 pt-24 sm:pt-24">
          {activeSeries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 select-none animate-in fade-in zoom-in duration-300">
               <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4">
                 <Plus size={24} className="opacity-50" />
               </div>
               <p className="text-sm font-bold opacity-60">
                 {viewMode === 'compare' ? '點擊下方選擇機場以對比' : '點擊下方選擇年份以查看趨勢'}
               </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                onMouseLeave={() => setHoveredSeriesId(null)}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="#e2e8f0" 
                  strokeOpacity={0.1}
                  className="dark:stroke-slate-700" 
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                  tickFormatter={formatYAxis}
                  width={40}
                />
                <Tooltip
                  itemSorter={(item) => (item.value as number) * -1}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    padding: '12px',
                    color: '#f8fafc'
                  }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600, padding: '2px 0' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '12px', fontWeight: 700 }}
                  formatter={(value: number, name: string) => {
                      const s = activeSeries.find(item => item.id === name);
                      const label = s ? (viewMode === 'compare' ? s.code : `${s.year}年`) : name;
                      return [new Intl.NumberFormat('zh-TW').format(value), label];
                  }}
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                
                {activeSeries.map((series) => {
                  const isHovered = hoveredSeriesId === series.id;
                  const isDimmed = hoveredSeriesId && hoveredSeriesId !== series.id;

                  return (
                    <Line
                      key={series.id}
                      type="monotone"
                      dataKey={series.id}
                      stroke={series.color}
                      strokeWidth={isHovered ? 4 : 3}
                      strokeOpacity={isDimmed ? 0.15 : 1}
                      dot={false}
                      activeDot={<CustomActiveDot />} 
                      connectNulls
                      animationDuration={800}
                      onMouseEnter={() => setHoveredSeriesId(series.id)}
                      onMouseLeave={() => setHoveredSeriesId(null)}
                      style={{
                        filter: isHovered ? `drop-shadow(0 0 8px ${series.color})` : 'none',
                        transition: 'filter 0.3s ease'
                      }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Controls Dock (Bottom Fixed) */}
      <div className="flex-shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-30 pb-safe">
        <div className="max-w-7xl mx-auto w-full px-4 py-4 overflow-x-auto custom-scrollbar">
           <div className="flex items-center space-x-3 min-w-max">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 sticky left-0 bg-white/90 dark:bg-slate-900/90 px-2 z-10">
                {viewMode === 'compare' ? 'Add Airport' : 'Add Year'}
              </span>
              
              {/* Conditional Rendering based on View Mode */}
              {viewMode === 'compare' ? (
                // MODE: Multi-Airport Chips
                allAirports.map((airport) => {
                  const targetId = `${airport.code}-${targetYear}`;
                  const isSelected = compareSeries.some(s => s.id === targetId);
                  const isLoading = loadingStates[`${airport.code}-${targetYear}`];
                  const seriesColor = compareSeries.find(s => s.id === targetId)?.color;

                  return (
                    <button
                      key={airport.code}
                      onClick={() => toggleCompareAirport(airport)}
                      onMouseEnter={() => isSelected && setHoveredSeriesId(targetId)}
                      onMouseLeave={() => setHoveredSeriesId(null)}
                      disabled={isLoading}
                      className={`
                        relative group flex items-center space-x-2 pl-2 pr-4 py-2 rounded-full border transition-all duration-300
                        ${isSelected 
                          ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-lg transform -translate-y-1' 
                          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'}
                      `}
                      style={isSelected ? { borderColor: seriesColor, boxShadow: `0 4px 12px -2px ${seriesColor}40` } : {}}
                    >
                      <div 
                        className={`w-2.5 h-2.5 rounded-full transition-all ${isSelected ? 'scale-110' : 'scale-100 opacity-50'}`}
                        style={{ backgroundColor: isSelected ? seriesColor : 'currentColor' }}
                      />
                      <span className="text-sm font-black font-mono tracking-tight">{airport.code}</span>
                      {isLoading && (
                         <div className="absolute inset-0 bg-inherit rounded-full flex items-center justify-center opacity-80">
                           <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                         </div>
                      )}
                    </button>
                  );
                })
              ) : (
                // MODE: Historical Year Chips
                YEARS_RANGE.map((y) => {
                   const targetId = `${y}`;
                   const isSelected = historySeries.some(s => s.id === targetId);
                   const isLoading = loadingStates[`${selectedHistoryAirport.code}-${y}`];
                   const seriesColor = historySeries.find(s => s.id === targetId)?.color;

                   return (
                     <button
                        key={y}
                        onClick={() => toggleHistoryYear(y)}
                        onMouseEnter={() => isSelected && setHoveredSeriesId(targetId)}
                        onMouseLeave={() => setHoveredSeriesId(null)}
                        disabled={isLoading}
                        className={`
                          relative group flex items-center space-x-2 pl-2 pr-4 py-2 rounded-full border transition-all duration-300
                          ${isSelected 
                            ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-lg transform -translate-y-1' 
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500'}
                        `}
                        style={isSelected ? { borderColor: seriesColor, boxShadow: `0 4px 12px -2px ${seriesColor}40` } : {}}
                     >
                        <div 
                          className={`w-2.5 h-2.5 rounded-full transition-all ${isSelected ? 'scale-110' : 'scale-100 opacity-50'}`}
                          style={{ backgroundColor: isSelected ? seriesColor : 'currentColor' }}
                        />
                        <span className="text-sm font-black font-mono tracking-tight">{y}</span>
                        {isLoading && (
                           <div className="absolute inset-0 bg-inherit rounded-full flex items-center justify-center opacity-80">
                             <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                           </div>
                        )}
                     </button>
                   );
                })
              )}
           </div>
        </div>
      </div>

    </div>
  );
};

export default ComparisonModal;