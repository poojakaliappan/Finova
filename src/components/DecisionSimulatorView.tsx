import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Target, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingBag, 
  Calculator, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  Sliders,
  HelpCircle,
  Gift
} from 'lucide-react';
import { SavingsGoal, Transaction, Category } from '../types';
import { formatCurrency } from '../utils/formatters';

interface DecisionSimulatorViewProps {
  savingsGoals: SavingsGoal[];
  onUpdateGoals: (goals: SavingsGoal[]) => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  currency: string;
}

export const DecisionSimulatorView: React.FC<DecisionSimulatorViewProps> = ({
  savingsGoals,
  onUpdateGoals,
  onAddTransaction,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<'decision' | 'mission' | 'rewind' | 'whatif'>('decision');

  // --- DECISION MODE STATE ---
  const [purchaseItem, setPurchaseItem] = useState('Designer Outfit / Item');
  const [purchaseAmount, setPurchaseAmount] = useState<number>(3000);
  const [selectedGoalId, setSelectedGoalId] = useState<string>(savingsGoals[0]?.id || 'goal-laptop');
  const [decisionExecutedMessage, setDecisionExecutedMessage] = useState<string | null>(null);

  // --- REWIND YOUR MONEY STATE ---
  const [foodSpentSlider, setFoodSpentSlider] = useState<number>(1800);
  const [shoppingSpentSlider, setShoppingSpentSlider] = useState<number>(1200);
  const [entertainmentSpentSlider, setEntertainmentSpentSlider] = useState<number>(900);

  // --- WHAT-IF ENGINE STATE ---
  const [customWhatIfQuery, setCustomWhatIfQuery] = useState('');
  const [activeWhatIfResult, setActiveWhatIfResult] = useState<{
    query: string;
    monthlySaved: number;
    yearlySaved: number;
    goalImpactDays: number;
    progressIncreasePercent: number;
  } | null>(null);

  const selectedGoal = savingsGoals.find((g) => g.id === selectedGoalId) || savingsGoals[0] || {
    id: 'goal-laptop',
    title: 'New Laptop Mission',
    targetAmount: 50000,
    currentAmount: 21000,
    targetDate: '2026-12-20',
    category: 'Education & Tech',
    icon: '💻',
    autoMonthly: 4000
  };

  const remainingGoalAmount = Math.max(0, selectedGoal.targetAmount - selectedGoal.currentAmount);
  const currentGoalPercent = Math.min(100, Math.round((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100));
  const dailySavingsPace = (selectedGoal.autoMonthly || 3000) / 30; // rupees per day pace

  // Calculate day shifts for purchaseAmount
  const daysDelayedBuyNow = Math.max(1, Math.round(purchaseAmount / Math.max(10, dailySavingsPace)));
  const daysAcceleratedSaveNow = Math.max(2, Math.round(purchaseAmount / Math.max(10, dailySavingsPace)));
  const progressBoostPercent = parseFloat(((purchaseAmount / selectedGoal.targetAmount) * 100).toFixed(1));

  // Handle Preset Selection for Decision Mode
  const applyDecisionPreset = (item: string, amount: number) => {
    setPurchaseItem(item);
    setPurchaseAmount(amount);
    setDecisionExecutedMessage(null);
  };

  // Handle Option A: Buy Now
  const handleExecuteBuyNow = () => {
    onAddTransaction({
      title: purchaseItem,
      amount: purchaseAmount,
      type: 'outflow',
      categoryId: 'cat-shopping',
      categoryName: 'Shopping',
      merchant: 'Local Vendor / Online Store',
      paymentMethod: 'UPI',
      notes: `Logged via FINOVA Decision Mode simulator`,
      date: new Date().toISOString().split('T')[0],
      isAutoTracked: true,
    });
    setDecisionExecutedMessage(`Logged ${formatCurrency(purchaseAmount, currency)} for "${purchaseItem}". Moved ${selectedGoal.title} by ${daysDelayedBuyNow} days.`);
  };

  // Handle Option B: Move to Goal
  const handleExecuteMoveToGoal = () => {
    const updated = savingsGoals.map((g) => {
      if (g.id === selectedGoal.id) {
        return {
          ...g,
          currentAmount: g.currentAmount + purchaseAmount,
        };
      }
      return g;
    });
    onUpdateGoals(updated);
    setDecisionExecutedMessage(`🎉 Congratulations! Moved ${formatCurrency(purchaseAmount, currency)} to "${selectedGoal.title}". Accelerated completion by ${daysAcceleratedSaveNow} days!`);
  };

  // Rewind calculations
  const actualFood = 3500;
  const actualShopping = 2800;
  const actualEntertainment = 1800;
  const actualTotalDiscretionary = actualFood + actualShopping + actualEntertainment;

  const alternativeTotalDiscretionary = foodSpentSlider + shoppingSpentSlider + entertainmentSpentSlider;
  const potentialSavingsMonthly = Math.max(0, actualTotalDiscretionary - alternativeTotalDiscretionary);
  const potentialDaysGoalCloser = Math.round(potentialSavingsMonthly / Math.max(10, dailySavingsPace));

  // Preset What-If Prompts
  const handleRunWhatIfPreset = (type: string) => {
    if (type === 'food') {
      setActiveWhatIfResult({
        query: 'What if I stop ordering food delivery for 30 days?',
        monthlySaved: 2400,
        yearlySaved: 28800,
        goalImpactDays: 16,
        progressIncreasePercent: 4.8,
      });
    } else if (type === 'daily100') {
      setActiveWhatIfResult({
        query: 'What if I start saving ₹100 every single day?',
        monthlySaved: 3000,
        yearlySaved: 36500,
        goalImpactDays: 20,
        progressIncreasePercent: 6.0,
      });
    } else if (type === 'subscriptions') {
      setActiveWhatIfResult({
        query: 'What if I cancel 2 unused streaming subscriptions?',
        monthlySaved: 699,
        yearlySaved: 8388,
        goalImpactDays: 5,
        progressIncreasePercent: 1.4,
      });
    } else if (type === 'coffee') {
      setActiveWhatIfResult({
        query: 'What if I brew coffee at home instead of buying out daily?',
        monthlySaved: 1500,
        yearlySaved: 18000,
        goalImpactDays: 10,
        progressIncreasePercent: 3.0,
      });
    }
  };

  const handleRunCustomWhatIf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWhatIfQuery.trim()) return;

    // Smart heuristic calculator
    const extractedNumMatch = customWhatIfQuery.match(/(\d+)/);
    const num = extractedNumMatch ? parseInt(extractedNumMatch[0], 10) : 100;

    let monthly = num;
    if (customWhatIfQuery.toLowerCase().includes('day') || customWhatIfQuery.toLowerCase().includes('daily')) {
      monthly = num * 30;
    } else if (customWhatIfQuery.toLowerCase().includes('week')) {
      monthly = num * 4;
    }

    const yearly = monthly * 12;
    const daysCloser = Math.max(2, Math.round(monthly / Math.max(10, dailySavingsPace)));
    const percent = parseFloat(((monthly / selectedGoal.targetAmount) * 100).toFixed(1));

    setActiveWhatIfResult({
      query: customWhatIfQuery,
      monthlySaved: monthly,
      yearlySaved: yearly,
      goalImpactDays: daysCloser,
      progressIncreasePercent: percent,
    });
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Header & Identity Positioning */}
      <div className="bg-[#1A1C1A] text-[#FAF9F6] p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-[#625981]/40">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-gradient-to-br from-[#8B5CF6]/20 via-[#EC4899]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#DCD0FF] text-xs font-black uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>FINOVA Identity</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#FAF9F6] tracking-tight">
            Personal Financial Decision Simulator
          </h1>
          
          <p className="text-sm sm:text-base text-[#DCD0FF]/90 font-medium leading-relaxed">
            <span className="text-[#00FF66] font-bold font-mono">"See the consequences before you spend."</span> Every rupee is a choice between today's transient want and your future life goals.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-[#292D2A] text-[#E3E2E0] border border-[#3E423F] font-semibold flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>3-Futures Simulation</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#292D2A] text-[#E3E2E0] border border-[#3E423F] font-semibold flex items-center space-x-1">
              <RotateCcw className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Rewind Your Money</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#292D2A] text-[#E3E2E0] border border-[#3E423F] font-semibold flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>What-If Engine</span>
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E3E2E0] pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('decision')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'decision'
              ? 'bg-[#1A1C1A] text-[#FAF9F6] shadow-md'
              : 'bg-[#F4F3F1] text-[#48454E] hover:bg-[#EAE8E4]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#FFD700]" />
          <span>Decision Mode (3 Futures)</span>
        </button>

        <button
          onClick={() => setActiveTab('mission')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'mission'
              ? 'bg-[#1A1C1A] text-[#FAF9F6] shadow-md'
              : 'bg-[#F4F3F1] text-[#48454E] hover:bg-[#EAE8E4]'
          }`}
        >
          <Target className="w-4 h-4 text-[#8B5CF6]" />
          <span>The Money Mission</span>
        </button>

        <button
          onClick={() => setActiveTab('rewind')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'rewind'
              ? 'bg-[#1A1C1A] text-[#FAF9F6] shadow-md'
              : 'bg-[#F4F3F1] text-[#48454E] hover:bg-[#EAE8E4]'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-[#00FF66]" />
          <span>Rewind Your Money</span>
        </button>

        <button
          onClick={() => setActiveTab('whatif')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'whatif'
              ? 'bg-[#1A1C1A] text-[#FAF9F6] shadow-md'
              : 'bg-[#F4F3F1] text-[#48454E] hover:bg-[#EAE8E4]'
          }`}
        >
          <Zap className="w-4 h-4 text-[#EC4899]" />
          <span>Financial What-If Engine</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DECISION MODE (3 FUTURES PROJECTION) */}
      {/* ========================================================= */}
      {activeTab === 'decision' && (
        <div className="space-y-6">
          
          {/* Top Control Panel */}
          <div className="bg-[#ffffff] p-6 rounded-3xl border border-[#E3E2E0] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4F3F1] pb-4">
              <div>
                <h3 className="text-lg font-black text-[#1A1C1A] flex items-center space-x-2">
                  <span>🔮 Virtual Purchase Simulator</span>
                </h3>
                <p className="text-xs text-[#79757E] mt-0.5">
                  Put any prospective purchase into a virtual simulation before paying to see your 3 possible futures.
                </p>
              </div>

              {/* Goal Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#48454E]">Anchor Goal:</span>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] focus:outline-none"
                >
                  {savingsGoals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.icon} {g.title} ({formatCurrency(g.currentAmount, currency)} / {formatCurrency(g.targetAmount, currency)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Demo Preset Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#79757E] uppercase tracking-wider block">
                ⚡ Quick Demo Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applyDecisionPreset('Designer Dress / Outfit', 3000)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] transition-all"
                >
                  👗 Dress: ₹3,000
                </button>
                <button
                  onClick={() => applyDecisionPreset('Wireless ANC Earbuds', 4500)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] transition-all"
                >
                  🎧 Earbuds: ₹4,500
                </button>
                <button
                  onClick={() => applyDecisionPreset('Weekend Party Dinner', 1200)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] transition-all"
                >
                  🍔 Dinner Out: ₹1,200
                </button>
                <button
                  onClick={() => applyDecisionPreset('Gourmet Artisanal Coffee', 350)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] transition-all"
                >
                  ☕ Coffee: ₹350
                </button>
              </div>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-[#48454E] block mb-1">
                  Item / Expense Description
                </label>
                <input
                  type="text"
                  value={purchaseItem}
                  onChange={(e) => {
                    setPurchaseItem(e.target.value);
                    setDecisionExecutedMessage(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] focus:outline-none"
                  placeholder="e.g. Designer Dress, Concert Ticket"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#48454E] block mb-1">
                  Proposed Cost ({currency})
                </label>
                <input
                  type="number"
                  value={purchaseAmount || ''}
                  onChange={(e) => {
                    setPurchaseAmount(Number(e.target.value));
                    setDecisionExecutedMessage(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] focus:outline-none"
                  placeholder="e.g. 3000"
                />
              </div>
            </div>
          </div>

          {/* Feedback notification if action executed */}
          {decisionExecutedMessage && (
            <div className="p-4 rounded-2xl bg-[#E2F0D9] border border-[#27AE60]/40 text-[#1E7E34] text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-300">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#27AE60]" />
              <span>{decisionExecutedMessage}</span>
            </div>
          )}

          {/* THE 3 FUTURES CARDS DISPLAY */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#79757E] uppercase tracking-wider">
              🔮 Simulated Futures for "{purchaseItem}" ({formatCurrency(purchaseAmount, currency)}):
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* OPTION A: BUY NOW */}
              <div className="bg-[#ffffff] p-6 rounded-3xl border-2 border-[#BA1A1A]/30 hover:border-[#BA1A1A] transition-all shadow-sm space-y-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#BA1A1A] text-[#ffffff] px-3 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-wider">
                  Option A
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-[#BA1A1A]">
                    <ShoppingBag className="w-5 h-5" />
                    <h5 className="text-base font-black">BUY NOW</h5>
                  </div>

                  <p className="text-xs font-bold text-[#1A1C1A]">
                    Spend {formatCurrency(purchaseAmount, currency)} today on {purchaseItem}
                  </p>

                  <div className="p-3 rounded-2xl bg-[#FFDAD6]/50 border border-[#BA1A1A]/20 space-y-1 text-xs">
                    <span className="font-bold text-[#BA1A1A] block">
                      ⚠️ Goal Completion Impact:
                    </span>
                    <p className="text-[#410002] font-semibold">
                      Your <span className="font-bold">{selectedGoal.title}</span> will be delayed by <span className="font-black text-[#BA1A1A]">+{daysDelayedBuyNow} days</span>.
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-[#79757E]">
                    <div className="flex justify-between">
                      <span>Goal Progress:</span>
                      <span className="font-bold text-[#1A1C1A]">{currentGoalPercent}%</span>
                    </div>
                    <div className="w-full bg-[#F4F3F1] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#BA1A1A] h-full rounded-full" style={{ width: `${currentGoalPercent}%` }} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleExecuteBuyNow}
                  className="w-full py-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#FFDAD6] text-[#BA1A1A] border border-[#BA1A1A]/40 font-bold text-xs transition-all active:scale-95 flex items-center justify-center space-x-1 mt-4"
                >
                  <span>Pay & Log Expense ({formatCurrency(purchaseAmount, currency)})</span>
                </button>
              </div>

              {/* OPTION B: DON'T BUY / SAVE NOW */}
              <div className="bg-[#ffffff] p-6 rounded-3xl border-2 border-[#27AE60] hover:border-[#1E7E34] transition-all shadow-md space-y-4 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#E2F0D9]/30 to-transparent">
                <div className="absolute top-0 right-0 bg-[#27AE60] text-[#ffffff] px-3 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-wider">
                  Option B ⭐ Recommended
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-[#27AE60]">
                    <Target className="w-5 h-5" />
                    <h5 className="text-base font-black">DON'T BUY / SAVE NOW</h5>
                  </div>

                  <p className="text-xs font-bold text-[#1A1C1A]">
                    Redirect {formatCurrency(purchaseAmount, currency)} to your {selectedGoal.title}
                  </p>

                  <div className="p-3 rounded-2xl bg-[#E2F0D9] border border-[#27AE60]/30 space-y-1 text-xs">
                    <span className="font-bold text-[#1E7E34] block">
                      🎉 Goal Acceleration:
                    </span>
                    <p className="text-[#0D4419] font-semibold">
                      Accelerates goal completion by <span className="font-black text-[#27AE60]">{daysAcceleratedSaveNow} days earlier</span>! (+{progressBoostPercent}% progress boost)
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-[#79757E]">
                    <div className="flex justify-between">
                      <span>New Projected Progress:</span>
                      <span className="font-bold text-[#27AE60]">{Math.min(100, parseFloat((currentGoalPercent + progressBoostPercent).toFixed(1)))}%</span>
                    </div>
                    <div className="w-full bg-[#F4F3F1] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#27AE60] h-full rounded-full" style={{ width: `${Math.min(100, currentGoalPercent + progressBoostPercent)}%` }} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleExecuteMoveToGoal}
                  className="w-full py-2.5 rounded-xl bg-[#27AE60] hover:bg-[#1E7E34] text-[#ffffff] font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 mt-4"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD700]" />
                  <span>Move {formatCurrency(purchaseAmount, currency)} to Goal (+{progressBoostPercent}%)</span>
                </button>
              </div>

              {/* OPTION C: BUY LATER (MICRO-SAVE) */}
              <div className="bg-[#ffffff] p-6 rounded-3xl border-2 border-[#625981]/30 hover:border-[#625981] transition-all shadow-sm space-y-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#625981] text-[#ffffff] px-3 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-wider">
                  Option C
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-[#625981]">
                    <Clock className="w-5 h-5" />
                    <h5 className="text-base font-black">BUY LATER (MICRO-SAVE)</h5>
                  </div>

                  <p className="text-xs font-bold text-[#1A1C1A]">
                    Save {formatCurrency(Math.round(purchaseAmount / 4), currency)}/week over 4 weeks
                  </p>

                  <div className="p-3 rounded-2xl bg-[#F4F3F1] border border-[#E3E2E0] space-y-1 text-xs">
                    <span className="font-bold text-[#625981] block">
                      ⏰ Balanced Compromise:
                    </span>
                    <p className="text-[#48454E] font-semibold">
                      Buy in 30 days without disrupting your goal trajectory. Minimal impact (+{Math.round(daysDelayedBuyNow / 3)} days shift).
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-[#79757E]">
                    <div className="flex justify-between">
                      <span>Weekly Micro-Pace:</span>
                      <span className="font-bold text-[#625981]">{formatCurrency(Math.round(purchaseAmount / 4), currency)} / wk</span>
                    </div>
                    <div className="w-full bg-[#F4F3F1] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#625981] h-full rounded-full" style={{ width: `75%` }} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setDecisionExecutedMessage(`Created a 4-week micro-savings plan of ${formatCurrency(Math.round(purchaseAmount / 4), currency)}/week for ${purchaseItem}.`)}
                  className="w-full py-2.5 rounded-xl bg-[#F4F3F1] hover:bg-[#EAE8E4] text-[#1A1C1A] border border-[#E3E2E0] font-bold text-xs transition-all active:scale-95 flex items-center justify-center space-x-1 mt-4"
                >
                  <span>Set Micro-Save Plan ({formatCurrency(Math.round(purchaseAmount / 4), currency)}/wk)</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: THE MONEY MISSION (DIGITAL TWIN LIVE GOAL MAP) */}
      {/* ========================================================= */}
      {activeTab === 'mission' && (
        <div className="space-y-6">
          <div className="bg-[#ffffff] p-6 rounded-3xl border border-[#E3E2E0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#1A1C1A] flex items-center space-x-2">
                  <span>🎯 Your Digital Twin Money Mission</span>
                </h3>
                <p className="text-xs text-[#79757E]">
                  Your real-life goals digital twin. Every decision directly moves these progress rings in real time.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#DCD0FF] text-[#60577F] font-black text-xs">
                {savingsGoals.length} Active Missions
              </span>
            </div>

            {/* Mission Goal Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {savingsGoals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

                return (
                  <div key={goal.id} className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-3 relative group hover:border-[#625981] transition-all">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#1A1C1A] text-xl flex items-center justify-center shadow-xs">
                        {goal.icon}
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#E2F0D9] text-[#1E7E34]">
                        {percent}%
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-[#1A1C1A]">{goal.title}</h4>
                      <p className="text-xs text-[#79757E] mt-0.5">Category: {goal.category}</p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#79757E]">Saved:</span>
                        <span className="text-[#1A1C1A]">{formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}</span>
                      </div>
                      <div className="w-full bg-[#E3E2E0] h-2.5 rounded-full overflow-hidden">
                        <div className="bg-[#625981] h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E3E2E0] flex items-center justify-between text-xs text-[#79757E]">
                      <span>Target: {goal.targetDate}</span>
                      <span className="font-extrabold text-[#625981]">Need: {formatCurrency(remaining, currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: REWIND YOUR MONEY (ACTUAL VS ALTERNATIVE LIFE) */}
      {/* ========================================================= */}
      {activeTab === 'rewind' && (
        <div className="space-y-6">
          <div className="bg-[#ffffff] p-6 rounded-3xl border border-[#E3E2E0] shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-[#1A1C1A] flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-[#00FF66]" />
                <span>⏪ Rewind Your Money</span>
              </h3>
              <p className="text-xs text-[#79757E] mt-0.5">
                "What if I had made different choices last month?" Rewind your spending habits to see your alternative life outcomes.
              </p>
            </div>

            {/* Sliders for Discretionary Spending */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Category 1: Food Delivery & Dining */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#1A1C1A]">🍔 Food Delivery & Dining</span>
                  <span className="text-[#79757E]">Actual: {formatCurrency(actualFood, currency)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max={actualFood}
                  step="100"
                  value={foodSpentSlider}
                  onChange={(e) => setFoodSpentSlider(Number(e.target.value))}
                  className="w-full accent-[#625981] cursor-pointer"
                />
                <div className="flex justify-between text-xs font-black text-[#625981]">
                  <span>Alternative Target:</span>
                  <span>{formatCurrency(foodSpentSlider, currency)}</span>
                </div>
              </div>

              {/* Category 2: Shopping & Outfits */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#1A1C1A]">🛍️ Shopping & Apparel</span>
                  <span className="text-[#79757E]">Actual: {formatCurrency(actualShopping, currency)}</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max={actualShopping}
                  step="100"
                  value={shoppingSpentSlider}
                  onChange={(e) => setShoppingSpentSlider(Number(e.target.value))}
                  className="w-full accent-[#625981] cursor-pointer"
                />
                <div className="flex justify-between text-xs font-black text-[#625981]">
                  <span>Alternative Target:</span>
                  <span>{formatCurrency(shoppingSpentSlider, currency)}</span>
                </div>
              </div>

              {/* Category 3: Entertainment & Movies */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#1A1C1A]">🎬 Entertainment & Movies</span>
                  <span className="text-[#79757E]">Actual: {formatCurrency(actualEntertainment, currency)}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max={actualEntertainment}
                  step="100"
                  value={entertainmentSpentSlider}
                  onChange={(e) => setEntertainmentSpentSlider(Number(e.target.value))}
                  className="w-full accent-[#625981] cursor-pointer"
                />
                <div className="flex justify-between text-xs font-black text-[#625981]">
                  <span>Alternative Target:</span>
                  <span>{formatCurrency(entertainmentSpentSlider, currency)}</span>
                </div>
              </div>

            </div>

            {/* Side-by-Side Actual vs Alternative Life Output Card */}
            <div className="p-6 rounded-3xl bg-[#1A1C1A] text-[#FAF9F6] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2E312F] pb-4">
                <div>
                  <h4 className="text-base font-black flex items-center space-x-2">
                    <span>✨ Rewind Comparison Results</span>
                  </h4>
                  <p className="text-xs text-[#DCD0FF]">
                    Actual Discretionary: {formatCurrency(actualTotalDiscretionary, currency)} vs Alternative: {formatCurrency(alternativeTotalDiscretionary, currency)}
                  </p>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] font-black text-sm">
                  +{formatCurrency(potentialSavingsMonthly, currency)} Extra Savings
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#2E312F] space-y-1">
                  <span className="text-[#79757E] font-bold uppercase block text-[10px]">❌ Actual Past Life</span>
                  <p className="text-sm font-bold text-[#FF8A8A]">Discretionary Spent: {formatCurrency(actualTotalDiscretionary, currency)}</p>
                  <p className="text-xs text-[#DCD0FF]">Goal Timeline: On original schedule</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#2E312F] border border-[#00FF66]/40 space-y-1">
                  <span className="text-[#00FF66] font-bold uppercase block text-[10px]">✨ Alternative Life Outcome</span>
                  <p className="text-sm font-black text-[#00FF66]">Saved: +{formatCurrency(potentialSavingsMonthly, currency)} / month</p>
                  <p className="text-xs text-[#FAF9F6] font-bold">
                    🚀 Your <span className="underline">{selectedGoal.title}</span> would be <span className="text-[#00FF66] font-black">{potentialDaysGoalCloser} days closer</span>!
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: FINANCIAL WHAT-IF ENGINE */}
      {/* ========================================================= */}
      {activeTab === 'whatif' && (
        <div className="space-y-6">
          <div className="bg-[#ffffff] p-6 rounded-3xl border border-[#E3E2E0] shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-[#1A1C1A] flex items-center space-x-2">
                <Zap className="w-5 h-5 text-[#EC4899]" />
                <span>🧠 Financial What-If Engine</span>
              </h3>
              <p className="text-xs text-[#79757E] mt-0.5">
                Experiment with financial choices like a simulation game. Ask any "What if?" prompt to see projected outcomes.
              </p>
            </div>

            {/* Quick Preset Prompts */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#48454E] block">
                Popular Simulation Scenarios:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleRunWhatIfPreset('food')}
                  className="p-3.5 rounded-2xl bg-[#FAF9F6] hover:bg-[#F4F3F1] border border-[#E3E2E0] text-left text-xs font-bold text-[#1A1C1A] transition-all flex items-center justify-between group"
                >
                  <span>🍔 "What if I stop ordering food delivery for 30 days?"</span>
                  <ChevronRight className="w-4 h-4 text-[#79757E] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleRunWhatIfPreset('daily100')}
                  className="p-3.5 rounded-2xl bg-[#FAF9F6] hover:bg-[#F4F3F1] border border-[#E3E2E0] text-left text-xs font-bold text-[#1A1C1A] transition-all flex items-center justify-between group"
                >
                  <span>💰 "What if I start saving ₹100 every single day?"</span>
                  <ChevronRight className="w-4 h-4 text-[#79757E] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleRunWhatIfPreset('subscriptions')}
                  className="p-3.5 rounded-2xl bg-[#FAF9F6] hover:bg-[#F4F3F1] border border-[#E3E2E0] text-left text-xs font-bold text-[#1A1C1A] transition-all flex items-center justify-between group"
                >
                  <span>📺 "What if I cancel 2 unused streaming subscriptions?"</span>
                  <ChevronRight className="w-4 h-4 text-[#79757E] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleRunWhatIfPreset('coffee')}
                  className="p-3.5 rounded-2xl bg-[#FAF9F6] hover:bg-[#F4F3F1] border border-[#E3E2E0] text-left text-xs font-bold text-[#1A1C1A] transition-all flex items-center justify-between group"
                >
                  <span>☕ "What if I brew coffee at home instead of buying out?"</span>
                  <ChevronRight className="w-4 h-4 text-[#79757E] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Custom Input Query */}
            <form onSubmit={handleRunCustomWhatIf} className="pt-2 flex gap-2">
              <input
                type="text"
                value={customWhatIfQuery}
                onChange={(e) => setCustomWhatIfQuery(e.target.value)}
                placeholder="Ask any scenario: e.g. What if I reduce cab trips by ₹200 weekly?"
                className="flex-1 px-4 py-3 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-[#1A1C1A] text-[#FAF9F6] font-black text-xs hover:bg-[#2E312F] transition-all flex items-center space-x-1"
              >
                <Zap className="w-4 h-4 text-[#EC4899]" />
                <span>Simulate</span>
              </button>
            </form>

            {/* Active What-If Result Card */}
            {activeWhatIfResult && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1A1C1A] to-[#2E312F] text-[#FAF9F6] space-y-4 animate-in fade-in duration-300 shadow-lg border border-[#EC4899]/40">
                <div className="flex items-center space-x-2 text-[#EC4899]">
                  <Sparkles className="w-5 h-5" />
                  <h4 className="text-sm font-black uppercase tracking-wider">Simulation Output</h4>
                </div>

                <p className="text-base font-bold text-[#FAF9F6]">
                  "{activeWhatIfResult.query}"
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-2xl bg-[#FAF9F6]/10 space-y-1">
                    <span className="text-[#DCD0FF] text-[10px] font-bold block uppercase">Monthly Saved</span>
                    <span className="text-lg font-black text-[#00FF66]">{formatCurrency(activeWhatIfResult.monthlySaved, currency)}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF9F6]/10 space-y-1">
                    <span className="text-[#DCD0FF] text-[10px] font-bold block uppercase">Yearly Impact</span>
                    <span className="text-lg font-black text-[#FFD700]">{formatCurrency(activeWhatIfResult.yearlySaved, currency)}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF9F6]/10 space-y-1">
                    <span className="text-[#DCD0FF] text-[10px] font-bold block uppercase">Goal Acceleration</span>
                    <span className="text-lg font-black text-[#8B5CF6]">+{activeWhatIfResult.goalImpactDays} Days Earlier</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF9F6]/10 space-y-1">
                    <span className="text-[#DCD0FF] text-[10px] font-bold block uppercase">Progress Boost</span>
                    <span className="text-lg font-black text-[#EC4899]">+{activeWhatIfResult.progressIncreasePercent}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#EC4899]/10 border border-[#EC4899]/30 text-xs text-[#FAF9F6] font-semibold flex items-center justify-between">
                  <span>💡 By executing this choice, your <strong className="text-[#00FF66]">{selectedGoal.title}</strong> shifts {activeWhatIfResult.goalImpactDays} days closer!</span>
                  <button
                    onClick={() => {
                      const updated = savingsGoals.map((g) => {
                        if (g.id === selectedGoal.id) {
                          return { ...g, currentAmount: g.currentAmount + activeWhatIfResult.monthlySaved };
                        }
                        return g;
                      });
                      onUpdateGoals(updated);
                      alert(`🎉 Added ${formatCurrency(activeWhatIfResult.monthlySaved, currency)} to ${selectedGoal.title}!`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#EC4899] text-[#ffffff] font-extrabold hover:bg-[#D93680] transition-all"
                  >
                    Apply Savings to Goal
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
