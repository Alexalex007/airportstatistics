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
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#d946ef', '#06b6d4', '#8b5cf6', '#ec4899', '#84cc16', '#6366f1',
];

const DATA_PREFIX = 'skymetrics_data_';
const YEARS_RANGE = [2026, 2025, 2024, 2023]; 

const CustomActiveDot = (props: any) => {
  const { cx, cy, stroke } = props;
  if (!cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={stroke} fillOpacity={0.2} />
      <circle cx={cx} cy={cy} r={5} fill="#fff" stroke={stroke} strokeWidth={2} />
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
          let hasData = false;
          for (let i = 0; i <= index; i++) {
            const v = series.data[i];
            if (v > 0) {
              sum += v;
              hasData = true;
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
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-300">
      
      {/* 1. Header (Fixed) */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-30">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-1.5 rounded-lg text-white shadow-lg shadow-blue-500/20">
                  <BarChart2 size={18} />
                </div>
                <h2 className="hidden sm:block text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  SkyMetrics <span className="text-blue-600 dark:text-blue-400">Lab</span>
                </h2>
              </div>

              {/* View Mode Toggle (Grid Layout) */}
              <div className="relative grid grid-cols-2 w-[220px] bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700/50">
                 <div 
                    className={`
                      absolute inset-y-1 rounded-md shadow-sm transition-transform duration-300 ease-out z-0
                      bg-white dark:bg-slate-600 ring-1 ring-black/5 dark:ring-white/5
                    `}
                    style={{
                      left: '4px',
                      width: 'calc((100% - 8px) / 2)',
                      transform: `translateX(${viewMode === 'compare' ? 0 : 100}%)`
                    }}
                 />

                 <button
                   onClick={() => setViewMode('compare')}
                   className={`relative z-10 w-full flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-colors duration-300 ${
                     viewMode === 'compare' 
                       ? 'text-blue-600 dark:text-blue-400' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                   }`}
                 >
                   <Layers size={14} />
                   <span className="whitespace-nowrap">{t('comparisonLab')}</span>
                 </button>
                 <button
                   onClick={() => setViewMode('history')}
                   className={`relative z-10 w-full flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-colors duration-300 ${
                     viewMode === 'history' 
                       ? 'text-purple-600 dark:text-purple-400' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                   }`}
                 >
                   <History size={14} />
                   <span className="whitespace-nowrap">{t('feature2Title')}</span>
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

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 relative bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
        
        {/* Controls Bar */}
        <div className="flex flex-col items-center gap-3 py-3 px-4 z-20 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 backdrop-blur-sm">
           
           <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <div className="shadow-sm rounded-full">
                  {viewMode === 'compare' ? (
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700 flex space-x-1">
                      {YEARS_RANGE.map(y => (
                        <button
                          key={y}
                          onClick={() => setTargetYear(y)}
                          className={`
                            px-3 py-1 rounded-full text-xs font-bold transition-all
                            ${targetYear === y 
                              ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' 
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
                          `}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-900/50 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">{t('subject')}:</span>
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

              {/* Chart Control Group */}
              <div className="flex items-center gap-2">
                  {viewMode === 'compare' && (
                    <div className="relative grid grid-cols-2 w-[160px] bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-full border border-white/20 dark:border-white/5 shadow-inner">
                          <div 
                             className={`
                               absolute inset-y-1 rounded-full shadow-sm transition-transform duration-300 ease-out z-0
                               bg-white dark:bg-slate-600 ring-1 ring-black/5 dark:ring-white/10
                             `}
                             style={{
                               left: '4px',
                               width: 'calc((100% - 8px) / 2)',
                               transform: `translateX(${chartType === 'monthly' ? 0 : 100}%)`
                             }}
                          />
                          <button
                            onClick={() => setChartType('monthly')}
                            className={`relative z-10 w-full text-center px-1 py-1 rounded-full text-[10px] font-bold transition-colors duration-300 ${chartType === 'monthly' ? 'text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}
                          >
                            {t('chartMonthly')}
                          </button>
                          <button
                            onClick={() => setChartType('cumulative')}
                            className={`relative z-10 w-full text-center px-1 py-1 rounded-full text-[10px] font-bold transition-colors duration-300 ${chartType === 'cumulative' ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`}
                          >
                            {t('chartCumulative')}
                          </button>
                    </div>
                  )}
              </div>
           </div>

           {activeSeries.length > 0 && (
              <div className="w-full animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between px-2 mb-2">
                     <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Activity size={12} className="text-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {t('months')[focusedIndex]} {viewMode === 'compare' ? targetYear : ''} 
                            {chartType === 'cumulative' && viewMode === 'compare' ? ` (${t('chartCumulative')})` : ''}
                        </span>
                     </div>
                  </div>
                  
                  <div className="flex overflow-x-auto no-scrollbar gap-3 px-1 pb-1">
                      {[...activeSeries]
                        .sort((a, b) => {
                            const valA = getDisplayValue(a) || 0;
                            const valB = getDisplayValue(b) || 0;
                            return valB - valA;
                        })
                        .map(series => {
                          const val = getDisplayValue(series);
                          return (
                              <div 
                                key={series.id} 
                                className="flex-shrink-0 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-sm min-w-[100px] transition-all duration-300"
                                style={{ borderLeft: `3px solid ${series.color}` }}
                              >
                                  <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5">
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
             <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 select-none animate-in fade-in zoom-in duration-300">
               <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4">
                 <Plus size={24} className="opacity-50" />
               </div>
               <p className="text-sm font-bold opacity-60">
                 {viewMode === 'compare' ? t('clickToCompare') : t('clickToHistory')}
               </p>
            </div>
          ) : (
             <div className="absolute inset-0 pb-20 sm:pb-24 px-2 sm:px-6">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                            <stop offset="5%" stopColor={series.color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={series.color} stopOpacity={0} />
                          </linearGradient>
                        );
                      })}
                    </defs>

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
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                      tickFormatter={formatYAxis}
                      width={40}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent', stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                      content={() => null} 
                    />
                    
                    {activeSeries.map((series) => {
                      const isHovered = hoveredSeriesId === series.id;
                      const isDimmed = hoveredSeriesId && hoveredSeriesId !== series.id;
                      
                      const commonProps = {
                         key: series.id,
                         dataKey: series.id,
                         animationDuration: 500,
                         onMouseEnter: () => setHoveredSeriesId(series.id),
                      };

                      const lineProps = {
                          ...commonProps,
                          type: "monotone" as const,
                          stroke: series.color,
                          strokeWidth: isHovered ? 4 : 3,
                          strokeOpacity: isDimmed ? 0.15 : 1,
                          activeDot: <CustomActiveDot />,
                          dot: false,
                          connectNulls: true,
                          style: {
                              filter: isHovered ? `drop-shadow(0 0 8px ${series.color})` : 'none',
                              transition: 'filter 0.3s ease'
                          }
                      };

                      if (viewMode === 'compare' && chartType === 'cumulative') {
                          return (
                              <Area
                                {...lineProps}
                                fill={`url(#gradient-${series.id})`}
                                fillOpacity={isDimmed ? 0.1 : 0.8}
                                strokeOpacity={isDimmed ? 0.3 : 1}
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

      {/* 3. Controls Dock (Fixed Bottom) */}
      <div className="flex-shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-30 pb-safe">
        <div className="max-w-7xl mx-auto w-full px-4 py-4 overflow-x-auto custom-scrollbar">
           <div className="flex items-center space-x-3 min-w-max">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 sticky left-0 bg-white/90 dark:bg-slate-900/90 px-2 z-10 flex items-center">
                 <Plus size={14} className="mr-1" />
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