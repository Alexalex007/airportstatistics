import React, { useEffect, useState } from 'react';
import { Plane, BarChart2, Globe, ArrowRight, Activity } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-white overflow-y-auto overflow-x-hidden">
      {/* Background Effects - Fixed Position to stay static during scroll */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep Space Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0f172a] to-[#1e1b4b]"></div>
        
        {/* Animated Orbs - Adjusted positions for better mobile visibility */}
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-blue-600/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-indigo-600/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }}
        ></div>
      </div>

      {/* Main Container - Ensures min-height for vertical centering but allows scrolling */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative z-10 py-12 px-4 sm:px-6">
        
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        
          {/* Logo / Badge */}
          <div className={`mb-6 sm:mb-10 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg shadow-blue-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-mono tracking-widest text-blue-300 uppercase">System Online</span>
            </div>
          </div>

          {/* Main Title - Responsive sizing */}
          <h1 className={`text-4xl xs:text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-4 sm:mb-6 transition-all duration-1000 delay-100 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 pb-2">
              SkyMetrics
            </span>
          </h1>

          {/* Subtitle - Responsive width and size */}
          <p className={`text-base xs:text-lg sm:text-xl md:text-2xl text-slate-400 max-w-xs sm:max-w-2xl mb-8 sm:mb-12 font-light leading-relaxed transition-all duration-1000 delay-200 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            探索亞太樞紐機場的數據脈動。<br className="hidden sm:block" />
            從即時客運量到跨年度趨勢，盡在指尖。
          </p>

          {/* Feature Grid - Responsive grid layout */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16 w-full max-w-sm sm:max-w-4xl text-left transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <FeatureCard 
              icon={<Globe size={20} />} 
              title="多機場監測" 
              desc="HKG, TPE, SIN, BKK, ICN, MNL"
              delay={0}
            />
            <FeatureCard 
              icon={<BarChart2 size={20} />} 
              title="趨勢比對" 
              desc="跨年份與跨機場數據可視化分析"
              delay={100}
            />
            <FeatureCard 
              icon={<Activity size={20} />} 
              title="即時洞察" 
              desc="官方數據客運量統計與成長率"
              delay={200}
            />
          </div>

          {/* CTA Button */}
          <div className={`transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <button
              onClick={onEnter}
              className="group relative w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.6)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
              <Plane className="transform group-hover:rotate-[-45deg] group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
              <span>啟動數據中心</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Footer Text - Responsive positioning */}
          <div className={`mt-12 sm:mt-16 sm:absolute sm:bottom-8 transition-all duration-1000 delay-700 transform ${mounted ? 'opacity-100' : 'opacity-0'}`}>
             <p className="text-[10px] sm:text-xs text-slate-600 font-mono tracking-widest uppercase">
               Aviation Intelligence Dashboard v2.0
             </p>
          </div>
        
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) => (
  <div 
    className="bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm p-5 sm:p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group h-full"
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-3 sm:block sm:gap-0">
        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-2.5 sm:p-3 rounded-lg w-fit text-blue-400 group-hover:text-blue-300 mb-0 sm:mb-4 transition-colors shrink-0">
          {icon}
        </div>
        <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-200 mb-1 sm:mb-2 group-hover:text-white">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed group-hover:text-slate-300">{desc}</p>
        </div>
    </div>
  </div>
);

export default LandingPage;