import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Send, 
  User, 
  ReceiptText, 
  Target, 
  Settings,
  Wallet,
  Bell,
  Sparkles,
  Compass,
  Shield,
  Lock
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: (mode?: 'manual' | 'scan') => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onOpenStreakModal: () => void;
  unreadNotificationCount?: number;
  currency: string;
  user?: { name: string; email: string };
  onLogout?: () => void;
  streakDays?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenSettings,
  onOpenNotifications,
  onOpenStreakModal,
  unreadNotificationCount = 0,
  currency,
  user,
  onLogout,
  streakDays = 12,
}) => {
  const navItems: { id: string; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'pay', label: 'Pay', icon: Send },
    { id: 'vault', label: 'Dream Wallet', icon: Shield },
    { id: 'transactions', label: 'Ledger', icon: ReceiptText },
    { id: 'budgets', label: 'Budgets', icon: Target },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#E3E2E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Top-Left: FINOVA Logo & Brand Name */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-[#1A1C1A] text-[#FAF9F6] flex items-center justify-center relative shadow-md">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFD700] text-[#1A1C1A] font-extrabold text-[9px] flex items-center justify-center border-2 border-[#FAF9F6]">
                ₹
              </span>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#1A1C1A]">
                FINOVA
              </span>
              <span className="hidden sm:block text-[9px] font-extrabold text-[#79757E] tracking-wider uppercase">
                Smart Money Hub
              </span>
            </div>
          </div>

          {/* Nav Items - Desktop */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#F4F3F1] p-1.5 rounded-2xl border border-[#E3E2E0]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                    isActive
                      ? 'bg-[#ffffff] text-[#1A1C1A] shadow-sm'
                      : 'text-[#48454E] hover:text-[#1A1C1A]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#625981]' : 'text-[#79757E]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Notifications + Settings + Profile Icon */}
          <div className="flex items-center space-x-2">
            
            {/* Notification Bell Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl bg-[#1A1C1A] text-[#FAF9F6] hover:bg-[#2E312F] shadow-sm transition-all flex items-center justify-center group"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4 text-[#DCD0FF]" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#BA1A1A] text-[#ffffff] font-extrabold text-[9px] flex items-center justify-center border-2 border-[#FAF9F6] animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl bg-[#F4F3F1] hover:bg-[#E9E8E5] text-[#48454E] border border-[#E3E2E0] transition-colors flex items-center space-x-1.5 text-xs font-bold"
              title="Settings & Preferences"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">Settings</span>
            </button>

            {/* Profile Icon Button (Only Icon, no name text) */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                activeTab === 'profile'
                  ? 'bg-[#1A1C1A] text-[#FAF9F6] border-[#1A1C1A] shadow-sm'
                  : 'bg-[#F4F3F1] hover:bg-[#E9E8E5] text-[#1A1C1A] border-[#E3E2E0]'
              }`}
              title="User Profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center space-x-1 overflow-x-auto pb-3 pt-1 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#ffffff] text-[#1A1C1A] shadow-sm border border-[#E3E2E0]'
                    : 'text-[#48454E] bg-[#F4F3F1]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#625981]' : 'text-[#79757E]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
