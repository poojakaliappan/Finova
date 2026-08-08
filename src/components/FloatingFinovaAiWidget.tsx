import React from 'react';
import { Sparkles, Bot } from 'lucide-react';

interface FloatingFinovaAiWidgetProps {
  onOpenAdvisor: () => void;
  isActive: boolean;
}

export const FloatingFinovaAiWidget: React.FC<FloatingFinovaAiWidgetProps> = ({
  onOpenAdvisor,
  isActive,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onOpenAdvisor}
        className={`group relative flex items-center justify-center w-16 h-16 rounded-full bg-[#1A1C1A] text-[#FAF9F6] shadow-2xl transition-all duration-300 active:scale-90 hover:scale-105 ${
          isActive ? 'ring-4 ring-[#00FF66]' : ''
        }`}
        title="Open FINOVA AI Financial Assistant"
      >
        {/* Blinking Light Border Ring Effect */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#00FF66] via-[#8B5CF6] to-[#EC4899] opacity-90 animate-pulse blur-[3px]" />

        {/* Outer Circular Container */}
        <div className="relative w-full h-full rounded-full bg-[#1A1C1A] border-2 border-[#8B5CF6] flex flex-col items-center justify-center p-1 overflow-hidden shadow-inner">
          
          {/* Top Blinking Indicator Light Dot */}
          <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-90" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00FF66] border-2 border-[#1A1C1A]" />
          </span>

          <Sparkles className="w-5 h-5 text-[#FFD700] animate-bounce" />
          
          <span className="text-[9px] font-black tracking-tight text-[#FAF9F6] uppercase leading-tight mt-0.5">
            FINOVA AI
          </span>
        </div>

        {/* Hover Tooltip Badge */}
        <div className="absolute right-20 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#1A1C1A] text-[#FAF9F6] border border-[#8B5CF6] text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg flex items-center space-x-1.5">
          <Bot className="w-3.5 h-3.5 text-[#00FF66]" />
          <span>FINOVA AI Assistant</span>
        </div>
      </button>
    </div>
  );
};
