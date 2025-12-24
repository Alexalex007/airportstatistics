import React from 'react';
import { Plane } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
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
        <div className="flex items-center space-x-4">
          {/* Navigation links removed */}
        </div>
      </div>
    </header>
  );
};

export default Header;