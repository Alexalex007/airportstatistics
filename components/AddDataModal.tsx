import React, { useState, useEffect } from 'react';
import { X, Save, Calculator, ChevronDown } from 'lucide-react';
import { AirportData, ChartDataPoint } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

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

const YEARS_RANGE = [2025, 2026, 2027, 2028, 2029, 2030];
const DATA_PREFIX = 'skymetrics_data_';

const AddDataModal: React.FC<AddDataModalProps> = ({ isOpen, onClose, onSave, currentYear, initialData }) => {
  const { t } = useLanguage();
  const MONTH_NAMES_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [year, setYear] = useState(currentYear);
  
  const [passengers, setPassengers] = useState<string[]>(Array(12).fill(''));
  const [comparisons, setComparisons] = useState<string[]>(Array(12).fill(''));

  useEffect(() => {
    if (isOpen && initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      setYear(currentYear); 

      if (initialData.data && initialData.data.chartData) {
        const newPassengers = Array(12).fill('');
        const newComparisons = Array(12).fill('');
        
        initialData.data.chartData.forEach(point => {
            const monthStr = point.period.split(' ')[1]; 
            const index = MONTH_NAMES_EN.indexOf(monthStr);
            
            if (index !== -1) {
                newPassengers[index] = point.passengers.toString();
                if (point.comparison !== undefined && point.comparison !== null) {
                    newComparisons[index] = point.comparison.toString();
                }
            }
        });
        
        setPassengers(newPassengers);
        setComparisons(newComparisons);
      } else {
        setPassengers(Array(12).fill(''));
        setComparisons(Array(12).fill(''));
      }
    } else if (isOpen && !initialData) {
      setCode('');
      setName('');
      setYear(currentYear);
      setPassengers(Array(12).fill(''));
      setComparisons(Array(12).fill(''));
    }
  }, [isOpen, initialData, currentYear]);

  const loadSavedData = (targetCode: string, targetYear: number): string[] | null => {
    try {
      const key = `${DATA_PREFIX}${targetCode}_${targetYear}`;
      const savedStr = localStorage.getItem(key);
      if (!savedStr) return null;
      
      const savedData = JSON.parse(savedStr) as AirportData;
      const loadedPassengers = Array(12).fill('');
      
      if (savedData.chartData) {
        savedData.chartData.forEach(point => {
           const monthStr = point.period.split(' ')[1];
           const index = MONTH_NAMES_EN.indexOf(monthStr);
           if (index !== -1) {
             loadedPassengers[index] = point.passengers.toString();
           }
        });
      }
      return loadedPassengers;
    } catch (e) {
      return null;
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    const oldYear = year;
    
    const savedCurrent = loadSavedData(code, newYear);
    const nextPassengers = savedCurrent || Array(12).fill('');

    let nextComparisons = Array(12).fill('');

    if (newYear === oldYear + 1) {
      nextComparisons = [...passengers];
    } else {
      const savedPrev = loadSavedData(code, newYear - 1);
      if (savedPrev) {
        nextComparisons = savedPrev;
      }
    }

    setYear(newYear);
    setPassengers(nextPassengers);
    setComparisons(nextComparisons);
  };

  if (!isOpen) return null;

  const handleInputChange = (index: number, value: string, isComparison: boolean) => {
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
      alert("Please enter airport code and name");
      return;
    }

    const chartData: ChartDataPoint[] = [];
    let totalCurrent = 0;
    let totalPrev = 0;
    let monthsCount = 0;

    MONTH_NAMES_EN.forEach((month, idx) => {
      const pStr = passengers[idx];
      const cStr = comparisons[idx];

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
      alert("Please enter at least one month of data");
      return;
    }

    let growthRate = "0";
    if (totalPrev > 0) {
      const rate = ((totalCurrent - totalPrev) / totalPrev * 100);
      growthRate = rate.toFixed(2);
    }

    const summary = `Manual update for ${name} (${code}) ${year}.`;

    const newAirportData: AirportData = {
      airportName: name,
      summary: summary,
      chartData: chartData,
      sources: [{ title: "User Input", uri: "#" }]
    };

    onSave(code.toUpperCase(), name, newAirportData, year);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center text-slate-800 dark:text-slate-100">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400 mr-3">
              <Calculator size={20} />
            </div>
            <h3 className="text-lg font-bold">{initialData ? t('editData') : t('addData')}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
          <form id="dataForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('inputCode')}</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. KIX"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase placeholder-slate-400 dark:placeholder-slate-600"
                  required 
                  readOnly={!!initialData}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('inputName')}</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kansai Int'l Airport"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('inputYear')}</label>
                <div className="relative">
                  <select 
                    value={year} 
                    onChange={handleYearChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                    required
                  >
                    {YEARS_RANGE.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-3 gap-4 mb-2 px-2">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('month')}</div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-right">{year}</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{year - 1}</div>
              </div>
              
              <div className="space-y-2">
                {t('months').map((month: string, idx: number) => (
                  <div key={idx} className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 pl-2">{month}</div>
                    <input 
                      type="text" 
                      placeholder=""
                      value={passengers[idx]}
                      onChange={(e) => handleInputChange(idx, e.target.value, false)}
                      className="w-full px-3 py-1.5 text-right border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm font-mono placeholder-slate-300 dark:placeholder-slate-700"
                    />
                    <input 
                      type="text" 
                      placeholder=""
                      value={comparisons[idx]}
                      onChange={(e) => handleInputChange(idx, e.target.value, true)}
                      className="w-full px-3 py-1.5 text-right border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded focus:ring-1 focus:ring-slate-400 outline-none text-sm font-mono placeholder-slate-300 dark:placeholder-slate-700"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start">
               <div className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5">ℹ️</div>
               <p className="text-xs text-blue-700 dark:text-blue-300">
                 {t('autoCalc')}
               </p>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium text-sm transition-colors"
          >
            {t('cancel')}
          </button>
          <button 
            form="dataForm"
            type="submit"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Save size={16} />
            <span>{t('saveUpdate')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddDataModal;