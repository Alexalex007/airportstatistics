import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { ChartDataPoint } from '../types';

interface StatsChartProps {
  data: ChartDataPoint[];
  title: string;
  isDarkMode?: boolean;
}

const StatsChart: React.FC<StatsChartProps> = ({ data, title, isDarkMode = false }) => {
  // Check if we have comparison data in any of the points
  const hasComparison = data.some(d => d.comparison !== undefined && d.comparison !== null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatXAxis = (period: string) => {
    const parts = period.split(' ');
    return parts.length > 1 ? parts[1] : period;
  };

  // Define Colors based on Theme
  const axisColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400 vs slate-500
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0'; // slate-700 vs slate-200
  const tooltipBg = isDarkMode ? '#1e293b' : '#fff';    // slate-800 vs white
  const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';
  const tooltipText = isDarkMode ? '#f1f5f9' : '#1e293b';
  const legendText = isDarkMode ? '#cbd5e1' : '#475569';

  if (data.length === 0) {
    return (
      <div className="h-[280px] sm:h-[400px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <p className="text-slate-400 dark:text-slate-500">暫無圖表數據</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col items-center justify-center mb-6 gap-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 text-center">
          {title}
        </h3>
      </div>
      
      <div className="h-[280px] sm:h-[350px] lg:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis 
              dataKey="period" 
              tickFormatter={formatXAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 11 }}
              dy={10}
              interval="preserveStartEnd"
              minTickGap={5}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 11 }}
              tickFormatter={formatNumber}
              width={45}
            />
            <Tooltip
              cursor={{ fill: isDarkMode ? '#334155' : '#f1f5f9', opacity: 0.4 }}
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                borderRadius: '8px', 
                border: `1px solid ${tooltipBorder}`,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                color: tooltipText
              }}
              formatter={(value: number, name: string) => [
                `${new Intl.NumberFormat('zh-TW').format(value)}`, 
                name === 'passengers' ? '本期' : '同期'
              ]}
              labelStyle={{ color: axisColor, marginBottom: '0.25rem', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(value) => <span style={{ color: legendText, fontWeight: 500 }}>{value === 'passengers' ? '本期數據' : '去年同期'}</span>}
            />
            
            <Bar 
              dataKey="passengers" 
              name="passengers" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
              animationDuration={1000}
            />
            
            {hasComparison && (
              <Bar 
                dataKey="comparison" 
                name="comparison" 
                fill={isDarkMode ? '#64748b' : '#94a3b8'} 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
                animationDuration={1000}
              />
            )}
            
            <ReferenceLine y={0} stroke={axisColor} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsChart;