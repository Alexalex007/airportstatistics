import React, { useState, useMemo, useEffect } from 'react';
import { X, BarChart2, Plus, Calendar, Layers, TrendingUp, History, Plane, Hand, Activity, ChevronRight, BarChartBig, LineChart as LineChartIcon } from 'lucide-react';
import {
  ComposedChart, 
  Line,
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  defs, 
  linearGradient, 
  stop 
} from 'recharts';
import { AirportDefinition } from '../types';
import { fetchAirportStats } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  allAirports: AirportDefinition[];
  results?: any; 
  year?: number; 
}

interface ChartSeries {
  id: string; 
  code: string;
  name: string;
  year: number;
  data: number[];
  total: number;
  peak: number;
  color: string;
}

type ViewMode = 'compare' | 'history';
type ChartType = 'monthly' | 'cumulative';

const COLORS = [
  '#2563eb', // Blue
  '#dc2626', // Red
  '#059669', // Emerald
  '#d97706', // Amber
  '#9333ea', // Purple
  '#0891b2', // Cyan
  '#db2777', // Pink
  '#65a30d', // Lime
  '#4f46e5', // Indigo
  '#ea580c', // Orange
];

const DATA_PREFIX = 'skymetrics_data_';
const YEARS_RANGE = [2026, 2025, 2024, 2023]; 

const CustomActiveDot = (props: any) => {
  const { cx, cy, stroke } = props;
  if (!cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={stroke} fillOpacity={0.3} />
      <circle cx={cx} cy={cy} r={4.5} fill="#fff" stroke={stroke} strokeWidth={2} />
    </g>
  );
};

const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  allAirports,
  results,
  year = 2025
}) => {
  const { t, language } = useLanguage();
  
  const [viewMode, setViewMode] = useState<ViewMode>('compare');
  const [targetYear, setTargetYear] = useState<number>(year);
  const [compareSeries, setCompareSeries] = useState<ChartSeries[]>([]);
  const [chartType, setChartType] = useState<ChartType>('monthly');

  const [selectedHistoryAirport, setSelectedHistoryAirport] = useState<AirportDefinition>(allAirports[0]);
  const [historySeries, setHistorySeries] = useState<ChartSeries[]>([]);

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [hoveredSeriesId, setHoveredSeriesId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(11); 

  const getNextColor = (currentSeries: ChartSeries[]) => {
    const usedColors = currentSeries.map(s => s.color);
    const available = COLORS.find(c => !usedColors.includes(c));
    return available || COLORS[currentSeries.length % COLORS.length];
  };

  const fetchSeriesData = async (airport: AirportDefinition, reqYear: number): Promise<number[] | null> => {
    const key = `${DATA_PREFIX}${airport.code}_${reqYear}`;
    const savedStr = localStorage.getItem(key);

    if (savedStr) {
        try {
            const parsed = JSON.parse(savedStr);
            if (parsed && parsed.chartData) {
                return parsed.chartData.map((d: any) => d.passengers);
            }
        } catch (e) {
            console.error("Error parsing local data", e);
        }
    }

    try {
        const result = await fetchAirportStats(airport.code, reqYear, language);
        return result.chartData.map(d => d.passengers);
    } catch (e) {
        return null;
    }
  };

  useEffect(() => {
    const refreshActiveData = async () => {
        if (compareSeries.length > 0) {
            const updatedCompareSeries = await Promise.all(compareSeries.map(async (series) => {
                const airport = allAirports.find(a => a.code === series.code);
                const airportDef = airport || { code: series.code, name: series.name, isCustom: true };
                
                const data = await fetchSeriesData(airportDef, series.year);
                if (!data) return series; 

                const total = data.reduce((a, b) => a + b, 0);
                const peak = Math.max(...data);
                return { ...series, data, total, peak };
            }));
            setCompareSeries(updatedCompareSeries);
        }

        if (historySeries.length > 0 && selectedHistoryAirport) {
            const updatedHistorySeries = await Promise.all(historySeries.map(async (series) => {
                const data = await fetchSeriesData(selectedHistoryAirport, series.year);
                if (!data) return series;

                const total = data.reduce((a, b) => a + b, 0);
                const peak = Math.max(...data);
                return { ...series, data, total, peak };
            }));
            setHistorySeries(updatedHistorySeries);
        }
    };

    if (isOpen) {
        refreshActiveData();
    }
  }, [results, allAirports, isOpen, selectedHistoryAirport, language]); 

  const activeSeries = viewMode === 'compare' ? compareSeries : historySeries;

  useEffect(() => {
     let maxIndex = 0;
     activeSeries.forEach(s => {
         for(let i = 11; i >= 0; i--) {
             if (s.data[i] > 0) {
                 if (i > maxIndex) maxIndex = i;
                 break;
             }
         }
     });
     setFocusedIndex(maxIndex);
  }, [activeSeries, viewMode]);

  const toggleCompareAirport = async (airport: AirportDefinition) => {
    const targetId = `${airport.code}-${targetYear}`;
    
    if (compareSeries.some(s => s.id === targetId)) {
      setCompareSeries(prev => prev.filter(s => s.id !== targetId));
      return;
    }

    setLoadingStates(prev => ({ ...prev, [`${airport.code}-${targetYear}`]: true }));
    const dataArray = await fetchSeriesData(airport, targetYear);
    setLoadingStates(prev => ({ ...prev, [`${airport.code}-${targetYear}`]: false }));

    if (!dataArray || !dataArray.some(v => v > 0)) {
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

  const toggleHistoryYear = async (reqYear: number) => {
    const targetId = `${reqYear}`; 
    
    if (historySeries.some(s => s.id === targetId)) {
      setHistorySeries(prev => prev.filter(s => s.id !== targetId));
      return;
    }

    setLoadingStates(prev => ({ ...prev, [`${selectedHistoryAirport.code}-${reqYear}`]: true }));
    const dataArray = await fetchSeriesData(selectedHistoryAirport, reqYear);
    setLoadingStates(prev => ({ ...prev, [`${selectedHistoryAirport.code}-${reqYear}`]: false }));

    if (!dataArray || !dataArray.some(v => v > 0)) {
       return;
    }

    const total = dataArray.reduce((a, b) => a + b, 0);
    const peak = Math.max(...dataArray);

    setHistorySeries(prev => {
        const newSeries = [...prev, {
          id: targetId,
          code: reqYear.toString(), 
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

  const handleHistoryAirportChange = (airport: AirportDefinition) => {
    setSelectedHistoryAirport(airport);
    setHistorySeries([]); 
  };

  const chartData = useMemo(() => {
    return t('months').map((month: string, index: number) => {
      const dataPoint: any = { name: month };
      
      activeSeries.forEach(series => {
        let val: number | null = null;

        if (viewMode === 'compare' && chartType === 'cumulative') {
          let sum = 0;
          for (let i = 0; i <= index; i++) {
            const v = series.data[i];
            if (v > 0) {
              sum += v;
            }
          }
          val = sum > 0 ? sum : null;
        } else {
          val = (series.data[index] && series.data[index] > 0) ? series.data[index] : null;
        }
        
        dataPoint[series.id] = val;
      });
      return dataPoint;
    });
  }, [activeSeries, viewMode, chartType, t]);

  const formatYAxis = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatValue = (num: number | null | undefined) => {
      if (num === null || num === undefined || num === 0) return '-';
      if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
      return num.toLocaleString();
  };

  useEffect(() => {
     setCompareSeries([]); 
  }, [targetYear]);

  const getDisplayValue = (series: ChartSeries) => {
      if (viewMode === 'compare' && chartType === 'cumulative') {
          let sum = 0;
          for(let i = 0; i <= focusedIndex; i++) {
              if (series.data[i]) sum += series.data[i];
          }
          return sum;
      } else {
          return series.data[focusedIndex];
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/60 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* 1. Header (Fixed Glass Navbar) */}
      <div className="flex-shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm z-30">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
                  <BarChart2 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                    SkyMetrics <span className="text-blue-600 dark:text-blue-400">Lab</span>
                  </h2>
                  <p className="hidden sm:block text-[10px] text-slate-400 font-medium">Multi-Airport & Trend Analysis</p>
                </div>
              </div>

              {/* View Mode Toggle (Centered Segmented Switch) */}
              <div className="relative grid grid-cols-2 w-[260px] bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
                 <div 
                    className="absolute inset-y-1 rounded-lg shadow-sm transition-transform duration-300 ease-out z-0 bg-white dark:bg-slate-700 ring-1 ring-black/5 dark:ring-white/10"
                    style={{
                      left: '4px',
                      width: 'calc((100% - 8px) / 2)',
                      transform: `translateX(${viewMode === 'compare' ? 0 : 100}%)`
                    }}
                 />

                 <button
                   onClick={() => setViewMode('compare')}
                   className={`relative z-10 w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 ${
                     viewMode === 'compare' 
                       ? 'text-blue-600 dark:text-blue-400' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                   }`}
                 >
                   <Layers size={14} className="flex-shrink-0" />
                   <span className="whitespace-nowrap">{t('comparisonLab')}</span>
                 </button>
                 <button
                   onClick={() => setViewMode('history')}
                   className={`relative z-10 w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 ${
                     viewMode === 'history' 
                       ? 'text-purple-600 dark:text-purple-400' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                   }`}
                 >
                   <History size={14} className="flex-shrink-0" />
                   <span className="whitespace-nowrap">{t('feature2Title')}</span>
                 </button>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors flex-shrink-0 border border-slate-200/50 dark:border-slate-700/50"
              aria-label="Close"
            >
              <X size={20} />
            </button>
        </div>
      </div>

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 relative bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
        
        {/* Controls Toolbar */}
        <div className="flex flex-col items-center gap-3 py-3 px-4 z-20 bg-slate-50/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
           
           <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              {viewMode === 'compare' ? (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-1">
                  {YEARS_RANGE.map(y => (
                    <button
                      key={y}
                      onClick={() => setTargetYear(y)}
                      className={`
                        px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-200
                        ${targetYear === y 
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
                      `}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-900/50 shadow-sm flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">{t('subject')}:</span>
                  <select 
                      value={selectedHistoryAirport.code}
                      onChange={(e) => {
                        const ap = allAirports.find(a => a.code === e.target.value);
                        if(ap) handleHistoryAirportChange(ap);
                      }}
                      className="bg-transparent text-sm font-black text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                  >
                      {allAirports.map(ap => (
                        <option key={ap.code} value={ap.code} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                          {ap.code} - {ap.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Chart Control Group */}
              {viewMode === 'compare' && (
                <div className="relative grid grid-cols-2 w-[170px] bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-full border border-slate-300/40 dark:border-slate-700/40 shadow-inner">
                      <div 
                         className="absolute inset-y-1 rounded-full shadow-sm transition-transform duration-300 ease-out z-0 bg-white dark:bg-slate-700 ring-1 ring-black/5 dark:ring-white/10"
                         style={{
                           left: '4px',
                           width: 'calc((100% - 8px) / 2)',
                           transform: `translateX(${chartType === 'monthly' ? 0 : 100}%)`
                         }}
                      />
                      <button
                        onClick={() => setChartType('monthly')}
                        className={`relative z-10 w-full text-center px-1.5 py-1 rounded-full text-[11px] font-bold transition-colors duration-300 ${chartType === 'monthly' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        {t('chartMonthly')}
                      </button>
                      <button
                        onClick={() => setChartType('cumulative')}
                        className={`relative z-10 w-full text-center px-1.5 py-1 rounded-full text-[11px] font-bold transition-colors duration-300 ${chartType === 'cumulative' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        {t('chartCumulative')}
                      </button>
                </div>
              )}
           </div>

           {/* Live Stat Badges Strip */}
           {activeSeries.length > 0 && (
              <div className="w-full animate-in slide-in-from-top-2 duration-300 max-w-6xl mx-auto">
                  <div className="flex items-center justify-between px-2 mb-1.5">
                     <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Activity size={13} className="text-blue-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                            {t('months')[focusedIndex]} {viewMode === 'compare' ? targetYear : ''} 
                            {chartType === 'cumulative' && viewMode === 'compare' ? ` (${t('chartCumulative')})` : ''}
                        </span>
                     </div>
                  </div>
                  
                  <div className="flex overflow-x-auto no-scrollbar gap-2.5 px-1 pb-1">
                      {[...activeSeries]
                        .sort((a, b) => {
                            const valA = getDisplayValue(a) || 0;
                            const valB = getDisplayValue(b) || 0;
                            return valB - valA;
                        })
                        .map(series => {
                          const val = getDisplayValue(series);
                          const isHovered = hoveredSeriesId === series.id;
                          return (
                              <div 
                                key={series.id} 
                                onMouseEnter={() => setHoveredSeriesId(series.id)}
                                onMouseLeave={() => setHoveredSeriesId(null)}
                                className={`flex-shrink-0 flex items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border rounded-xl px-3.5 py-1.5 shadow-sm min-w-[110px] transition-all duration-200 cursor-pointer ${
                                  isHovered ? 'ring-2 ring-offset-1 dark:ring-offset-slate-900 shadow-md transform -translate-y-0.5' : 'border-slate-200 dark:border-slate-700'
                                }`}
                                style={{ 
                                  borderLeft: `4px solid ${series.color}`,
                                  ...(isHovered ? { ringColor: series.color } : {})
                                }}
                              >
                                  <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                                          {viewMode === 'compare' ? series.code : series.year}
                                      </span>
                                      <span className={`text-sm font-black font-mono leading-none ${val ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600'}`}>
                                          {formatValue(val)}
                                      </span>
                                  </div>
                              </div>
                          )
                      })}
                      <div className="w-2 flex-shrink-0"></div>
                  </div>
              </div>
           )}
        </div>

        {/* Chart Container */}
        <div className="flex-1 w-full min-h-0 relative">
          {activeSeries.length === 0 ? (
             <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 select-none animate-in fade-in zoom-in duration-300 p-6 text-center">
               <div className="w-20 h-20 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border-2 border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center mb-4 text-blue-500">
                 <Plus size={28} />
               </div>
               <h4 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
                 {viewMode === 'compare' ? t('addAirport') : t('addYear')}
               </h4>
               <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                 {viewMode === 'compare' ? t('clickToCompare') : t('clickToHistory')}
               </p>
            </div>
          ) : (
             <div className="absolute inset-0 pb-20 sm:pb-24 px-2 sm:px-6 pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 25 }}
                    onMouseMove={(state) => {
                        if (state.isTooltipActive && state.activeTooltipIndex !== undefined) {
                            setFocusedIndex(state.activeTooltipIndex);
                        }
                    }}
                    onMouseLeave={() => {
                         let maxIndex = 0;
                         activeSeries.forEach(s => {
                             for(let i = 11; i >= 0; i--) {
                                 if (s.data[i] > 0) {
                                     if (i > maxIndex) maxIndex = i;
                                     break;
                                 }
                             }
                         });
                         setFocusedIndex(maxIndex);
                         setHoveredSeriesId(null);
                    }}
                  >
                    <defs>
                      {activeSeries.map(series => {
                        const gradientId = `gradient-${series.id}`;
                        return (
                          <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={series.color} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={series.color} stopOpacity={0.02} />
                          </linearGradient>
                        );
                      })}
                    </defs>

                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke="#94a3b8" 
                      strokeOpacity={0.15}
                    />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                      dy={12}
                      tickMargin={8}
                      interval={0}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                      tickFormatter={formatYAxis}
                      width={45}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent', stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      content={() => null} 
                    />
                    
                    {activeSeries.map((series) => {
                      const isHovered = hoveredSeriesId === series.id;
                      
                      const commonProps = {
                         key: series.id,
                         dataKey: series.id,
                         animationDuration: 600,
                      };

                      const lineProps = {
                          ...commonProps,
                          type: "monotone" as const,
                          stroke: series.color,
                          strokeWidth: isHovered ? 4 : 2.75,
                          strokeOpacity: 1, // Keep all lines 100% visible - NO DIMMING!
                          activeDot: <CustomActiveDot />,
                          dot: false,
                          connectNulls: true,
                          style: {
                              filter: isHovered ? `drop-shadow(0 0 8px ${series.color})` : 'none',
                              transition: 'filter 0.3s ease, stroke-width 0.2s ease'
                          }
                      };

                      if (viewMode === 'compare' && chartType === 'cumulative') {
                          return (
                              <Area
                                {...lineProps}
                                fill={`url(#gradient-${series.id})`}
                                fillOpacity={isHovered ? 0.45 : 0.25}
                                strokeOpacity={1}
                              />
                          );
                      } else {
                          return (
                              <Line
                                {...lineProps}
                              />
                          );
                      }
                    })}
                  </ComposedChart>
                </ResponsiveContainer>
             </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Interactive Dock (Fixed Glass Bottom Bar) */}
      <div className="flex-shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/70 dark:border-slate-800/70 z-30 pb-safe shadow-lg">
        <div className="max-w-7xl mx-auto w-full px-4 py-3.5 overflow-x-auto custom-scrollbar">
           <div className="flex items-center space-x-2.5 min-w-max">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 sticky left-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg z-10 flex items-center border border-slate-200/50 dark:border-slate-700/50">
                 <Plus size={14} className="mr-1 text-blue-500" />
                {viewMode === 'compare' ? t('addAirport') : t('addYear')}
              </span>
              
              {viewMode === 'compare' ? (
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
                        relative group flex items-center space-x-2 pl-2.5 pr-4 py-2 rounded-xl border transition-all duration-200
                        ${isSelected 
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md' 
                          : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-slate-700'}
                      `}
                      style={isSelected ? { borderColor: seriesColor, boxShadow: `0 4px 14px -2px ${seriesColor}50` } : {}}
                    >
                      <div 
                        className={`w-2.5 h-2.5 rounded-full transition-transform ${isSelected ? 'scale-125' : 'scale-100 opacity-60'}`}
                        style={{ backgroundColor: isSelected ? seriesColor : 'currentColor' }}
                      />
                      <span className="text-sm font-black font-mono tracking-tight">{airport.code}</span>
                      {isLoading && (
                         <div className="absolute inset-0 bg-inherit rounded-xl flex items-center justify-center opacity-90">
                           <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                         </div>
                      )}
                    </button>
                  );
                })
              ) : (
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
                          relative group flex items-center space-x-2 pl-2.5 pr-4 py-2 rounded-xl border transition-all duration-200
                          ${isSelected 
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md' 
                            : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-slate-700'}
                        `}
                        style={isSelected ? { borderColor: seriesColor, boxShadow: `0 4px 14px -2px ${seriesColor}50` } : {}}
                     >
                        <div 
                          className={`w-2.5 h-2.5 rounded-full transition-transform ${isSelected ? 'scale-125' : 'scale-100 opacity-60'}`}
                          style={{ backgroundColor: isSelected ? seriesColor : 'currentColor' }}
                        />
                        <span className="text-sm font-black font-mono tracking-tight">{y}</span>
                        {isLoading && (
                           <div className="absolute inset-0 bg-inherit rounded-xl flex items-center justify-center opacity-90">
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
