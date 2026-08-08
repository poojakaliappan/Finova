import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetsView } from './components/BudgetsView';
import { SavingsVaultsView } from './components/SavingsVaultsView';
import { AIAdvisorView } from './components/AIAdvisorView';
import { AnalyticsView } from './components/AnalyticsView';
import { SmartPayView } from './components/SmartPayView';
import { ProfileView } from './components/ProfileView';
import { SettingsModal } from './components/SettingsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SavingsStreakModal } from './components/SavingsStreakModal';
import { DecisionSimulatorView } from './components/DecisionSimulatorView';
import { InvisibleWalletView } from './components/InvisibleWalletView';
import { VoiceAssistance } from './components/VoiceAssistance';
import { FloatingFinovaAiWidget } from './components/FloatingFinovaAiWidget';
import { useDailyBudgetNotification } from './hooks/useDailyBudgetNotification';

import { Transaction, Category, SavingsGoal, Budget, UserProfile, FinancialFirewallRules, VoiceSettings, InvisibleWalletState, MoneyLockState } from './types';
import { INITIAL_CATEGORIES, INITIAL_TRANSACTIONS, INITIAL_SAVINGS_GOALS, DEMO_USERS } from './data/mockData';

export default function App() {
  // App Flow Screen State: 'splash' -> 'onboarding' -> 'app'
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'onboarding' | 'app'>('splash');

  // User session state
  const [user, setUser] = useState<UserProfile>(() => {
    const savedUser = localStorage.getItem('finova_user');
    return savedUser ? JSON.parse(savedUser) : DEMO_USERS[0];
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Currency State - default INR
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('spendwise_currency') || 'INR';
  });

  // Financial Firewall Rules State
  const [firewallRules, setFirewallRules] = useState<FinancialFirewallRules>(() => {
    const saved = localStorage.getItem('finova_firewall_rules');
    return saved ? JSON.parse(saved) : {
      isEnabled: true,
      maxFoodPerDay: 300,
      noPaymentsAfter10PM: true,
      maxSingleTxLimit: 1000,
      shoppingLockdown: false,
    };
  });

  // AI Voice Settings State
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('finova_voice_settings');
    return saved ? JSON.parse(saved) : {
      isEnabled: true,
      speechRate: 1.0,
      autoReadAlerts: true,
      hasMicPermission: false,
    };
  });

  // Invisible Goal Wallet State
  const [invisibleWalletState, setInvisibleWalletState] = useState<InvisibleWalletState>(() => {
    const saved = localStorage.getItem('finova_invisible_wallet');
    return saved ? JSON.parse(saved) : {
      goalTitle: 'MacBook Pro / Gaming Laptop',
      goalTargetAmount: 50000,
      goalCurrentAmount: 12500,
      emergencyCurrentAmount: 4800,
      dailyBudget: 500,
      autoSplitPercentage: 50,
    };
  });

  // Money Lock State
  const [moneyLockState, setMoneyLockState] = useState<MoneyLockState>(() => {
    const saved = localStorage.getItem('finova_money_lock');
    return saved ? JSON.parse(saved) : {
      totalBalance: 10000,
      spendableAmount: 3000,
      lockedAmount: 5000,
      emergencyReserve: 2000,
      goals: [
        {
          id: '1',
          title: 'MacBook Pro / Laptop',
          targetAmount: 50000,
          currentLocked: 5000,
          icon: '💻',
          lockType: 'hard',
          targetDate: '2026-12-31',
        },
      ],
    };
  });

  // Ledger Data State with Persistence
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('spendwise_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Strict User Data Isolation: Unique storage key per user
  const userStorageKey = `finova_transactions_${user.email || user.id}`;

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(userStorageKey);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Reload transactions whenever active user changes
  useEffect(() => {
    const saved = localStorage.getItem(userStorageKey);
    if (saved) {
      setTransactions(JSON.parse(saved));
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
    }
  }, [user.email, user.id]);

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('spendwise_goals');
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalMode, setAddModalMode] = useState<'manual' | 'scan'>('manual');
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<string | undefined>();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('spendwise_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(userStorageKey, JSON.stringify(transactions));
  }, [transactions, userStorageKey]);

  useEffect(() => {
    localStorage.setItem('spendwise_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('spendwise_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('finova_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('finova_firewall_rules', JSON.stringify(firewallRules));
  }, [firewallRules]);

  useEffect(() => {
    localStorage.setItem('finova_voice_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  useEffect(() => {
    localStorage.setItem('finova_invisible_wallet', JSON.stringify(invisibleWalletState));
  }, [invisibleWalletState]);

  useEffect(() => {
    localStorage.setItem('finova_money_lock', JSON.stringify(moneyLockState));
  }, [moneyLockState]);

  // Listen for global custom tab navigation events
  useEffect(() => {
    const handleNavigateEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener('navigate_tab', handleNavigateEvent);
    return () => window.removeEventListener('navigate_tab', handleNavigateEvent);
  }, []);

  // Derived Budgets
  const budgets: Budget[] = categories
    .filter((c) => c.targetBudget > 0)
    .map((c) => {
      const spent = transactions
        .filter((t) => t.categoryId === c.id && t.type === 'outflow')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        categoryId: c.id,
        categoryName: c.name,
        monthlyLimit: c.targetBudget,
        currentSpent: spent,
        icon: c.icon,
        color: c.color,
      };
    });

  // Today & Monthly spent calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySpent = transactions
    .filter((t) => t.type === 'outflow' && t.date === todayStr)
    .reduce((s, t) => s + t.amount, 0);

  const weeklySpent = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((s, t) => s + t.amount, 0);

  const monthlySpent = transactions
    .filter((t) => t.type === 'outflow')
    .reduce((s, t) => s + t.amount, 0);

  const monthlyBudget = categories.reduce((sum, c) => sum + (c.targetBudget || 0), 0) || 5000;

  // Hook comparing todaySpent against daily budget limit (₹500), triggering browser notification if >= 80%
  useDailyBudgetNotification({
    todaySpent,
    dailyLimit: 500,
    currency: '₹',
  });

  // Handle Onboarding Completion
  const handleOnboardingComplete = (newUser: UserProfile) => {
    setUser(newUser);
    setCurrentScreen('app');
  };

  // Transaction Actions
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id'>,
    editId?: string
  ) => {
    if (editId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editId ? { ...txData, id: editId } : t))
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setAddModalMode('manual');
    setPreselectedCategoryId(tx.categoryId);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModal = (mode: 'manual' | 'scan' = 'manual', preselectedCatId?: string) => {
    setEditingTransaction(null);
    setAddModalMode(mode);
    setPreselectedCategoryId(preselectedCatId);
    setIsAddModalOpen(true);
  };

  // Category Actions
  const handleUpdateCategoryBudget = (categoryId: string, newTarget: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, targetBudget: newTarget } : c))
    );
  };

  const handleAddCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // Savings Goal Actions
  const handleAddGoalFunds = (goalId: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) }
          : g
      )
    );
  };

  const handleAddSavingsGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  // Reset & Clear Data
  const handleResetSeedData = () => {
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
  };

  const handleClearData = () => {
    setTransactions([]);
  };

  // Render Splash Screen
  if (currentScreen === 'splash') {
    return <SplashScreen onFinish={() => setCurrentScreen('onboarding')} />;
  }

  // Render Onboarding Screen
  if (currentScreen === 'onboarding') {
    return <OnboardingScreen onLoginSuccess={handleOnboardingComplete} />;
  }

  // Render Main Application
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] font-sans flex flex-col selection:bg-[#dcd0ff] selection:text-[#60577f]">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenStreakModal={() => setIsStreakModalOpen(true)}
        unreadNotificationCount={3}
        currency={currency}
        user={user}
        onLogout={() => setCurrentScreen('onboarding')}
        streakDays={12}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            transactions={transactions}
            categories={categories}
            budgets={budgets}
            currency={currency}
            user={user}
            moneyLockState={moneyLockState}
            onNavigate={setActiveTab}
            onOpenAddModal={handleOpenAddModal}
            onOpenStreakModal={() => setIsStreakModalOpen(true)}
          />
        )}

        {activeTab === 'simulator' && (
          <DecisionSimulatorView
            savingsGoals={savingsGoals}
            onUpdateGoals={setSavingsGoals}
            onAddTransaction={(tx) => handleSaveTransaction(tx)}
            currency={currency}
          />
        )}

        {activeTab === 'pay' && (
          <SmartPayView
            categories={categories}
            transactions={transactions}
            currency={currency}
            onAddTransaction={(tx) => handleSaveTransaction(tx)}
            onNavigate={setActiveTab}
            firewallRules={firewallRules}
            voiceSettings={voiceSettings}
            invisibleWalletState={invisibleWalletState}
            moneyLockState={moneyLockState}
          />
        )}

        {activeTab === 'vault' && (
          <InvisibleWalletView
            currency={currency}
            walletState={invisibleWalletState}
            onUpdateWalletState={(newState) => setInvisibleWalletState((prev) => ({ ...prev, ...newState }))}
            todaySpent={todaySpent}
            dailyLimit={invisibleWalletState.dailyBudget || 500}
            onTriggerVoiceAlert={(text) => {
              if (voiceSettings.isEnabled && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = voiceSettings.speechRate || 1;
                window.speechSynthesis.speak(utterance);
              }
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={user}
            onSwitchUser={(newUser) => {
              setUser(newUser);
              localStorage.setItem('finova_user', JSON.stringify(newUser));
            }}
            onLogout={() => setCurrentScreen('onboarding')}
            transactionsCount={transactions.length}
            totalSpent={transactions.filter(t => t.type === 'outflow').reduce((s, t) => s + t.amount, 0)}
            currency={currency}
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem('finova_user', JSON.stringify(updated));
            }}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            categories={categories}
            currency={currency}
            onOpenAddModal={handleOpenAddModal}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            categories={categories}
            transactions={transactions}
            currency={currency}
            onUpdateCategoryBudget={handleUpdateCategoryBudget}
            onAddCategory={handleAddCategory}
          />
        )}

        {activeTab === 'vaults' && (
          <SavingsVaultsView
            goals={savingsGoals}
            currency={currency}
            onAddFunds={handleAddGoalFunds}
            onAddGoal={handleAddSavingsGoal}
          />
        )}

        {activeTab === 'advisor' && (
          <AIAdvisorView
            transactions={transactions}
            categories={categories}
            currency={currency}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            transactions={transactions}
            categories={categories}
            currency={currency}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e3e2e0] bg-[#faf9f6] py-6 mt-auto text-center text-xs text-[#79757e]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Finova • Track Smart. Spend Better.</span>
          <span className="font-semibold text-[#60577f]">Pay + Auto-Track + Smart Personal Finance</span>
        </div>
      </footer>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTransaction}
        categories={categories}
        editingTransaction={editingTransaction}
        initialMode={addModalMode}
        preselectedCategoryId={preselectedCategoryId}
        transactions={transactions}
      />

      {/* Settings Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currency={currency}
        onSelectCurrency={setCurrency}
        onResetSeedData={handleResetSeedData}
        onClearData={handleClearData}
        firewallRules={firewallRules}
        onUpdateFirewallRules={(newRules) => setFirewallRules((prev) => ({ ...prev, ...newRules }))}
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={(newVoice) => setVoiceSettings((prev) => ({ ...prev, ...newVoice }))}
        invisibleWalletState={invisibleWalletState}
        onUpdateInvisibleWalletState={(newState) => setInvisibleWalletState((prev) => ({ ...prev, ...newState }))}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        currency={currency}
        todaySpent={todaySpent}
        dailyLimit={500}
        weeklySpent={weeklySpent}
        weeklyLimit={3500}
      />

      {/* Savings Streak & Rewards Modal */}
      <SavingsStreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        currency={currency}
        todaySpent={todaySpent}
        dailyLimit={500}
        monthlyBudget={monthlyBudget}
        monthlySpent={monthlySpent}
      />

      {/* Floating FINOVA AI Circular Widget with Blinking Light Border */}
      <FloatingFinovaAiWidget
        onOpenAdvisor={() => setActiveTab('advisor')}
        isActive={activeTab === 'advisor'}
      />

      {/* Voice Assistance Module */}
      <VoiceAssistance
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={(newSettings) => setVoiceSettings((prev) => ({ ...prev, ...newSettings }))}
        todaySpent={todaySpent}
        dailyLimit={invisibleWalletState.dailyBudget || 500}
        currency={currency}
      />

    </div>
  );
}
