import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Wallet, 
  PieChart,
  Camera,
  Clock,
  BarChart2,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Receipt,
  Calendar,
  ShieldCheck,
  Zap,
  DollarSign
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Transaction, Category, Budget, MoneyLockState } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { MONTHLY_SPENDING_HISTORY } from '../data/mockData';
import { Lock, Shield, ArrowRight } from 'lucide-react';

interface DashboardOverviewProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  currency: string;
  user?: { name: string; email: string };
  moneyLockState?: MoneyLockState;
  onNavigate: (tab: string) => void;
  onOpenAddModal: (mode?: 'manual' | 'scan', preselectedCategoryId?: string) => void;
  onOpenStreakModal?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  transactions,
  categories,
  budgets,
  currency,
  user,
  moneyLockState = {
    totalBalance: 10000,
    spendableAmount: 3000,
    lockedAmount: 5000,
    emergencyReserve: 2000,
    goals: [],
  },
  onNavigate,
  onOpenAddModal,
  onOpenStreakModal,
}) => {
  // Expansion toggles for interactive drill-downs
  const [isPerDayExpanded, setIsPerDayExpanded] = useState(false);
  const [isWeeklyExpanded, setIsWeeklyExpanded] = useState(false);
  const [isMonthlyExpanded, setIsMonthlyExpanded] = useState(false);
  const [isRescueMode, setIsRescueMode] = useState(false);

  // Centralized Configuration & Calculations
  const dailyLimit = 200; // Daily Spending Limit
  const monthlyBudget = categories.filter((c) => c.targetBudget > 0).reduce((sum, c) => sum + c.targetBudget, 0) || 5000;
  const weeklyLimit = Math.round((monthlyBudget / 30) * 7);

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  // 1. TODAY'S EXPENSES CALCULATIONS
  const todayTransactions = transactions.filter(
    (t) => t.type === 'outflow' && t.date === todayStr
  );
  const todayOutflow = todayTransactions.reduce((s, t) => s + t.amount, 0);
  const todayRemaining = Math.max(0, dailyLimit - todayOutflow);
  const todayUtilizedPercent = Math.min(100, Math.round((todayOutflow / dailyLimit) * 100));

  // Yesterday's Outflow
  const yesterdayOutflow = transactions
    .filter((t) => t.type === 'outflow' && t.date === yesterdayStr)
    .reduce((s, t) => s + t.amount, 0);

  // Daily breakdown map
  const dailyBreakdown = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((acc, t) => {
      acc[t.date] = (acc[t.date] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedDates = Object.keys(dailyBreakdown)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 5);

  // 2. WEEKLY EXPENSES CALCULATIONS
  const weeklyTransactions = transactions.filter((t) => t.type === 'outflow');
  const weeklyOutflow = weeklyTransactions.reduce((s, t) => s + t.amount, 0);
  const weeklyRemaining = Math.max(0, weeklyLimit - weeklyOutflow);
  const weeklyAverage = Math.round(weeklyOutflow / 7);
  const weeklyUtilizedPercent = Math.min(100, Math.round((weeklyOutflow / weeklyLimit) * 100));

  // 3. MONTHLY EXPENSES & SAFE-TO-SPEND CALCULATIONS
  const monthlyTransactions = transactions.filter((t) => t.type === 'outflow');
  const totalOutflow = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
  const spent = totalOutflow;
  const remainingMonthly = Math.max(0, monthlyBudget - spent);
  const progressPercent = Math.min(100, Math.round((spent / monthlyBudget) * 100));

  // Safe-to-Spend Balance Calculation
  const daysLeftInMonth = 9; 
  const safeToSpendDaily = Math.max(0, Math.round(remainingMonthly / daysLeftInMonth));

  // Cumulative Budget Progress Chart Data
  const budgetChartData = [
    { day: 'Day 1', actual: Math.round(monthlyBudget * 0.05), targetPace: Math.round(monthlyBudget * 0.03), limit: monthlyBudget },
    { day: 'Day 5', actual: Math.round(monthlyBudget * 0.2), targetPace: Math.round(monthlyBudget * 0.16), limit: monthlyBudget },
    { day: 'Day 10', actual: Math.round(monthlyBudget * 0.35), targetPace: Math.round(monthlyBudget * 0.33), limit: monthlyBudget },
    { day: 'Day 15', actual: Math.round(monthlyBudget * 0.5), targetPace: Math.round(monthlyBudget * 0.5), limit: monthlyBudget },
    { day: 'Today', actual: spent, targetPace: Math.round(monthlyBudget * 0.6), limit: monthlyBudget },
    { day: 'End', actual: monthlyBudget, targetPace: monthlyBudget, limit: monthlyBudget },
  ];

  const userName = user?.name ? user.name.split(' ')[0] : 'Pooja';

  const quickCategories = [
    { id: 'cat-food', name: 'Food', emoji: '🍔' },
    { id: 'cat-travel', name: 'Travel', emoji: '🚌' },
    { id: 'cat-education', name: 'Education', emoji: '📚' },
    { id: 'cat-shopping', name: 'Shopping', emoji: '🛍️' },
    { id: 'cat-recharge', name: 'Recharge', emoji: '📱' },
    { id: 'cat-entertainment', name: 'Entertainment', emoji: '🎬' },
    { id: 'cat-health', name: 'Health', emoji: '💊' },
    { id: 'cat-others', name: 'Others', emoji: '📦' },
  ];

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1C1A] tracking-tight">
            Good Morning, {userName} 👋
          </h1>
          <p className="text-sm font-medium text-[#79757E] mt-0.5">
            Let's manage your money wisely today!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('pay')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black bg-[#DCD0FF] hover:bg-[#CCC0EE] text-[#1A1C1A] border border-[#B8A2FF] shadow-sm transition-all active:scale-95"
          >
            <span className="text-sm">💸</span>
            <span>Pay with UPI</span>
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#ffffff] hover:bg-[#FAF9F6] text-[#1A1C1A] border border-[#E3E2E0] shadow-sm transition-all"
          >
            <BarChart3 className="w-4 h-4 text-[#625981]" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => onOpenAddModal('manual')}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#ffffff] hover:bg-[#FAF9F6] text-[#1A1C1A] border border-[#E3E2E0] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-[#625981]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 1. PER-DAY CASH OVERVIEW & 2. WEEKLY OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Per-Day Cash Overview Card */}
        <div className="bg-[#ffffff] rounded-3xl p-6 border border-[#E3E2E0] shadow-paper space-y-4 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-[#F4F3F1]">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#DCD0FF] text-[#1A1C1A] flex items-center justify-center font-bold shadow-xs">
                <Clock className="w-4 h-4 text-[#60577F]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#1A1C1A]">Per-Day Cash Overview</h3>
                <span className="text-[10px] text-[#79757E] font-medium">Daily Limit: {formatCurrency(dailyLimit, currency)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsPerDayExpanded(!isPerDayExpanded)}
              className="flex items-center space-x-1 text-xs font-extrabold px-3 py-1.5 rounded-full bg-[#FAF9F6] hover:bg-[#DCD0FF]/40 border border-[#E3E2E0] text-[#1A1C1A] transition-all"
            >
              <span>{isPerDayExpanded ? 'Hide Details' : 'View Today Expenses'}</span>
              {isPerDayExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Today & Yesterday Metric Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E3E2E0] relative overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#79757E] uppercase block">Today Spent ({formatDate(todayStr)})</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${todayOutflow > dailyLimit ? 'bg-[#FFDAD6] text-[#BA1A1A]' : 'bg-[#E2F0D9] text-[#27AE60]'}`}>
                  {todayUtilizedPercent}% used
                </span>
              </div>
              <span className="text-xl font-black text-[#1A1C1A] mt-1 block">
                {formatCurrency(todayOutflow, currency)}
              </span>
              <span className="text-[10px] text-[#79757E] mt-0.5 block font-semibold">
                Limit: {formatCurrency(dailyLimit, currency)} • Left: <strong className="text-[#27AE60]">{formatCurrency(todayRemaining, currency)}</strong>
              </span>
            </div>

            <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E3E2E0]">
              <span className="text-[10px] font-bold text-[#79757E] uppercase block">Yesterday ({formatDate(yesterdayStr)})</span>
              <span className="text-xl font-black text-[#48454E] mt-1 block">
                {formatCurrency(yesterdayOutflow, currency)}
              </span>
              <span className="text-[10px] text-[#79757E] mt-0.5 block font-medium">
                Controlled Spending
              </span>
            </div>
          </div>

          {/* Progress Bar towards Today's Limit */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-[#48454E]">
              <span>Daily Limit Pace ({formatCurrency(todayOutflow, currency)} / {formatCurrency(dailyLimit, currency)})</span>
              <span className={todayOutflow > dailyLimit ? 'text-[#BA1A1A]' : 'text-[#27AE60]'}>
                {todayRemaining > 0 ? `${formatCurrency(todayRemaining, currency)} Safe Left` : 'Limit Exceeded'}
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#F4F3F1] rounded-full overflow-hidden border border-[#E3E2E0]">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${todayOutflow > dailyLimit ? 'bg-[#BA1A1A]' : 'bg-[#625981]'}`}
                style={{ width: `${todayUtilizedPercent}%` }}
              />
            </div>
          </div>

          {/* EXPANDABLE SECTION: All expenses done TODAY */}
          {isPerDayExpanded && (
            <div className="pt-3 border-t border-[#F4F3F1] space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#1A1C1A] flex items-center space-x-1.5">
                  <Receipt className="w-3.5 h-3.5 text-[#625981]" />
                  <span>All Expenses Logged Today ({todayTransactions.length})</span>
                </h4>
                <button
                  onClick={() => onOpenAddModal('manual')}
                  className="text-[10px] font-extrabold text-[#60577F] bg-[#DCD0FF] px-2.5 py-1 rounded-lg hover:bg-[#CCC0EE] transition-all"
                >
                  + Add Today Expense
                </button>
              </div>

              {todayTransactions.length === 0 ? (
                <div className="p-4 bg-[#FAF9F6] rounded-2xl text-center text-xs text-[#79757E] border border-[#E3E2E0]">
                  🎉 No expenses recorded today yet! Tap "+ Add Today Expense" to log your first payment.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {todayTransactions.map((tx) => {
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    return (
                      <div
                        key={tx.id}
                        className="p-3 bg-[#FAF9F6] hover:bg-[#F4F3F1] rounded-2xl border border-[#E3E2E0] flex items-center justify-between transition-colors text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl p-1.5 bg-[#ffffff] rounded-xl border border-[#E3E2E0]">
                            {cat?.icon || '🍔'}
                          </span>
                          <div>
                            <span className="font-extrabold text-[#1A1C1A] block">{tx.title}</span>
                            <div className="flex items-center space-x-2 text-[10px] text-[#79757E]">
                              <span className="font-bold text-[#60577F]">{tx.categoryName}</span>
                              {tx.merchant && <span>• @ {tx.merchant}</span>}
                              {tx.paymentMethod && <span className="bg-[#ffffff] px-1.5 py-0.5 rounded font-bold">{tx.paymentMethod}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-sm text-[#1A1C1A] block">
                            -{formatCurrency(tx.amount, currency)}
                          </span>
                          <span className="text-[9px] text-[#27AE60] font-bold">Logged Today</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* 2. Weekly Overview Card */}
        <div className="bg-[#ffffff] rounded-3xl p-6 border border-[#E3E2E0] shadow-paper space-y-4 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-[#F4F3F1]">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#F5F5DC] text-[#1A1C1A] flex items-center justify-center font-bold border border-[#E3E2E0] shadow-xs">
                <BarChart2 className="w-4 h-4 text-[#60577F]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#1A1C1A]">Weekly Overview</h3>
                <span className="text-[10px] text-[#79757E] font-medium">7-Day Budget: {formatCurrency(weeklyLimit, currency)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsWeeklyExpanded(!isWeeklyExpanded)}
              className="flex items-center space-x-1 text-xs font-extrabold px-3 py-1.5 rounded-full bg-[#FAF9F6] hover:bg-[#F5F5DC] border border-[#E3E2E0] text-[#1A1C1A] transition-all"
            >
              <span>{isWeeklyExpanded ? 'Hide Details' : 'View Week Breakdown'}</span>
              {isWeeklyExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="bg-[#F5F5DC] p-4 rounded-2xl border border-[#E3E2E0] flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-[#79757E] uppercase block">Total Spent This Week</span>
              <span className="text-2xl font-black text-[#1A1C1A]">
                {formatCurrency(weeklyOutflow, currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#27AE60] block">✓ {weeklyUtilizedPercent}% Utilized</span>
              <span className="text-[11px] font-semibold text-[#48454E]">Avg: {formatCurrency(weeklyAverage, currency)}/day</span>
            </div>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            <div className="flex justify-between font-bold text-[#48454E]">
              <span>Weekly Limit Pace</span>
              <span className="text-[#60577F]">Left: {formatCurrency(weeklyRemaining, currency)}</span>
            </div>
            <div className="w-full h-2.5 bg-[#F4F3F1] rounded-full overflow-hidden border border-[#E3E2E0]">
              <div 
                className="h-full bg-[#625981] rounded-full transition-all duration-500"
                style={{ width: `${weeklyUtilizedPercent}%` }}
              />
            </div>
          </div>

          {/* EXPANDABLE SECTION: Weekly Breakdown & Daily Spending */}
          {isWeeklyExpanded && (
            <div className="pt-3 border-t border-[#F4F3F1] space-y-3 animate-fade-in">
              <h4 className="text-xs font-extrabold text-[#1A1C1A] flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#625981]" />
                <span>Daily Expenses Spent This Week</span>
              </h4>

              <div className="space-y-1.5">
                {sortedDates.map((dateKey) => {
                  const daySpent = dailyBreakdown[dateKey];
                  const dayTxCount = transactions.filter((t) => t.type === 'outflow' && t.date === dateKey).length;
                  return (
                    <div key={dateKey} className="flex justify-between items-center text-xs py-2 px-3 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-[#1A1C1A]">
                      <div>
                        <span className="font-extrabold text-[#1A1C1A] block">{formatDate(dateKey)}</span>
                        <span className="text-[10px] text-[#79757E] font-medium">{dayTxCount} transaction(s)</span>
                      </div>
                      <span className="font-black text-sm text-[#60577F]">{formatCurrency(daySpent, currency)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 3. MONTHLY CASH OVERVIEW, SAFE-TO-SPEND CALCULATOR & BUDGET PROGRESS CHART */}
      <div className="bg-[#1A1C1A] text-[#FAF9F6] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
        
        {/* Backdrop subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#DCD0FF]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#DCD0FF]/20 flex items-center justify-center text-[#DCD0FF] border border-[#DCD0FF]/30">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#DCD0FF]">
                Monthly Cash Overview & Safe-To-Spend
              </h3>
              <span className="text-[10px] text-[#A09CA8] font-semibold">July 2026 Monthly Budget & Spending Engine</span>
            </div>
          </div>

          <button
            onClick={() => setIsMonthlyExpanded(!isMonthlyExpanded)}
            className="flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#3E423F] hover:bg-[#4E524F] text-[#FAF9F6] border border-[#4E524F] transition-all"
          >
            <span>{isMonthlyExpanded ? 'Hide Chart & Analysis' : 'Expand Monthly Analysis'}</span>
            {isMonthlyExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#DCD0FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#DCD0FF]" />}
          </button>
        </div>

        {/* Top Key Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-[#2E312F]">
          <div className="bg-[#2E312F]/60 p-3.5 rounded-2xl border border-[#3E423F]">
            <span className="text-[10px] font-bold text-[#A09CA8] uppercase block">Total Monthly Budget</span>
            <span className="text-lg sm:text-2xl font-black text-[#FAF9F6] mt-0.5 block">
              {formatCurrency(monthlyBudget, currency)}
            </span>
          </div>

          <div className="bg-[#2E312F]/60 p-3.5 rounded-2xl border border-[#3E423F]">
            <span className="text-[10px] font-bold text-[#FFADAD] uppercase block">Total Spent So Far</span>
            <span className="text-lg sm:text-2xl font-black text-[#FF8585] mt-0.5 block">
              {formatCurrency(spent, currency)}
            </span>
          </div>

          <div className="bg-[#2E312F]/60 p-3.5 rounded-2xl border border-[#3E423F]">
            <span className="text-[10px] font-bold text-[#C0EBA6] uppercase block">Remaining Balance</span>
            <span className="text-lg sm:text-2xl font-black text-[#70E000] mt-0.5 block">
              {formatCurrency(remainingMonthly, currency)}
            </span>
          </div>

          {/* SAFE-TO-SPEND DAILY PACE CARD */}
          <div className="bg-[#DCD0FF]/15 p-3.5 rounded-2xl border border-[#DCD0FF]/40 relative overflow-hidden">
            <span className="text-[10px] font-black text-[#DCD0FF] uppercase block flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#FFD700]" />
              Safe-To-Spend Daily
            </span>
            <span className="text-lg sm:text-2xl font-black text-[#FFD700] mt-0.5 block">
              {formatCurrency(safeToSpendDaily, currency)} <span className="text-[11px] text-[#DCD0FF] font-semibold">/ day</span>
            </span>
            <span className="text-[9px] text-[#A09CA8] font-bold block mt-0.5">
              For remaining {daysLeftInMonth} days of July
            </span>
          </div>
        </div>

        {/* Budget Utilized Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-[#A09CA8]">Monthly Budget Utilization Pace</span>
            <span className="text-[#DCD0FF]">{progressPercent}% Used ({formatCurrency(spent, currency)} of {formatCurrency(monthlyBudget, currency)})</span>
          </div>
          <div className="w-full h-3.5 bg-[#2E312F] rounded-full overflow-hidden p-0.5 border border-[#3E423F]">
            <div 
              className="h-full bg-gradient-to-r from-[#DCD0FF] via-[#B8A2FF] to-[#70E000] rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* EXPANDABLE SECTION: MONTHLY BUDGET PROGRESS CHART & DEEP DIVE */}
        {isMonthlyExpanded && (
          <div className="pt-6 border-t border-[#2E312F] space-y-6 animate-fade-in">
            
            {/* Chart Title & Explanation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-extrabold text-[#FAF9F6] flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#DCD0FF]" />
                  <span>Monthly Budget Progress & Safe-To-Spend Trajectory</span>
                </h4>
                <p className="text-xs text-[#A09CA8]">
                  Compares actual cumulative spending vs ideal linear target pace ({formatCurrency(15000 / 31, currency)}/day)
                </p>
              </div>

              <div className="flex items-center space-x-4 text-[11px] font-bold">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#DCD0FF]" />
                  <span className="text-[#FAF9F6]">Actual Spent</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#70E000]" />
                  <span className="text-[#A09CA8]">Target Pace</span>
                </div>
              </div>
            </div>

            {/* Recharts Cumulative Budget Progress Chart */}
            <div className="h-64 w-full bg-[#252826] p-4 rounded-2xl border border-[#3E423F]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={budgetChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#A09CA8', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A09CA8', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1C1A', borderRadius: '12px', borderColor: '#3E423F', color: '#FAF9F6' }}
                    formatter={(value: any, name: string) => [
                      `₹${value}`, 
                      name === 'actual' ? 'Actual Cumulative Spent' : 'Ideal Target Pace'
                    ]}
                  />
                  <Area type="monotone" dataKey="actual" stroke="#DCD0FF" strokeWidth={3} fill="#DCD0FF" fillOpacity={0.25} />
                  <Area type="monotone" dataKey="targetPace" stroke="#70E000" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Smart Safe-To-Spend Insight Box */}
            <div className="p-4 bg-[#2E312F] rounded-2xl border border-[#3E423F] flex items-start space-x-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-[#70E000] shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-[#FAF9F6] block text-sm">
                  Safe-To-Spend Rule: {formatCurrency(safeToSpendDaily, currency)} per day
                </span>
                <p className="text-[#A09CA8] mt-1 leading-relaxed">
                  Based on your current spending of {formatCurrency(spent, currency)}, you have {formatCurrency(remainingMonthly, currency)} remaining for July. By spending a maximum of <strong>{formatCurrency(safeToSpendDaily, currency)}/day</strong> for the remaining {daysLeftInMonth} days, you will comfortably hit your budget without overspending!
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Quick Add Expense & Categories Grid */}
      <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#E3E2E0] shadow-paper space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1A1C1A]">Quick Add Expense</h3>
            <p className="text-xs text-[#79757E]">Tap any category to log instantly</p>
          </div>
          
          <button
            onClick={() => onOpenAddModal('manual')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#DCD0FF] hover:bg-[#CCC0EE] text-[#1A1C1A] text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#625981]" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Category Large Icon Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onOpenAddModal('manual', cat.id)}
              className="p-3.5 rounded-2xl bg-[#FAF9F6] hover:bg-[#DCD0FF]/30 border border-[#E3E2E0] hover:border-[#625981] transition-all flex items-center space-x-3 text-left group active:scale-95 shadow-sm"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {cat.emoji}
              </span>
              <div>
                <span className="text-xs font-bold text-[#1A1C1A] block">{cat.name}</span>
                <span className="text-[10px] text-[#79757E] font-medium">+ Quick Log</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Cash Flow Trends & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Transactions List (2 columns) */}
        <div className="lg:col-span-2 bg-[#ffffff] rounded-2xl p-6 border border-[#E3E2E0] shadow-paper space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#F4F3F1]">
            <div>
              <h3 className="text-base font-bold text-[#1A1C1A]">Recent Transactions</h3>
              <p className="text-xs text-[#79757E]">Latest activity recorded in Finova</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-bold text-[#625981] hover:text-[#1A1C1A] flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#F4F3F1]">
            {recentTransactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const emoji = cat?.icon || '📦';
              const isExpense = tx.type === 'outflow';

              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-[#FAF9F6] px-2 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#F4F3F1] border border-[#E3E2E0] flex items-center justify-center text-xl shrink-0">
                      {emoji}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#1A1C1A]">{tx.title}</h4>
                      <div className="flex items-center space-x-2 text-[11px] text-[#79757E] mt-0.5">
                        <span className="font-semibold text-[#625981]">{tx.categoryName}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                        {tx.paymentMethod && (
                          <>
                            <span>•</span>
                            <span className="bg-[#F4F3F1] px-1.5 py-0.5 rounded text-[10px] font-bold text-[#48454E]">
                              {tx.paymentMethod}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-sm font-extrabold ${isExpense ? 'text-[#1A1C1A]' : 'text-[#219653]'}`}>
                      {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Smart Tip Banner & Analytics */}
        <div className="space-y-6">
          
          {/* Quick Chart */}
          <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#E3E2E0] shadow-paper space-y-3">
            <h3 className="text-sm font-bold text-[#1A1C1A]">Expense Trajectory</h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_SPENDING_HISTORY} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#79757e', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#79757e', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FAF9F6', borderRadius: '12px', borderColor: '#E3E2E0' }}
                    formatter={(value: any) => [`₹${value}`, 'Expenses']}
                  />
                  <Area type="monotone" dataKey="expenses" stroke="#625981" strokeWidth={2} fill="#DCD0FF" fillOpacity={0.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
