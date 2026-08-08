import React, { useState } from 'react';
import { 
  Shield, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Lock, 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  PieChart
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { InvisibleWalletState } from '../types';

interface InvisibleWalletViewProps {
  currency: string;
  walletState: InvisibleWalletState;
  onUpdateWalletState: (newState: Partial<InvisibleWalletState>) => void;
  todaySpent: number;
  dailyLimit: number;
  onTriggerVoiceAlert?: (text: string) => void;
}

export const InvisibleWalletView: React.FC<InvisibleWalletViewProps> = ({
  currency,
  walletState,
  onUpdateWalletState,
  todaySpent,
  dailyLimit,
  onTriggerVoiceAlert,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempTitle, setTempTitle] = useState(walletState.goalTitle);
  const [tempTarget, setTempTarget] = useState(walletState.goalTargetAmount.toString());
  const [tempBudget, setTempBudget] = useState(walletState.dailyBudget.toString());
  const [splitExecuted, setSplitExecuted] = useState(false);

  // Calculations
  const surplusToday = Math.max(0, dailyLimit - todaySpent);
  const goalSplit = Math.floor(surplusToday * 0.5);
  const emergencySplit = surplusToday - goalSplit;

  const goalProgress = Math.min(100, Math.round((walletState.goalCurrentAmount / walletState.goalTargetAmount) * 100));
  const daysRemaining = Math.max(1, Math.ceil((walletState.goalTargetAmount - walletState.goalCurrentAmount) / (goalSplit > 0 ? goalSplit : 50)));

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget = parseFloat(tempTarget) || 50000;
    const newBudget = parseFloat(tempBudget) || 500;
    onUpdateWalletState({
      goalTitle: tempTitle || 'Dream Product',
      goalTargetAmount: newTarget,
      dailyBudget: newBudget,
    });
    setIsEditingGoal(false);
  };

  const handleExecuteEndOfDaySplit = () => {
    if (surplusToday <= 0) return;
    onUpdateWalletState({
      goalCurrentAmount: walletState.goalCurrentAmount + goalSplit,
      emergencyCurrentAmount: walletState.emergencyCurrentAmount + emergencySplit,
    });
    setSplitExecuted(true);
    const text = `Success! ₹${surplusToday} unspent surplus split 50-50. ₹${goalSplit} added to ${walletState.goalTitle} goal, and ₹${emergencySplit} added to Emergency Vault.`;
    if (onTriggerVoiceAlert) onTriggerVoiceAlert(text);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A1C1A] via-[#2A2D2B] to-[#1A1C1A] text-[#FAF9F6] p-6 sm:p-8 rounded-3xl border border-[#8B5CF6]/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00FF66]/20 border border-[#00FF66]/40 text-[#00FF66] text-xs font-black uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>FINOVA Secret Dream Wallet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#FAF9F6]">
              Set Your Goal Product & Dream Savings
            </h1>
            <p className="text-xs sm:text-sm text-[#D3D1D8] leading-relaxed">
              Select what you want to buy (e.g. Laptop, Bike, Smartphone). Whenever your daily spending is under <strong className="text-[#00FF66]">{formatCurrency(dailyLimit, currency)}</strong>, you can trigger a 50-50 split: half towards your <strong>{walletState.goalTitle}</strong> and half into your Emergency Vault!
            </p>
          </div>

          <button
            onClick={() => setIsEditingGoal(true)}
            className="px-5 py-3 rounded-2xl bg-[#00FF66] text-[#1A1C1A] font-black text-xs hover:bg-[#00E059] transition-all shadow-md flex items-center justify-center space-x-2 shrink-0 active:scale-95"
          >
            <Target className="w-4 h-4 text-[#1A1C1A]" />
            <span>Set / Change Goal Product</span>
          </button>
        </div>
      </div>

      {/* Edit Goal Modal / Preset Examples Selection */}
      {isEditingGoal && (
        <div className="bg-[#ffffff] p-6 rounded-3xl border border-[#E3E2E0] shadow-paper space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#F4F3F1]">
            <h3 className="text-base font-extrabold text-[#1A1C1A]">Select or Customise Your Dream Product</h3>
            <span className="text-xs text-[#79757E] font-medium">Choose a preset example or type custom</span>
          </div>

          {/* Quick Examples */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[#79757E] uppercase block">Popular Goal Product Examples:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { title: 'MacBook Pro / Gaming Laptop', price: 65000 },
                { title: 'iPhone / Flagship Smartphone', price: 45000 },
                { title: 'College Motorbike / Scooter', price: 85000 },
                { title: 'Sony PS5 Gaming Console', price: 40000 },
                { title: 'Summer Trip / Vacation', price: 30000 },
              ].map((ex) => (
                <button
                  key={ex.title}
                  type="button"
                  onClick={() => {
                    setTempTitle(ex.title);
                    setTempTarget(ex.price.toString());
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] hover:bg-[#DCD0FF] hover:border-[#B8A2FF] transition-all"
                >
                  {ex.title} (₹{ex.price.toLocaleString('en-IN')})
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveGoal} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-[#48454E] block mb-1">Goal Product Name</label>
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A]"
                placeholder="e.g. MacBook Pro, iPhone, College Bike"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#48454E] block mb-1">Target Amount ({currency})</label>
              <input
                type="number"
                value={tempTarget}
                onChange={(e) => setTempTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A]"
                placeholder="50000"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#48454E] block mb-1">Daily Safe Budget ({currency})</label>
              <input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A]"
                placeholder="500"
                required
              />
            </div>
            <div className="sm:col-span-3 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="px-4 py-2 rounded-xl bg-[#F4F3F1] text-xs font-bold text-[#48454E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1A1C1A] text-xs font-black text-[#FAF9F6] hover:bg-[#2E312F]"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Goal Product Card + Today's 50-50 Surplus Splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* 1. Goal Product Showcase */}
        <div className="bg-[#ffffff] rounded-3xl p-6 sm:p-8 border border-[#E3E2E0] shadow-paper space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#F4F3F1]">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#DCD0FF] text-[#1A1C1A] flex items-center justify-center text-2xl font-black">
                💻
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#79757E]">Target Dream Product</span>
                <h3 className="text-lg font-black text-[#1A1C1A]">{walletState.goalTitle}</h3>
              </div>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-[#E2F0D9] text-[#27AE60]">
              {goalProgress}% Achieved
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-extrabold text-[#1A1C1A]">
              <span>Saved: {formatCurrency(walletState.goalCurrentAmount, currency)}</span>
              <span>Target: {formatCurrency(walletState.goalTargetAmount, currency)}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#F4F3F1] overflow-hidden p-0.5 border border-[#E3E2E0]">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#00FF66] transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0]">
              <span className="text-[10px] font-bold text-[#79757E] uppercase block">Emergency Vault</span>
              <span className="text-xl font-black text-[#1A1C1A]">
                {formatCurrency(walletState.emergencyCurrentAmount, currency)}
              </span>
              <span className="text-[10px] text-[#27AE60] font-bold block mt-0.5">🛡️ 50% Auto Protection</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0]">
              <span className="text-[10px] font-bold text-[#79757E] uppercase block">Est. Days to Goal</span>
              <span className="text-xl font-black text-[#1A1C1A]">
                ~{daysRemaining} Days
              </span>
              <span className="text-[10px] text-[#625981] font-bold block mt-0.5">⚡ Based on daily ₹50 split</span>
            </div>
          </div>
        </div>

        {/* 2. Today's Unspent Daily Surplus & 50-50 Split Engine */}
        <div className="bg-[#ffffff] rounded-3xl p-6 sm:p-8 border border-[#E3E2E0] shadow-paper space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-[#625981] mb-1">
              <Zap className="w-4 h-4 fill-[#625981]" />
              <span className="text-xs font-black uppercase tracking-wider">Today's Daily Budget Engine</span>
            </div>
            <h3 className="text-lg font-black text-[#1A1C1A]">50-50 Unspent Surplus Auto-Split</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-[#F4F3F1] border border-[#E3E2E0]">
              <span className="text-[10px] font-bold text-[#79757E] block">Daily Goal</span>
              <span className="text-sm font-black text-[#1A1C1A]">{formatCurrency(dailyLimit, currency)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F4F3F1] border border-[#E3E2E0]">
              <span className="text-[10px] font-bold text-[#79757E] block">Today Spent</span>
              <span className="text-sm font-black text-[#BA1A1A]">{formatCurrency(todaySpent, currency)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#E2F0D9] border border-[#27AE60]/30 text-[#27AE60]">
              <span className="text-[10px] font-bold block">Surplus Left</span>
              <span className="text-sm font-black">{formatCurrency(surplusToday, currency)}</span>
            </div>
          </div>

          {/* 50 / 50 Breakdown Card */}
          <div className="p-4 rounded-2xl bg-[#1A1C1A] text-[#FAF9F6] border border-[#8B5CF6]/40 space-y-3">
            <span className="text-[10px] font-extrabold uppercase text-[#00FF66] tracking-wider block">
              Automatic 50-50 Split Allocation:
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <div className="p-2.5 rounded-xl bg-[#2E312F] border border-[#48454E]">
                <span className="text-[10px] text-[#A09CA8] block">50% to {walletState.goalTitle}:</span>
                <span className="text-base font-black text-[#00FF66]">{formatCurrency(goalSplit, currency)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#2E312F] border border-[#48454E]">
                <span className="text-[10px] text-[#A09CA8] block">50% to Emergency:</span>
                <span className="text-base font-black text-[#DCD0FF]">{formatCurrency(emergencySplit, currency)}</span>
              </div>
            </div>

            <button
              onClick={handleExecuteEndOfDaySplit}
              disabled={splitExecuted || surplusToday <= 0}
              className={`w-full py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                splitExecuted
                  ? 'bg-[#2E312F] text-[#00FF66] cursor-default'
                  : surplusToday > 0
                  ? 'bg-[#00FF66] text-[#1A1C1A] hover:bg-[#00E059] active:scale-95 shadow-md'
                  : 'bg-[#48454E] text-[#A09CA8] cursor-not-allowed'
              }`}
            >
              {splitExecuted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
                  <span>50-50 Split Applied to Vaults!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#1A1C1A]" />
                  <span>Trigger 50-50 Savings Split Now</span>
                </>
              )}
            </button>
          </div>

          {/* Warning Message if Overspending */}
          {todaySpent > dailyLimit && (
            <div className="p-4 rounded-2xl bg-[#FFDAD6] border border-[#BA1A1A] text-[#BA1A1A] space-y-1 animate-shake">
              <div className="flex items-center space-x-2 font-black text-xs">
                <AlertTriangle className="w-4 h-4 text-[#BA1A1A]" />
                <span>Dream Product Purchase Impact Alert</span>
              </div>
              <p className="text-xs leading-relaxed font-bold">
                ⚠️ Warning: You exceeded today's limit by {formatCurrency(todaySpent - dailyLimit, currency)}. Overspending on non-essentials delays your <strong>{walletState.goalTitle}</strong> purchase by ~{Math.ceil((todaySpent - dailyLimit) / 50)} days!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
