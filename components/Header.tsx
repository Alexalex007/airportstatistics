import React from 'react';
import { Plane } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Plane size={24} className="transform -rotate-45 w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600">
            SkyMetrics
          </span>
        </div>
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-blue-600 transition-colors">首頁</a>
          <a href="#" className="hover:text-blue-600 transition-colors">趨勢分析</a>
          <a href="#" className="hover:text-blue-600 transition-colors">關於我們</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;