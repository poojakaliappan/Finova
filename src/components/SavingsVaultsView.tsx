import React, { useState } from 'react';
import { 
  PiggyBank, 
  Plus, 
  ShieldCheck, 
  Compass, 
  Monitor, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface SavingsVaultsViewProps {
  goals: SavingsGoal[];
  currency: string;
  onAddFunds: (goalId: string, amount: number) => void;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
}

export const SavingsVaultsView: React.FC<SavingsVaultsViewProps> = ({
  goals,
  currency,
  onAddFunds,
  onAddGoal,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [fundAmount, setFundAmount] = useState<string>('');
  const [isDeposit, setIsDeposit] = useState(true);

  // New Goal Modal state
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCurrent, setNewCurrent] = useState('0');
  const [newDate, setNewDate] = useState('2026-12-31');
  const [newCategory, setNewCategory] = useState('Travel');
  const [newIcon, setNewIcon] = useState('Compass');

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  const renderGoalIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-[#625981]" />;
      case 'Compass': return <Compass className="w-5 h-5 text-[#8a7db3]" />;
      case 'Monitor': return <Monitor className="w-5 h-5 text-[#5e604d]" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-[#2e6b4e]" />;
      default: return <PiggyBank className="w-5 h-5 text-[#625981]" />;
    }
  };

  const handleFundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !fundAmount) return;

    const val = parseFloat(fundAmount);
    if (isNaN(val) || val <= 0) return;

    onAddFunds(selectedGoal.id, isDeposit ? val : -val);
    setSelectedGoal(null);
    setFundAmount('');
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;

    onAddGoal({
      title: newTitle,
      targetAmount: parseFloat(newTarget),
      currentAmount: parseFloat(newCurrent || '0'),
      targetDate: newDate,
      category: newCategory,
      icon: newIcon,
      autoMonthly: 250,
    });

    setShowNewGoalModal(false);
    setNewTitle('');
    setNewTarget('');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1c1a]">Savings Vaults & Goals</h2>
          <p className="text-xs text-[#79757e]">Nurture your future milestones with dedicated paper vaults.</p>
        </div>
        <button
          onClick={() => setShowNewGoalModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#dcd0ff] hover:bg-[#ccc0ee] text-[#1a1c1a] shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Vault</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-[#f5f5dc] rounded-2xl p-6 border border-[#e3e2e0] shadow-paper flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#60577f]">Total Vault Reserve</span>
          <div className="text-3xl font-bold text-[#1a1c1a]">
            {formatCurrency(totalSaved, currency)} <span className="text-base font-medium text-[#79757e]">/ {formatCurrency(totalTarget, currency)}</span>
          </div>
          <p className="text-xs text-[#48454e]">
            Overall Progress: <strong className="text-[#625981]">{Math.round((totalSaved / totalTarget) * 100)}% accumulated</strong>
          </p>
        </div>

        <div className="w-full md:w-64 bg-[#ffffff] p-4 rounded-xl border border-[#e3e2e0] space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[#1a1c1a]">Overall Vault Completion</span>
            <span className="text-[#625981]">{Math.round((totalSaved / totalTarget) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-[#f4f3f1] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#625981] rounded-full transition-all duration-500"
              style={{ width: `${Math.round((totalSaved / totalTarget) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Vault Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div 
              key={goal.id} 
              className="bg-[#ffffff] rounded-2xl p-6 border border-[#e3e2e0] shadow-paper shadow-paper-hover space-y-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#dcd0ff]/50 border border-[#e3e2e0] flex items-center justify-center shrink-0">
                      {renderGoalIcon(goal.icon)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1a1c1a]">{goal.title}</h3>
                      <div className="flex items-center space-x-2 text-xs text-[#79757e] mt-0.5">
                        <span className="font-semibold text-[#60577f]">{goal.category}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-[#79757e]" />
                          Target: {formatDate(goal.targetDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold bg-[#f4f3f1] text-[#60577f] px-2.5 py-1 rounded-lg">
                    {pct}%
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-2xl font-bold text-[#1a1c1a]">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                    <span className="text-xs font-medium text-[#79757e]">
                      target {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-[#f4f3f1] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#625981] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#f4f3f1] flex items-center justify-between">
                <span className="text-xs text-[#79757e]">
                  {remaining === 0 ? 'Goal reached 🎉' : `${formatCurrency(remaining, currency)} left to reach goal`}
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setIsDeposit(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#dcd0ff] hover:bg-[#ccc0ee] text-[#1a1c1a] transition-all"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 text-[#2e6b4e]" />
                    <span>Deposit</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setIsDeposit(false);
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#f4f3f1] hover:bg-[#e9e8e5] text-[#48454e] transition-all"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#ba1a1a]" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Fund Deposit/Withdraw Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1c1a]/40 backdrop-blur-sm p-4">
          <div className="bg-[#ffffff] rounded-2xl w-full max-w-sm border border-[#e3e2e0] p-6 shadow-modal space-y-4">
            <h3 className="text-base font-bold text-[#1a1c1a]">
              {isDeposit ? 'Deposit Funds to Vault' : 'Withdraw Funds from Vault'}
            </h3>
            <p className="text-xs text-[#79757e]">
              Vault: <strong className="text-[#1a1c1a]">{selectedGoal.title}</strong>
            </p>

            <form onSubmit={handleFundSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454e]">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="250.00"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm font-bold bg-[#f4f3f1] border border-[#e3e2e0] focus:outline-none text-[#1a1c1a]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f4f3f1] text-[#48454e]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#dcd0ff] text-[#1a1c1a]"
                >
                  Confirm {isDeposit ? 'Deposit' : 'Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1c1a]/40 backdrop-blur-sm p-4">
          <div className="bg-[#ffffff] rounded-2xl w-full max-w-md border border-[#e3e2e0] p-6 shadow-modal space-y-4">
            <h3 className="text-lg font-bold text-[#1a1c1a]">Create New Savings Vault</h3>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454e]">Vault Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Electric Bike"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#f4f3f1] border border-[#e3e2e0] focus:outline-none text-[#1a1c1a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#48454e]">Target Goal ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="1500"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#f4f3f1] border border-[#e3e2e0] focus:outline-none text-[#1a1c1a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#48454e]">Initial Saved ($)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={newCurrent}
                    onChange={(e) => setNewCurrent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#f4f3f1] border border-[#e3e2e0] focus:outline-none text-[#1a1c1a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#48454e]">Target Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#f4f3f1] border border-[#e3e2e0] focus:outline-none text-[#1a1c1a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#48454e]">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#f4f3f1] border border-[#e3e2e0] focus:outline-none text-[#1a1c1a]"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Tech & Home">Tech & Home</option>
                    <option value="Investing">Investing</option>
                    <option value="Vehicle">Vehicle</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f4f3f1] text-[#48454e]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#dcd0ff] text-[#1a1c1a]"
                >
                  Create Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
