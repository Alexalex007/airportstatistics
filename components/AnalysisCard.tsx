import React from 'react';
import { ExternalLink, TrendingUp } from 'lucide-react';
import { GroundingSource } from '../types';

interface AnalysisCardProps {
  content: string;
  sources: GroundingSource[];
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ content, sources }) => {
  // Simple paragraph parser
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700 mr-3">
          <TrendingUp size={20} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">最新數據摘要</h3>
      </div>
      
      <div className="prose prose-slate prose-sm max-w-none flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {paragraphs.map((para, idx) => (
            <div key={idx} className={`mb-4 ${para.startsWith('**') || para.startsWith('##') ? 'font-bold text-slate-900 mt-4' : 'text-slate-700 font-medium'}`}>
               {para.replace(/\*\*/g, '').replace(/##/g, '')}
            </div>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">資料來源連結</h4>
          <ul className="space-y-2">
            {sources.map((source, idx) => (
              <li key={idx}>
                <a 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start text-sm text-blue-600 hover:text-blue-800 group"
                >
                  <ExternalLink size={14} className="mt-1 mr-2 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="truncate">{source.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisCard;