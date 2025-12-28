import React, { useEffect, useState } from 'react';
import { Plane, BarChart2, Globe, ArrowRight, Activity, Sun, Moon } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, theme, onToggleTheme }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Theme Styles Config ---
  const isLight = theme === 'light';

  // Text Colors
  const textColor = isLight ? 'text-slate-900' : 'text-white';
  const subTextColor = isLight ? 'text-slate-600' : 'text-slate-400';
  const badgeBg = isLight ? 'bg-white/60 border-blue-200 text-blue-700 shadow-blue-200/50' : 'bg-white/5 border-white/10 text-blue-300 shadow-blue-500/10';
  const badgeDot = isLight ? 'bg-blue-600' : 'bg-blue-400';
  
  // Button Colors
  const toggleBtnClass = isLight 
    ? 'bg-white/50 text-slate-600 hover:bg-white hover:text-blue-600 border-white/60 shadow-sm'
    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white border-white/10';

  const titleGradient = isLight
    ? 'bg-gradient-to-r from-blue-700 via-indigo-600 to-slate-500'
    : 'bg-gradient-to-r from-white via-blue-100 to-slate-400';

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden transition-colors duration-700 ${isLight ? 'bg-slate-50' : 'bg-slate-950'}`}>
      
      {/* --- Background Layer --- */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000">
        {/* Light Mode Background: Sky Theme */}
        <div className={`absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-slate-100 transition-opacity duration-1000 ${isLight ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className={`absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-blue-200/40 rounded-full blur-[100px] transition-opacity duration-1000 ${isLight ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-cyan-100/60 rounded-full blur-[120px] transition-opacity duration-1000 ${isLight ? 'opacity-100' : 'opacity-0'}`}></div>

        {/* Dark Mode Background: Space Theme */}
        <div className={`absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0f172a] to-[#1e1b4b] transition-opacity duration-1000 ${isLight ? 'opacity-0' : 'opacity-100'}`}></div>
        <div className={`absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] max-w-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse transition-opacity duration-1000 ${isLight ? 'opacity-0' : 'opacity-100'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] max-w-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse transition-opacity duration-1000 ${isLight ? 'opacity-0' : 'opacity-100'}`}></div>
        
        {/* Texture Overlay (Common) */}
        <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay transition-opacity duration-1000 ${isLight ? 'opacity-10' : 'opacity-20'}`}></div>
      </div>

      {/* --- Main Content Layout --- */}
      {/* 
          Mobile: justify-between (spreads items out vertically)
          Tablet+: justify-center (centers items vertically with gap)
      */}
      <div className="relative z-10 w-full h-[100dvh] flex flex-col items-center justify-between md:justify-center py-6 px-4 sm:px-8 max-w-7xl mx-auto md:gap-16">
        
        {/* 1. Header Area: Theme Toggle */}
        {/* 
            Mobile: Relative flow, pushes content down.
            Tablet+: Absolute positioning to top-right, removed from flex flow.
        */}
        <div className="w-full flex justify-end h-[50px] md:absolute md:top-8 md:right-8 md:h-auto z-50">
             <button 
                onClick={onToggleTheme}
                className={`
                  p-3 rounded-full backdrop-blur-md border transition-all duration-300 focus:outline-none active:scale-95
                  ${toggleBtnClass}
                `}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
        </div>

        {/* 2. Hero Section (Logo + Titles) */}
        {/* 
            Mobile: flex-grow ensures it takes available space and centers itself.
            Tablet+: flex-grow-0 allows it to sit tightly with the cards below.
        */}
        <div className="flex-grow md:flex-grow-0 flex flex-col items-center justify-center text-center -mt-8 sm:-mt-0 md:mt-0">
            {/* Badge */}
            <div className={`mb-6 sm:mb-8 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md shadow-lg transition-colors duration-500 ${badgeBg}`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${badgeDot}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${badgeDot}`}></span>
                </span>
                <span className="text-[10px] sm:text-xs font-mono tracking-widest uppercase font-bold">System Online</span>
              </div>
            </div>

            {/* Title */}
            <h1 className={`text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-4 sm:mb-6 transition-all duration-1000 delay-100 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className={`block text-transparent bg-clip-text pb-2 transition-all duration-700 ${titleGradient}`}>
                SkyMetrics
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-base sm:text-xl md:text-2xl font-light leading-relaxed max-w-xs sm:max-w-2xl transition-all duration-1000 delay-200 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${subTextColor}`}>
              探索亞太樞紐機場的數據脈動。<br className="hidden sm:block" />
              從即時客運量到跨年度趨勢，盡在指尖。
            </p>
        </div>

        {/* 3. Feature Grid & CTA */}
        {/* 
            Mobile: w-full, standard flow.
            Tablet+: md:w-auto, centered.
        */}
        <div className={`w-full max-w-md sm:max-w-4xl md:w-auto transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12">
               <FeatureCard 
                  isLight={isLight}
                  icon={<Globe size={20} />} 
                  title="多機場監測" 
                  desc="HKG, TPE, SIN, BKK, ICN, MNL"
                  delay={0}
                />
                <FeatureCard 
                  isLight={isLight}
                  icon={<BarChart2 size={20} />} 
                  title="趨勢比對" 
                  desc="跨年份與跨機場數據可視化"
                  delay={100}
                />
                <FeatureCard 
                  isLight={isLight}
                  icon={<Activity size={20} />} 
                  title="即時洞察" 
                  desc="官方數據客運量統計"
                  delay={200}
                />
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mb-6 sm:mb-0">
               <button
                  onClick={onEnter}
                  className="group relative w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.5)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                  <Plane className="transform group-hover:rotate-[-45deg] group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
                  <span>啟動數據中心</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>

        {/* 4. Footer */}
        {/* 
            Mobile: In flow.
            Tablet+: Absolute positioning to bottom, removed from flex flow.
        */}
        <div className={`transition-all duration-1000 delay-500 transform ${mounted ? 'opacity-100' : 'opacity-0'} md:absolute md:bottom-6`}>
           <p className={`text-[10px] sm:text-xs font-mono tracking-widest uppercase mb-2 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
              Aviation Intelligence Dashboard v2.0
           </p>
        </div>

      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay, isLight }: { icon: React.ReactNode, title: string, desc: string, delay: number, isLight: boolean }) => {
  const cardClass = isLight 
    ? 'bg-white/60 border-white/60 hover:bg-white/80 hover:border-blue-200/50 shadow-sm hover:shadow-md'
    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-blue-900/10';

  const iconBg = isLight
    ? 'bg-blue-50 text-blue-600'
    : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400';

  const titleColor = isLight ? 'text-slate-800' : 'text-slate-200';
  const descColor = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div 
      className={`border backdrop-blur-md p-4 sm:p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group flex items-center sm:block gap-4 sm:gap-0 ${cardClass}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`p-2.5 sm:p-3 rounded-lg w-fit mb-0 sm:mb-4 transition-colors shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
          <h3 className={`text-base sm:text-lg font-bold mb-0.5 sm:mb-2 truncate ${titleColor}`}>{title}</h3>
          <p className={`text-xs sm:text-sm leading-tight sm:leading-relaxed truncate sm:whitespace-normal ${descColor}`}>{desc}</p>
      </div>
    </div>
  );
};

export default LandingPage;