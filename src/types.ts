export type TransactionType = 'inflow' | 'outflow';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  upiId?: string;
  isGuest?: boolean;
  avatarUrl?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  upiId: string;
  avatar: string;
  category: string;
  recentAmount?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  targetBudget: number;
  color: string;
  description?: string;
}

export interface Transaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  merchant?: string;
  paymentMethod: string;
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  upiId?: string;
  isAutoTracked?: boolean;
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly' | 'daily';
  nextDueDate?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  icon: string;
  autoMonthly?: number;
}

export interface Budget {
  categoryId: string;
  categoryName: string;
  monthlyLimit: number;
  currentSpent: number;
  icon: string;
  color: string;
}

export interface FinancialMetric {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRatePercentage: number;
  netChangeThisMonth: number;
}

export interface AIAdvisorMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  insights?: {
    title: string;
    description: string;
    type: 'positive' | 'warning' | 'neutral' | 'tip';
  }[];
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  transactionType: 'all' | 'inflow' | 'outflow';
  dateRange: 'all' | 'this_month' | 'last_month' | 'this_year';
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export interface FinancialFirewallRules {
  isEnabled: boolean;
  maxFoodPerDay: number;
  noPaymentsAfter10PM: boolean;
  maxSingleTxLimit: number;
  shoppingLockdown: boolean;
}

export interface VoiceSettings {
  isEnabled: boolean;
  speechRate: number;
  autoReadAlerts: boolean;
  hasMicPermission: boolean;
}

export interface InvisibleWalletState {
  goalTitle: string;
  goalTargetAmount: number;
  goalCurrentAmount: number;
  emergencyCurrentAmount: number;
  dailyBudget: number;
  autoSplitPercentage: number; // e.g. 50% goal, 50% emergency
}

export interface MoneyLockGoal {
  id: string;
  title: string;
  category: string; // e.g., 'Laptop', 'College Fees', 'Phone', 'Trip', 'Rent', 'Gift', 'Custom'
  icon: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  regularAmount: number; // e.g. 200
  regularInterval: 'daily' | 'weekly' | 'monthly';
  priority: number;
  isSecret?: boolean;
  savingStreakDays: number;
  lastContributionDate?: string;
  unlockHistory?: {
    id: string;
    amount: number;
    date: string;
    reason: string;
    impactDaysDelayed: number;
  }[];
}

export interface MoneyLockState {
  totalBalance: number;
  spendableAmount: number;
  lockedAmount: number;
  emergencyReserve: number;
  goals: MoneyLockGoal[];
}

export interface BudgetMoneyLock {
  id: string;
  title: string;
  amount: number;
  unlockDate: string;
  isLocked: boolean;
  notes?: string;
  category?: string;
}

