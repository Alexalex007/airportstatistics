import React, { useState, useEffect } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import { AirportData, ChartDataPoint } from '../types';

interface AddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (code: string, name: string, data: AirportData, year: number) => void;
  currentYear: number;
  initialData?: {
    code: string;
    name: string;
    data: AirportData | null;
  } | null;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AddDataModal: React.FC<AddDataModalProps> = ({ isOpen, onClose, onSave, currentYear, initialData }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [year, setYear] = useState(currentYear);
  
  // Store inputs as strings to allow empty states
  const [passengers, setPassengers] = useState<string[]>(Array(12).fill(''));
  const [comparisons, setComparisons] = useState<string[]>(Array(12).fill(''));

  // Load initial data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      // Keep the year from the main app context usually, unless specific logic needed
      setYear(currentYear); 

      if (initialData.data && initialData.data.chartData) {
        const newPassengers = Array(12).fill('');
        const newComparisons = Array(12).fill('');
        
        // Map existing chart data back to inputs
        initialData.data.chartData.forEach(point => {
            // point.period format is usually "2025 Jan"
            const monthStr = point.period.split(' ')[1]; 
            const index = MONTH_NAMES.indexOf(monthStr);
            
            if (index !== -1) {
                // If passengers is 0, it might mean "no data" or "0". 
                // For editing, let's show '0' if it's there. User can clear it if they want empty.
                // However, in our system we treat missing future as 0. 
                // To be cleaner, we could leave it blank if 0 and comparison exists? 
                // Let's just show 0 for transparency.
                newPassengers[index] = point.passengers.toString();
                if (point.comparison !== undefined && point.comparison !== null) {
                    newComparisons[index] = point.comparison.toString();
                }
            }
        });
        
        setPassengers(newPassengers);
        setComparisons(newComparisons);
      } else {
        // Reset if no data but code/name provided
        setPassengers(Array(12).fill(''));
        setComparisons(Array(12).fill(''));
      }
    } else if (isOpen && !initialData) {
      // Clear form for "New" mode
      setCode('');
      setName('');
      setYear(currentYear);
      setPassengers(Array(12).fill(''));
      setComparisons(Array(12).fill(''));
    }
  }, [isOpen, initialData, currentYear]);

  if (!isOpen) return null;

  const handleInputChange = (index: number, value: string, isComparison: boolean) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;

    if (isComparison) {
      const newComparisons = [...comparisons];
      newComparisons[index] = value;
      setComparisons(newComparisons);
    } else {
      const newPassengers = [...passengers];
      newPassengers[index] = value;
      setPassengers(newPassengers);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      alert("請輸入機場代碼與名稱");
      return;
    }

    const chartData: ChartDataPoint[] = [];
    let totalCurrent = 0;
    let totalPrev = 0;
    let monthsCount = 0;

    MONTH_NAMES.forEach((month, idx) => {
      const pStr = passengers[idx];
      const cStr = comparisons[idx];

      // Add to chart if either current OR previous year data is provided
      if (pStr !== '' || cStr !== '') {
        const pVal = pStr === '' ? 0 : parseInt(pStr, 10);
        const cVal = cStr !== '' ? parseInt(cStr, 10) : undefined;
        
        chartData.push({
          period: `${year} ${month}`,
          passengers: pVal,
          comparison: cVal
        });
        
        totalCurrent += pVal;
        if (cVal !== undefined) {
          totalPrev += cVal;
        }
        monthsCount++;
      }
    });

    if (monthsCount === 0) {
      alert("請至少輸入一個月份的數據 (本期或同期皆可)");
      return;
    }

    // Auto-generate summary
    let growthRate = "0";
    if (totalPrev > 0) {
      const rate = ((totalCurrent - totalPrev) / totalPrev * 100);
      growthRate = rate.toFixed(2);
    }

    const summary = `**數據更新摘要**: \n此為用戶手動更新之 ${name} (${code}) ${year} 年數據。\n\n**統計結果**:\n- 統計月份數: ${monthsCount} 個月\n- ${year} 累計客運量: ${new Intl.NumberFormat('zh-TW').format(totalCurrent)} 人次\n- ${year-1} 同期累計: ${new Intl.NumberFormat('zh-TW').format(totalPrev)} 人次\n- 成長率: ${totalPrev > 0 ? (parseFloat(growthRate) > 0 ? '+' : '') + growthRate + '%' : '無法計算 (無同期數據)'}`;

    const newAirportData: AirportData = {
      airportName: name,
      summary: summary,
      chartData: chartData,
      sources: [{ title: "用戶手動輸入", uri: "#" }]
    };

    onSave(code.toUpperCase(), name, newAirportData, year);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center text-slate-800">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3">
              <Calculator size={20} />
            </div>
            <h3 className="text-lg font-bold">{initialData ? '編輯/更新數據' : '新增客運量數據'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="dataForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">機場代碼 (Code)</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. KIX"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                  required 
                  readOnly={!!initialData} // Lock code if editing existing
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">機場名稱 (Name)</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 關西國際機場"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">統計年份</label>
                <input 
                  type="number" 
                  value={year} 
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Data Grid */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-3 gap-4 mb-2 px-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">月份</div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider text-right">{year} 客運量</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{year - 1} 客運量 (選填)</div>
              </div>
              
              <div className="space-y-2">
                {MONTH_NAMES.map((month, idx) => (
                  <div key={month} className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-sm font-medium text-slate-700 pl-2">{month}</div>
                    <input 
                      type="text" 
                      placeholder=""
                      value={passengers[idx]}
                      onChange={(e) => handleInputChange(idx, e.target.value, false)}
                      className="w-full px-3 py-1.5 text-right border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm font-mono"
                    />
                    <input 
                      type="text" 
                      placeholder=""
                      value={comparisons[idx]}
                      onChange={(e) => handleInputChange(idx, e.target.value, true)}
                      className="w-full px-3 py-1.5 text-right border border-slate-300 rounded focus:ring-1 focus:ring-slate-400 outline-none text-sm font-mono bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg flex items-start">
               <div className="text-blue-600 mr-2 mt-0.5">ℹ️</div>
               <p className="text-xs text-blue-700">
                 系統將自動計算<strong>年度總和</strong>與<strong>同期成長率</strong>。若填寫「{year - 1} 客運量」，圖表將顯示對比柱狀圖。
               </p>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors"
          >
            取消
          </button>
          <button 
            form="dataForm"
            type="submit"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Save size={16} />
            <span>保存並更新</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddDataModal;