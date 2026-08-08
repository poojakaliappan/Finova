import { Category, Transaction, SavingsGoal, Contact, UserProfile } from '../types';

export const INITIAL_CONTACTS: Contact[] = [
  { id: 'c1', name: 'ABC Restaurant', phone: '+91 9876543210', upiId: 'abcrestaurant@upi', avatar: '🍔', category: 'cat-food', recentAmount: 350 },
  { id: 'c2', name: 'Rahul Sharma', phone: '+91 9812345678', upiId: 'rahul.sharma@paytm', avatar: '👨‍💻', category: 'cat-others', recentAmount: 200 },
  { id: 'c3', name: 'Priya Verma', phone: '+91 9988776655', upiId: 'priya.verma@okaxis', avatar: '👩‍🎨', category: 'cat-shopping', recentAmount: 500 },
  { id: 'c4', name: 'Fresh Mart Grocery', phone: '+91 9765432109', upiId: 'freshmart@ybl', avatar: '🛒', category: 'cat-food', recentAmount: 450 },
  { id: 'c5', name: 'City Metro Transit', phone: '+91 9123456780', upiId: 'metrotransit@sbi', avatar: '🚇', category: 'cat-travel', recentAmount: 60 },
  { id: 'c6', name: 'BookLand Store', phone: '+91 9001122334', upiId: 'bookland@icici', avatar: '📚', category: 'cat-education', recentAmount: 250 },
];

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-pooja',
    name: 'Pooja Kaliappan',
    email: 'poojakaliappan490@gmail.com',
    phone: '+91 98765 43210',
    upiId: 'pooja@finova',
    isGuest: false,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'user-rahul',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    phone: '+91 98123 45678',
    upiId: 'rahul@finova',
    isGuest: false,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food', icon: '🍔', targetBudget: 1500, color: '#FF7A00', description: 'Groceries, lunch, snacks & dining' },
  { id: 'cat-travel', name: 'Travel', icon: '🚌', targetBudget: 1000, color: '#2F80ED', description: 'Bus, metro, fuel & cab fares' },
  { id: 'cat-education', name: 'Education', icon: '📚', targetBudget: 1000, color: '#9B51E0', description: 'Books, notebooks, courses & fees' },
  { id: 'cat-shopping', name: 'Shopping', icon: '🛍️', targetBudget: 500, color: '#EB5757', description: 'Clothes, electronics & personal items' },
  { id: 'cat-entertainment', name: 'Entertainment', icon: '🎬', targetBudget: 500, color: '#F2994A', description: 'Movies, streaming & outings' },
  { id: 'cat-others', name: 'Others', icon: '📦', targetBudget: 500, color: '#828282', description: 'Miscellaneous expenses' },
  { id: 'cat-income', name: 'Income', icon: '💰', targetBudget: 0, color: '#219653', description: 'Salary, allowance & freelance' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-laptop',
    title: 'New Laptop Mission',
    targetAmount: 50000,
    currentAmount: 21000,
    targetDate: '2026-12-20',
    category: 'Education & Tech',
    icon: '💻',
    autoMonthly: 4000
  },
  {
    id: 'goal-vacation',
    title: 'Dream Vacation Trip',
    targetAmount: 20000,
    currentAmount: 8500,
    targetDate: '2026-10-15',
    category: 'Travel',
    icon: '✈️',
    autoMonthly: 2000
  },
  {
    id: 'goal-course',
    title: 'AI Upskilling Course',
    targetAmount: 10000,
    currentAmount: 6500,
    targetDate: '2026-09-01',
    category: 'Education',
    icon: '🎓',
    autoMonthly: 1500
  }
];

export const MONTHLY_SPENDING_HISTORY = [
  { month: 'Feb', income: 6000, expenses: 3100, savings: 2900 },
  { month: 'Mar', income: 5500, expenses: 2900, savings: 2600 },
  { month: 'Apr', income: 5000, expenses: 3400, savings: 1600 },
  { month: 'May', income: 5200, expenses: 3000, savings: 2200 },
  { month: 'Jun', income: 5000, expenses: 3150, savings: 1850 },
  { month: 'Jul', income: 5000, expenses: 3250, savings: 1750 },
];
