import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet, Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    // Auto timer to move forward after 3.2 seconds if user doesn't click
    const timer = setTimeout(() => {
      onFinish();
    }, 3600);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#FAF9F6] via-[#F4F1EA] to-[#EBE7DF] p-6 overflow-hidden select-none">
      
      {/* Background Decorative Ripples */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.4, 2], opacity: [0.3, 0.15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
          className="w-96 h-96 rounded-full bg-[#DCD0FF]/40 blur-3xl"
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 1.8], opacity: [0.4, 0.2, 0] }}
          transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: 'easeOut' }}
          className="w-80 h-80 rounded-full bg-[#E3E2E0]/50 blur-2xl"
        />
      </div>

      {/* Top Spacer */}
      <div className="pt-8 flex items-center space-x-1 text-xs font-semibold uppercase tracking-widest text-[#79757e]">
        <Sparkles className="w-3.5 h-3.5 text-[#625981]" />
        <span>Fintech Intelligence</span>
      </div>

      {/* Main Animated Graphic & Title */}
      <div className="flex flex-col items-center text-center max-w-sm z-10 my-auto">
        
        {/* Animated Wallet & Coins Container */}
        <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
          
          {/* Animated Coins Falling into Wallet */}
          <motion.div
            initial={{ y: -60, opacity: 0, scale: 0.5 }}
            animate={{ y: [ -60, -20, 10 ], opacity: [ 0, 1, 0 ], scale: [ 0.6, 1, 0.8 ] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.4, ease: 'easeInOut' }}
            className="absolute top-0 z-20 w-8 h-8 rounded-full bg-[#FFD700] border-2 border-[#1a1c1a] shadow-md flex items-center justify-center font-bold text-sm text-[#1a1c1a]"
          >
            ₹
          </motion.div>

          <motion.div
            initial={{ y: -70, opacity: 0, scale: 0.5 }}
            animate={{ y: [ -70, -25, 15 ], opacity: [ 0, 1, 0 ], scale: [ 0.5, 0.9, 0.7 ] }}
            transition={{ duration: 1.6, delay: 0.3, repeat: Infinity, repeatDelay: 0.4, ease: 'easeInOut' }}
            className="absolute top-0 left-6 z-20 w-7 h-7 rounded-full bg-[#FFC107] border-2 border-[#1a1c1a] shadow-sm flex items-center justify-center font-bold text-xs text-[#1a1c1a]"
          >
            ₹
          </motion.div>

          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.5 }}
            animate={{ y: [ -50, -15, 12 ], opacity: [ 0, 1, 0 ], scale: [ 0.5, 0.95, 0.8 ] }}
            transition={{ duration: 1.6, delay: 0.6, repeat: Infinity, repeatDelay: 0.4, ease: 'easeInOut' }}
            className="absolute top-0 right-6 z-20 w-7 h-7 rounded-full bg-[#FFE082] border-2 border-[#1a1c1a] shadow-sm flex items-center justify-center font-bold text-xs text-[#1a1c1a]"
          >
            ₹
          </motion.div>

          {/* Opening Wallet Container */}
          <motion.div
            initial={{ scale: 0.7, rotate: -5, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-28 h-24 bg-[#1A1C1A] rounded-2xl border-2 border-[#1A1C1A] shadow-xl relative flex flex-col justify-end p-3 overflow-visible"
          >
            {/* Flap of Wallet opening */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={{ rotateX: [-10, -50, -20, -60] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              style={{ transformOrigin: 'top center' }}
              className="absolute top-0 left-0 right-0 h-10 bg-[#2D302E] rounded-t-2xl border-b border-[#3E423F] flex items-center justify-center"
            >
              <div className="w-4 h-4 rounded-full bg-[#FFD700] border border-[#1a1c1a] flex items-center justify-center text-[9px] font-black text-[#1a1c1a]">
                ₹
              </div>
            </motion.div>

            <div className="flex items-center justify-between text-[#FAF9F6] pt-4">
              <span className="text-xl font-bold tracking-tight">Finova</span>
              <div className="w-6 h-6 rounded-lg bg-[#DCD0FF] text-[#1A1C1A] font-bold flex items-center justify-center text-xs">
                ₹
              </div>
            </div>
          </motion.div>

        </div>

        {/* Title and Tagline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-extrabold text-[#1A1C1A] tracking-tight">
            Finova
          </h1>
          <p className="text-sm font-medium text-[#625981]">
            Track Smart. Spend Better.
          </p>
        </motion.div>

      </div>

      {/* Bottom CTA Button for manual skip */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="pb-6 z-10 w-full max-w-xs"
      >
        <button
          onClick={onFinish}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#1A1C1A] text-[#FAF9F6] font-bold text-sm shadow-md hover:bg-[#2e312f] active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 text-[#DCD0FF]" />
        </button>
      </motion.div>

    </div>
  );
};
