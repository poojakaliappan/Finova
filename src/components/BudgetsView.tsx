import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Edit2, 
  AlertCircle, 
  CheckCircle2, 
  Utensils, 
  ShoppingBag, 
  Home, 
  Car, 
  Tv, 
  Package, 
  HeartPulse, 
  CircleDollarSign,
  Lock,
  Unlock,
  ShieldAlert,
  Calendar,
  Trash2,
  Bell,
  Clock,
  Check
} from 'lucide-react';
import { Category, Transaction, BudgetMoneyLock } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface BudgetsViewProps {
  categories: Category[];
  transactions: Transaction[];
  currency: string;
  onUpdateCategoryBudget: (categoryId: string, newTarget: number) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  categories,
  transactions,
  currency,
  onUpdateCategoryBudget,
  onAddCategory,
}) => {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  
  // New Category State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatBudget, setNewCatBudget] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('ShoppingBag');

  // Budget Money Lock State (User Controlled)
  const [moneyLocks, setMoneyLocks] = useState<BudgetMoneyLock[]>(() => {
    const saved = localStorage.getItem('finova_budget_money_locks');
    return saved ? JSON.parse(saved) : [
      {
        id: 'lock-1',
        title: 'College Exam & Hostel Fees',
        amount: 15000,
        unlockDate: '2026-08-15',
        isLocked: true,
        notes: 'Money received from parents. Portal opens on 15th Aug for fee payment.',
        category: 'Education / College',
      },
    ];
  });

  const [showAddLockModal, setShowAddLockModal] = useState(false);
  const [newLockTitle, setNewLockTitle] = useState('');
  const [newLockAmount, setNewLockAmount] = useState('');
  const [newLockDate, setNewLockDate] = useState('');
  const [newLockNotes, setNewLockNotes] = useState('');
  const [newLockCategory, setNewLockCategory] = useState('College Fees');

  // Expired Money Locks Notification Helper State
  const [expiredAlertBanner, setExpiredAlertBanner] = useState<string | null>(null);

  useEffect(() => {
    // Helper function to check for expired money locks when visiting Budgets tab
    const now = new Date().getTime();
    const expiredLocks = moneyLocks.filter(
      (l) => l.isLocked && new Date(l.unlockDate).getTime() <= now
    );

    if (expiredLocks.length > 0) {
      const titles = expiredLocks.map((l) => `'${l.title}' (${formatCurrency(l.amount, currency)})`).join(', ');
      setExpiredAlertBanner(
        `🎉 Lock Expired: Your locked fund ${titles} target release date has arrived (${formatDate(expiredLocks[0].unlockDate)}) and is now unlocked & ready for use!`
      );
    } else {
      setExpiredAlertBanner(null);
    }
  }, [moneyLocks, currency]);

  useEffect(() => {
    localStorage.setItem('finova_budget_money_locks', JSON.stringify(moneyLocks));
  }, [moneyLocks]);

  const totalLockedAmount = moneyLocks
    .filter((l) => l.isLocked)
    .reduce((sum, l) => sum + l.amount, 0);

  const budgetCategories = categories.filter((c) => c.targetBudget > 0);

  const totalMonthlyTarget = budgetCategories.reduce((sum, c) => sum + c.targetBudget, 0);
  const totalSpent = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home className="w-5 h-5 text-[#625981]" />;
      case 'Utensils': return <Utensils className="w-5 h-5 text-[#8a7db3]" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-[#5e604d]" />;
      case 'Tv': return <Tv className="w-5 h-5 text-[#79757e]" />;
      case 'Car': return <Car className="w-5 h-5 text-[#60577f]" />;
      case 'Package': return <Package className="w-5 h-5 text-[#938ab8]" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-[#636451]" />;
      default: return <CircleDollarSign className="w-5 h-5 text-[#625981]" />;
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setEditAmount(cat.targetBudget.toString());
  };

  const handleSaveEdit = (catId: string) => {
    const val = parseFloat(editAmount);
    if (!isNaN(val) && val >= 0) {
      onUpdateCategoryBudget(catId, val);
    }
    setEditingCategoryId(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatBudget) return;

    onAddCategory({
      name: newCatName,
      targetBudget: parseFloat(newCatBudget),
      icon: newCatIcon,
      color: '#625981',
      description: 'Custom category target',
    });

    setNewCatName('');
    setNewCatBudget('');
    setShowAddCategoryModal(false);
  };

  const handleCreateLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLockTitle || !newLockAmount || !newLockDate) return;

    const newLock: BudgetMoneyLock = {
      id: `lock-${Date.now()}`,
      title: newLockTitle,
      amount: parseFloat(newLockAmount),
      unlockDate: newLockDate,
      isLocked: true,
      notes: newLockNotes || 'Parent / Essential Locked Funds',
      category: newLockCategory,
    };

    setMoneyLocks([...moneyLocks, newLock]);
    setNewLockTitle('');
    setNewLockAmount('');
    setNewLockDate('');
    setNewLockNotes('');
    setShowAddLockModal(false);
  };

  const toggleLockStatus = (id: string) => {
    setMoneyLocks(
      moneyLocks.map((l) =>
        l.id === id ? { ...l, isLocked: !l.isLocked } : l
      )
    );
  };

  const handleDeleteLock = (id: string) => {
    setMoneyLocks(moneyLocks.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 🔔 Expired Money Lock Release Alert Banner */}
      {expiredAlertBanner && (
        <div className="bg-[#1A1C1A] text-[#FAF9F6] p-4 sm:p-5 rounded-3xl border-2 border-[#00FF66] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#00FF66]/20 text-[#00FF66] flex items-center justify-center font-bold text-xl shrink-0 border border-[#00FF66]/30">
              <Bell className="w-5 h-5 animate-bounce text-[#00FF66]" />
            </div>
            <div>
              <span className="text-[10px] font-black text-[#00FF66] uppercase tracking-wider block">
                Money Lock Release Alert
              </span>
              <p className="text-xs sm:text-sm text-[#FAF9F6] font-bold mt-0.5">
                {expiredAlertBanner}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => {
                setMoneyLocks(
                  moneyLocks.map((l) =>
                    new Date(l.unlockDate).getTime() <= new Date().getTime() ? { ...l, isLocked: false } : l
                  )
                );
                setExpiredAlertBanner(null);
              }}
              className="px-4 py-2 rounded-xl bg-[#00FF66] text-[#1A1C1A] text-xs font-black hover:bg-[#00E059] transition-all flex items-center space-x-1.5 shadow-md active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Unlock All Due Funds</span>
            </button>

            <button
              onClick={() => setExpiredAlertBanner(null)}
              className="px-3 py-2 rounded-xl bg-[#2E312F] text-[#A09CA8] text-xs font-bold hover:bg-[#3E423F]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1c1a]">Budget Allocations & Essential Fee Protection</h2>
          <p className="text-xs text-[#79757e]">Lock college fees & set spending caps for peace of mind across categories.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddLockModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1A1C1A] text-[#FAF9F6] shadow-md hover:bg-[#2E312F] transition-all"
          >
            <Lock className="w-4 h-4 text-[#00FF66]" />
            <span>+ Lock Money for Fees</span>
          </button>

          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#dcd0ff] hover:bg-[#ccc0ee] text-[#1a1c1a] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Category Budget</span>
          </button>
        </div>
      </div>

      {/* 🔒 IMPORTANT MONEY LOCK & FEE PROTECTION VAULT */}
      <div className="bg-[#1A1C1A] text-[#FAF9F6] rounded-3xl p-6 shadow-xl border border-[#3E423F] space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00FF66]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E312F] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00FF66]/20 border border-[#00FF66]/30 text-[#00FF66] flex items-center justify-center font-black text-2xl">
              🔒
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-[#FAF9F6]">Money Lock & Essential Fee Vault</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00FF66]/20 text-[#00FF66] text-[10px] font-black uppercase tracking-wider">
                  Parent / Essential Lock
                </span>
              </div>
              <p className="text-xs text-[#A09CA8] mt-0.5">
                Lock money received for college fees, hostel rent, or exams so it cannot be spent on shopping or food.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddLockModal(true)}
            className="px-4 py-2 rounded-2xl bg-[#00FF66] text-[#1A1C1A] text-xs font-black hover:bg-[#00E059] transition-all flex items-center space-x-2 self-start sm:self-auto shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Lock Money</span>
          </button>
        </div>

        {/* Total Locked Amount Header Banner */}
        <div className="p-4 rounded-2xl bg-[#2E312F] border border-[#3E423F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-[#A09CA8] uppercase tracking-wider block">Total Locked Essential Funds</span>
            <span className="text-2xl font-black text-[#00FF66]">
              {formatCurrency(totalLockedAmount, currency)}
            </span>
          </div>
          <div className="text-xs text-[#DCD0FF] bg-[#1A1C1A] px-3 py-2 rounded-xl border border-[#3E423F] flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#00FF66]" />
            <span>Funds remain locked until unlock date or manual release.</span>
          </div>
        </div>

        {/* Money Lock List Grid */}
        <div className="space-y-3">
          {moneyLocks.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#A09CA8] bg-[#2E312F] rounded-2xl border border-[#3E423F]">
              🔒 No money currently locked. Tap "+ Lock Money" to safeguard important college/hostel fees from accidental spending.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moneyLocks.map((lock) => {
                const todayMs = new Date().setHours(0,0,0,0);
                const unlockMs = new Date(lock.unlockDate).setHours(0,0,0,0);
                const daysDiff = Math.ceil((unlockMs - todayMs) / (1000 * 60 * 60 * 24));
                const isDatePassed = daysDiff <= 0;
                
                const cycleDays = 30;
                const elapsed = Math.max(0, cycleDays - Math.max(0, daysDiff));
                const progressPercent = isDatePassed ? 100 : Math.min(100, Math.max(8, Math.round((elapsed / cycleDays) * 100)));

                return (
                  <div
                    key={lock.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 relative ${
                      lock.isLocked
                        ? 'bg-[#252826] border-[#00FF66]/40 shadow-md'
                        : 'bg-[#2E312F] border-[#A09CA8]/30 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                          lock.isLocked ? 'bg-[#00FF66]/20 text-[#00FF66]' : 'bg-[#A09CA8]/20 text-[#A09CA8]'
                        }`}>
                          {lock.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-[#FAF9F6]">{lock.title}</h4>
                          <span className="text-[10px] font-bold text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {lock.category || 'Essential Fee'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteLock(lock.id)}
                        className="text-[#FF8585] hover:text-[#ff5555] p-1 rounded-lg hover:bg-[#3E423F] transition-colors"
                        title="Delete Lock"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-[10px] font-bold text-[#A09CA8] uppercase block">Locked Amount</span>
                        <span className="text-xl font-black text-[#FAF9F6]">
                          {formatCurrency(lock.amount, currency)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-[#A09CA8] uppercase block">Unlock Date</span>
                        <span className="text-xs font-bold text-[#DCD0FF] flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-[#00FF66]" />
                          <span>{formatDate(lock.unlockDate)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar for Lock Duration */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-[#A09CA8] flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-[#00FF66]" />
                          <span>Duration Progress</span>
                        </span>
                        <span className={isDatePassed ? 'text-[#FFD700]' : 'text-[#00FF66]'}>
                          {isDatePassed 
                            ? '⏰ Target Date Reached / Unlocked' 
                            : `${daysDiff} day${daysDiff > 1 ? 's' : ''} remaining (${progressPercent}%)`}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-[#1A1C1A] rounded-full overflow-hidden border border-[#3E423F]">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDatePassed ? 'bg-[#FFD700]' : 'bg-[#00FF66]'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {lock.notes && (
                      <p className="text-[11px] text-[#A09CA8] bg-[#1A1C1A] p-2.5 rounded-xl border border-[#3E423F] leading-relaxed">
                        📝 {lock.notes}
                      </p>
                    )}

                    {/* Status Badge & Actions */}
                    <div className="pt-2 border-t border-[#3E423F] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      {lock.isLocked ? (
                        <div className="flex items-center space-x-1 text-[#00FF66] font-extrabold text-[11px]">
                          {isDatePassed ? (
                            <span className="text-[#FFD700] flex items-center space-x-1">
                              <Bell className="w-3.5 h-3.5 animate-bounce" />
                              <span>Fee Payment Date Reached! Lock ready to open</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1">
                              <ShieldAlert className="w-3.5 h-3.5 text-[#00FF66]" />
                              <span>LOCKED • Cannot spend on shopping/food</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#A09CA8] font-bold text-[11px]">Unlocked for Fee Payment</span>
                      )}

                      <button
                        onClick={() => toggleLockStatus(lock.id)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all self-start sm:self-auto ${
                          lock.isLocked
                            ? 'bg-[#3E423F] hover:bg-[#4E524F] text-[#FAF9F6]'
                            : 'bg-[#00FF66] text-[#1A1C1A] hover:bg-[#00E059]'
                        }`}
                      >
                        {lock.isLocked ? 'Unlock Manually' : 'Re-Lock Amount'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overall Budget Overview Card */}
      <div className="bg-[#f5f5dc] rounded-2xl p-6 border border-[#e3e2e0] shadow-paper flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#60577f]">Total Monthly Target</span>
          <div className="text-3xl font-bold text-[#1a1c1a]">
            {formatCurrency(totalSpent, currency)} <span className="text-base font-medium text-[#79757e]">/ {formatCurrency(totalMonthlyTarget, currency)}</span>
          </div>
          <p className="text-xs text-[#48454e]">
            Remaining Allowance: <strong className="text-[#2e6b4e]">{formatCurrency(Math.max(0, totalMonthlyTarget - totalSpent), currency)}</strong>
          </p>
        </div>

        <div className="w-full md:w-64 bg-[#ffffff] p-4 rounded-xl border border-[#e3e2e0] space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[#1a1c1a]">Overall Cap Used</span>
            <span className="text-[#625981]">{Math.min(100, Math.round((totalSpent / totalMonthlyTarget) * 100))}%</span>
          </div>
          <div className="w-full h-3 bg-[#f4f3f1] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#625981] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((totalSpent / totalMonthlyTarget) * 100))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetCategories.map((cat) => {
          const spent = transactions
            .filter((t) => t.categoryId === cat.id && t.type === 'outflow')
            .reduce((sum, t) => sum + t.amount, 0);

          const remaining = cat.targetBudget - spent;
          const percentage = Math.round((spent / cat.targetBudget) * 100);
          const isOver = spent > cat.targetBudget;
          const isNear = percentage >= 85 && !isOver;

          return (
            <div 
              key={cat.id}
              className="bg-[#ffffff] rounded-2xl p-6 border border-[#e3e2e0] shadow-paper shadow-paper-hover space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f4f3f1] border border-[#e3e2e0] flex items-center justify-center shrink-0">
                      {renderCategoryIcon(cat.icon)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1a1c1a]">{cat.name}</h3>
                      <p className="text-[11px] text-[#79757e]">{cat.description || 'Category Cap'}</p>
                    </div>
                  </div>

                  {editingCategoryId !== cat.id && (
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-2 rounded-lg hover:bg-[#f4f3f1] text-[#79757e] transition-colors"
                      title="Edit Target Budget"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Amount display / inline edit */}
                <div className="my-4">
                  {editingCategoryId === cat.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f4f3f1] border border-[#625981] text-[#1a1c1a]"
                      />
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        className="px-3 py-1.5 bg-[#dcd0ff] text-[#1a1c1a] rounded-xl text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-[#1a1c1a]">
                        {formatCurrency(spent, currency)}
                      </span>
                      <span className="text-xs font-medium text-[#79757e]">
                        of {formatCurrency(cat.targetBudget, currency)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 bg-[#f4f3f1] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-[#ba1a1a]' : isNear ? 'bg-[#5e604d]' : 'bg-[#625981]'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className={isOver ? 'text-[#ba1a1a]' : 'text-[#79757e]'}>
                      {percentage}% used
                    </span>
                    <span className={isOver ? 'text-[#ba1a1a]' : 'text-[#2e6b4e]'}>
                      {isOver 
                        ? `${formatCurrency(Math.abs(remaining), currency)} over cap` 
                        : `${formatCurrency(remaining, currency)} remaining`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-3 border-t border-[#f4f3f1] flex items-center justify-between text-xs">
                {isOver ? (
                  <span className="inline-flex items-center text-[#ba1a1a] font-bold text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Budget exceeded
                  </span>
                ) : isNear ? (
                  <span className="inline-flex items-center text-[#5e604d] font-bold text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Near limit warning
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[#2e6b4e] font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Spending on track
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1c1a]/40 backdrop-blur-sm p-4">
          <div className="bg-[#ffffff] rounded-2xl w-full max-w-md border border-[#e3e2e0] p-6 shadow-modal space-y-4">
            <h3 className="text-lg font-bold text-[#1a1c1a]">Create Budget Category</h3>
            
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454e]">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Care & Vet"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#f4f3f1] border border-[#e3e2e0] focus:outline-none text-[#1a1c1a]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454e]">Monthly Target ({currency})</label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={newCatBudget}
                  onChange={(e) => setNewCatBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#f4f3f1] border border-[#e3e2e0] focus:outline-none text-[#1a1c1a]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454e]">Icon Symbol</label>
                <select
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#f4f3f1] border border-[#e3e2e0] focus:outline-none text-[#1a1c1a]"
                >
                  <option value="ShoppingBag">Shopping Bag</option>
                  <option value="Utensils">Dining / Food</option>
                  <option value="Home">Home / Living</option>
                  <option value="Car">Car / Transit</option>
                  <option value="Tv">Subscriptions</option>
                  <option value="Package">Personal Care</option>
                  <option value="HeartPulse">Wellness</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f4f3f1] text-[#48454e]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#dcd0ff] text-[#1a1c1a]"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Lock Modal (Parent / Fee Lock) */}
      {showAddLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1C1A]/60 backdrop-blur-sm p-4">
          <div className="bg-[#ffffff] rounded-3xl w-full max-w-md border border-[#E3E2E0] p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#F4F3F1] pb-3">
              <div className="w-9 h-9 rounded-2xl bg-[#00FF66]/20 text-[#1A1C1A] flex items-center justify-center font-black">
                🔒
              </div>
              <div>
                <h3 className="text-base font-black text-[#1A1C1A]">Lock Money for Essential Fees</h3>
                <p className="text-[11px] text-[#79757E]">Safeguard parent funds from accidental shopping or dining spending</p>
              </div>
            </div>
            
            <form onSubmit={handleCreateLock} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#48454E]">Fee Purpose / Lock Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. College Exam Fees, Hostel Rent"
                  value={newLockTitle}
                  onChange={(e) => setNewLockTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#F4F3F1] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-[#48454E]">Lock Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="15000"
                    value={newLockAmount}
                    onChange={(e) => setNewLockAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#F4F3F1] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-[#48454E]">Target Unlock Date</label>
                  <input
                    type="date"
                    required
                    value={newLockDate}
                    onChange={(e) => setNewLockDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#F4F3F1] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#48454E]">Category Tag</label>
                <select
                  value={newLockCategory}
                  onChange={(e) => setNewLockCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#F4F3F1] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A]"
                >
                  <option value="College Fees">College Fees</option>
                  <option value="Exam Fees">Exam Fees</option>
                  <option value="Hostel & Rent">Hostel & Rent</option>
                  <option value="Tuition">Tuition</option>
                  <option value="College Trip">College Trip</option>
                  <option value="Other Essential">Other Essential</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#48454E]">Notes / Payment Instructions (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sent by parents for semester exams on 15th Aug."
                  value={newLockNotes}
                  onChange={(e) => setNewLockNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F4F3F1] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A]"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#F4F3F1]">
                <button
                  type="button"
                  onClick={() => setShowAddLockModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F4F3F1] text-[#48454E] hover:bg-[#E9E8E5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#1A1C1A] text-[#00FF66] shadow-md hover:bg-[#2E312F] transition-all"
                >
                  🔒 Save & Lock Money
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
