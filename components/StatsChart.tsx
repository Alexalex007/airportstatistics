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
}

const StatsChart: React.FC<StatsChartProps> = ({ data, title }) => {
  // Check if we have comparison data in any of the points
  const hasComparison = data.some(d => d.comparison !== undefined && d.comparison !== null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`; // Removed decimal for K on mobile to save space
    return num.toString();
  };

  // Helper to simplify X-axis labels (e.g., "2025 Jan" -> "Jan")
  const formatXAxis = (period: string) => {
    const parts = period.split(' ');
    // Return only the month part if available to save horizontal space on mobile
    return parts.length > 1 ? parts[1] : period;
  };

  if (data.length === 0) {
    return (
      <div className="h-[280px] sm:h-[400px] flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <p className="text-slate-400">暫無圖表數據</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-col items-center justify-center mb-6 gap-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 text-center">
          {title}
        </h3>
        {/* Comparison label removed */}
      </div>
      
      {/* 
         Responsive Height: 
         - Mobile: 280px 
         - Tablet: 350px
         - Desktop: 400px 
      */}
      <div className="h-[280px] sm:h-[350px] lg:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="period" 
              tickFormatter={formatXAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              dy={10}
              interval="preserveStartEnd"
              minTickGap={5}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={formatNumber}
              width={45}
            />
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string) => [
                `${new Intl.NumberFormat('zh-TW').format(value)}`, 
                name === 'passengers' ? '本期' : '同期'
              ]}
              labelStyle={{ color: '#64748b', marginBottom: '0.25rem', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(value) => <span className="text-slate-600 font-medium">{value === 'passengers' ? '本期數據' : '去年同期'}</span>}
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
                fill="#94a3b8" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
                animationDuration={1000}
              />
            )}
            
            <ReferenceLine y={0} stroke="#000" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsChart;