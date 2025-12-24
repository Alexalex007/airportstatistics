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
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <p className="text-slate-400">暫無圖表數據</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
          <span>{title} - 客運量統計與對比</span>
        </div>
        {hasComparison && (
          <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">
            同期數據對比
          </span>
        )}
      </h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="period" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={formatNumber}
            />
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number, name: string) => [
                `${new Intl.NumberFormat('zh-TW').format(value)} 人次`, 
                name === 'passengers' ? '本期數據' : '去年同期'
              ]}
              labelStyle={{ color: '#64748b', marginBottom: '0.5rem', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-slate-600 text-sm font-medium">{value === 'passengers' ? '本期數據' : '去年同期'}</span>}
            />
            
            <Bar 
              dataKey="passengers" 
              name="passengers" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={60}
              animationDuration={1500}
            />
            
            {hasComparison && (
              <Bar 
                dataKey="comparison" 
                name="comparison" 
                fill="#94a3b8" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={60}
                animationDuration={1500}
              />
            )}
            
            <ReferenceLine y={0} stroke="#000" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 mt-4 text-center">
        數據來源：即時網路搜尋最新官方統計
      </p>
    </div>
  );
};

export default StatsChart;