import React from 'react';
import {
  ComposedChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  defs,
  linearGradient,
  stop
} from 'recharts';
import { ChartDataPoint } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsChartProps {
  data: ChartDataPoint[];
  title: string;
  isDarkMode?: boolean;
}

const CustomTooltip = ({ active, payload, label, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    const currentData = payload.find((p: any) => p.dataKey === 'passengers');
    const prevData = payload.find((p: any) => p.dataKey === 'comparison');

    const currentVal = currentData ? currentData.value : 0;
    const prevVal = prevData ? prevData.value : null;

    let growthRate = null;
    let growthAbs = null;

    if (prevVal !== null && prevVal > 0) {
      growthAbs = currentVal - prevVal;
      growthRate = ((growthAbs / prevVal) * 100).toFixed(1);
    }

    const isPositive = growthRate && parseFloat(growthRate) >= 0;

    return (
      <div className={`
        p-4 rounded-xl shadow-xl border backdrop-blur-md min-w-[200px]
        ${isDarkMode 
          ? 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-black/50' 
          : 'bg-white/90 border-white/50 text-slate-800 shadow-blue-100/50'}
      `}>
        <p className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </p>

        <div className="space-y-3">
          {/* Current Year */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-cyan-400' : 'bg-blue-600'}`}></div>
              <span className="text-xs font-medium opacity-80">本期數據</span>
            </div>
            <span className="text-lg font-black font-mono">
              {new Intl.NumberFormat('zh-TW').format(currentVal)}
            </span>
          </div>

          {/* Previous Year */}
          {prevVal !== null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-slate-300' : 'bg-slate-500'}`}></div>
                <span className="text-xs font-medium opacity-80">去年同期</span>
              </div>
              <span className="text-sm font-bold font-mono opacity-80">
                {new Intl.NumberFormat('zh-TW').format(prevVal)}
              </span>
            </div>
          )}

          {/* Growth Rate Badge */}
          {growthRate !== null && (
            <div className={`
              mt-2 flex items-center justify-between pt-3 border-t border-dashed
              ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}
            `}>
              <span className="text-xs font-medium opacity-70">YoY 成長率</span>
              <div className={`
                flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold
                ${isPositive 
                  ? (isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                  : (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')
                }
              `}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}{growthRate}%
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const StatsChart: React.FC<StatsChartProps> = ({ data, title, isDarkMode = false }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatXAxis = (period: string) => {
    const parts = period.split(' ');
    // On mobile, we might want even shorter labels, but with scrolling, "2024 Jan" is fine.
    // Let's just return the Month to keep it clean if the year is obvious from context, 
    // or return short form.
    return parts.length > 1 ? parts[1] : period;
  };

  // --- Theme Colors ---
  const axisColor = isDarkMode ? '#94a3b8' : '#64748b'; 
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0'; 
  
  // Legend Color
  const legendColor = isDarkMode ? '#cbd5e1' : '#475569';

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <p className="text-slate-400 dark:text-slate-500">暫無圖表數據</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="mb-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 border-l-4 border-blue-500 pl-3">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-4">
          滑動圖表以查看更多月份數據
        </p>
      </div>
      
      {/* 
        Scrollable Container for Mobile 
        - overflow-x-auto: Enables horizontal scrolling
        - custom-scrollbar: Uses the style defined in index.html
      */}
      <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
        {/* 
           Min-width constraint:
           This forces the chart to be at least 600px wide. 
           On desktop (>600px), it fits naturally. 
           On mobile (<600px), it triggers the scroll.
        */}
        <div className="h-[300px] sm:h-[350px] lg:h-[400px] min-w-[600px] sm:min-w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              barGap={0}
            >
              <defs>
                {/* Light Mode Gradient */}
                <linearGradient id="colorCurrentLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8}/>
                </linearGradient>
                
                {/* Dark Mode Gradient (Neon) */}
                <linearGradient id="colorCurrentDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                </linearGradient>

                {/* Comparison Area Gradient (Enhanced Visibility) */}
                <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDarkMode ? '#cbd5e1' : '#64748b'} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={isDarkMode ? '#cbd5e1' : '#64748b'} stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={gridColor} 
                strokeOpacity={0.5}
              />
              
              <XAxis 
                dataKey="period" 
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 12, fontWeight: 500 }}
                dy={10}
                interval={0} // Show all labels because we have scroll
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 11 }}
                tickFormatter={formatNumber}
                width={45}
              />
              
              <Tooltip 
                content={<CustomTooltip isDarkMode={isDarkMode} />} 
                cursor={{ fill: isDarkMode ? '#ffffff' : '#000000', opacity: 0.05 }}
              />
              
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                verticalAlign="top" 
                align="right"
                height={36}
                formatter={(value) => {
                  return (
                    <span style={{ color: legendColor, fontSize: '12px', fontWeight: 600, marginLeft: '4px' }}>
                      {value === 'passengers' ? '本期數據' : '去年同期'}
                    </span>
                  )
                }}
              />
              
              {/* Previous Year: Area/Line Context - ENHANCED */}
              <Area
                type="monotone"
                dataKey="comparison"
                name="comparison"
                stroke={isDarkMode ? '#cbd5e1' : '#64748b'}
                strokeWidth={3}
                strokeDasharray="4 4"
                fill="url(#colorPrev)"
                activeDot={{ r: 6, fill: isDarkMode ? '#fff' : '#64748b', strokeWidth: 0 }}
                animationDuration={1500}
              />

              {/* Current Year: Gradient Bar Focus */}
              <Bar 
                dataKey="passengers" 
                name="passengers" 
                fill={isDarkMode ? "url(#colorCurrentDark)" : "url(#colorCurrentLight)"}
                radius={[6, 6, 0, 0]} 
                maxBarSize={60}
                animationDuration={1000}
              />
              
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsChart;