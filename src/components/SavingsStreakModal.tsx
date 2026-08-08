import React, { useState } from 'react';
import { Flame, Trophy, Gift, ShieldAlert, Snowflake, X, Check, Film, Music, Coffee, ShoppingBag, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SavingsStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  todaySpent: number;
  dailyLimit?: number;
  monthlyBudget?: number;
  monthlySpent?: number;
}

export const SavingsStreakModal: React.FC<SavingsStreakModalProps> = ({
  isOpen,
  onClose,
  currency,
  todaySpent,
  dailyLimit = 200,
  monthlyBudget = 5000,
  monthlySpent = 0,
}) => {
  const [streakDays, setStreakDays] = useState(12);
  const [streakFrozen, setStreakFrozen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);

  if (!isOpen) return null;

  // Streak calculations
  const targetDays = 30;
  const progressPercent = Math.min(100, Math.round((streakDays / targetDays) * 100));

  // Saving targets & actuals connected to real user transactions
  const isWithinLimit = todaySpent <= dailyLimit;
  const diffAmount = Math.abs(dailyLimit - todaySpent);

  // Rewards list
  const rewards = [
    { id: 'movie', name: 'Movie Voucher', icon: Film, detail: 'BookMyShow ₹250 Off', color: 'bg-[#FFDAD6] text-[#BA1A1A]' },
    { id: 'music', name: 'Music Voucher', icon: Music, detail: 'Spotify 1 Month Free', color: 'bg-[#DCD0FF] text-[#60577F]' },
    { id: 'cafe', name: 'Café Voucher', icon: Coffee, detail: 'Starbucks ₹200 Discount', color: 'bg-[#F5F5DC] text-[#48454E]' },
    { id: 'shop', name: 'Shopping Voucher', icon: ShoppingBag, detail: 'Myntra ₹300 Coupon', color: 'bg-[#E2F0D9] text-[#27AE60]' },
    { id: 'gift', name: 'Partner Gift', icon: Gift, detail: 'Swiggy Gourmet ₹150 Off', color: 'bg-[#FFD700]/30 text-[#1A1C1A]' },
  ];

  const handleUseFreeze = () => {
    setStreakFrozen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1C1A]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF9F6] w-full max-w-lg rounded-3xl border border-[#E3E2E0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-[#1A1C1A] text-[#FAF9F6] flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFD700]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#FF5722] text-[#FAF9F6] flex items-center justify-center font-extrabold shadow-md animate-bounce">
              <Flame className="w-6 h-6 fill-current text-[#FFD700]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black tracking-tight text-[#FAF9F6]">Savings Streak & Rewards</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FFD700] text-[#1A1C1A] font-black text-[10px] uppercase">
                  Level 2 Saver
                </span>
              </div>
              <p className="text-xs text-[#A09CA8] font-medium">FINOVA Habit Building Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#2E312F] hover:bg-[#3E423F] text-[#FAF9F6] transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Goal Metrics Summary Box */}
          <div className="grid grid-cols-3 gap-2.5 bg-[#ffffff] p-4 rounded-2xl border border-[#E3E2E0] text-center shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-[#79757E] uppercase block">Monthly Budget</span>
              <span className="text-sm sm:text-base font-black text-[#1A1C1A] mt-0.5 block">
                {formatCurrency(monthlyBudget, currency)}
              </span>
            </div>
            <div className="border-x border-[#F4F3F1]">
              <span className="text-[10px] font-bold text-[#27AE60] uppercase block">Spent So Far</span>
              <span className="text-sm sm:text-base font-black text-[#27AE60] mt-0.5 block">
                {formatCurrency(monthlySpent, currency)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#60577F] uppercase block">Daily Limit</span>
              <span className="text-sm sm:text-base font-black text-[#60577F] mt-0.5 block">
                {formatCurrency(dailyLimit, currency)}
              </span>
            </div>
          </div>

          {/* Current Streak & Progress Bar */}
          <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#E3E2E0] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black text-[#1A1C1A]">
                  🔥 {streakDays} Days Streak
                </span>
                <span className="text-xs font-bold text-[#79757E]">
                  / Target {targetDays} Days
                </span>
              </div>
              <span className="text-xs font-extrabold text-[#27AE60] bg-[#E2F0D9] px-2.5 py-1 rounded-full">
                {progressPercent}% Complete
              </span>
            </div>

            {/* Custom Visual Bar */}
            <div className="space-y-1">
              <div className="w-full h-4 bg-[#F4F3F1] rounded-full overflow-hidden p-0.5 border border-[#E3E2E0]">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF5722] via-[#FFD700] to-[#70E000] rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-[#79757E] font-medium text-center pt-1">
                Note: <strong>Daily Spending Limit</strong> ({formatCurrency(dailyLimit, currency)}) is distinct from your <strong>Savings Goal</strong>.
              </p>
            </div>
          </div>

          {/* Daily Status Box (Real-Time Transaction Connected) */}
          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E3E2E0] space-y-3">
            <h4 className="text-xs font-black text-[#1A1C1A] uppercase tracking-wider flex items-center justify-between">
              <span>Today's Streak Evaluation</span>
              <span className="text-[10px] font-bold text-[#60577F]">Connected to Ledger</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#ffffff] p-3 rounded-xl border border-[#E3E2E0]">
                <span className="text-[10px] text-[#79757E] block font-bold">Daily Spending Limit</span>
                <span className="text-base font-extrabold text-[#1A1C1A]">
                  {formatCurrency(dailyLimit, currency)}
                </span>
              </div>

              <div className="bg-[#ffffff] p-3 rounded-xl border border-[#E3E2E0]">
                <span className="text-[10px] text-[#79757E] block font-bold">Actual Spent Today</span>
                <span className={`text-base font-extrabold ${isWithinLimit ? 'text-[#27AE60]' : 'text-[#BA1A1A]'}`}>
                  {formatCurrency(todaySpent, currency)}
                </span>
              </div>
            </div>

            {/* Streak Status Evaluation */}
            {isWithinLimit || streakFrozen ? (
              <div className="p-3 bg-[#E2F0D9] rounded-xl border border-[#BDE0A8] flex items-center space-x-2.5 text-xs text-[#27AE60] font-extrabold">
                <Check className="w-5 h-5 text-[#27AE60] shrink-0" />
                <div>
                  <span className="block font-black text-sm">🟢 Under limit by {formatCurrency(diffAmount, currency)}</span>
                  <span className="block text-[11px] font-bold text-[#27AE60]">🔥 Streak Continues! You spent within your daily cap.</span>
                  {streakFrozen && <span className="block text-[10px] font-bold text-[#60577F]">🧊 Streak Freeze Activated!</span>}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-[#FFDAD6] rounded-xl border border-[#FFB4AB] space-y-2 text-xs text-[#BA1A1A]">
                <div className="flex items-center space-x-2 font-extrabold">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block font-black text-sm">🔴 Over limit by {formatCurrency(diffAmount, currency)}</span>
                    <span className="block text-[11px]">⚠️ Streak Affected! Exceeded today's spending limit.</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#FFB4AB]">
                  <span className="font-bold text-[11px]">Streak: {streakDays} Days → Paused</span>
                  <button
                    onClick={handleUseFreeze}
                    className="px-3 py-1 rounded-lg bg-[#1A1C1A] text-[#FAF9F6] font-extrabold text-[10px] flex items-center space-x-1 hover:bg-[#2E312F] transition-all"
                  >
                    <Snowflake className="w-3 h-3 text-[#DCD0FF]" />
                    <span>🧊 Use Streak Freeze</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 🏆 Rewards Unlocked Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-[#1A1C1A] uppercase tracking-wider flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-[#FFD700]" />
                <span>🏆 Rewards (30-Day Streak → Reward Unlocked 🎁)</span>
              </h4>
              <span className="text-[10px] font-bold text-[#27AE60] bg-[#E2F0D9] px-2 py-0.5 rounded-md">
                1 Reward Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {rewards.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedReward === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReward(r.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#1A1C1A] text-[#FAF9F6] border-[#1A1C1A] shadow-md scale-[1.02]'
                        : 'bg-[#ffffff] border-[#E3E2E0] hover:border-[#625981] text-[#1A1C1A]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${r.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs block">{r.name}</span>
                        <span className={`text-[10px] block ${isSelected ? 'text-[#DCD0FF]' : 'text-[#79757E]'}`}>
                          {r.detail}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <Sparkles className={`w-4 h-4 ${isSelected ? 'text-[#FFD700]' : 'text-[#79757E]'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#ffffff] border-t border-[#E3E2E0] flex items-center justify-between text-xs">
          <span className="font-semibold text-[#79757E]">
            {selectedReward ? `Selected: ${rewards.find(r => r.id === selectedReward)?.name}` : 'Tap a reward voucher to claim'}
          </span>
          <button
            onClick={() => {
              if (selectedReward) {
                alert(`🎉 Success! Your reward coupon for ${rewards.find(r => r.id === selectedReward)?.name} has been unlocked and sent to your email!`);
              }
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#1A1C1A] text-[#FAF9F6] font-extrabold hover:bg-[#2E312F] transition-all shadow-sm"
          >
            {selectedReward ? 'Claim Voucher 🎁' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};
