import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  LogOut, 
  Mail, 
  Phone, 
  Wallet, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Plus, 
  KeyRound,
  Lock,
  ArrowRight,
  Camera,
  Edit3,
  Save,
  Building2,
  BadgeIndianRupee
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { formatCurrency } from '../utils/formatters';

interface ProfileViewProps {
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  onLogout: () => void;
  transactionsCount: number;
  totalSpent: number;
  currency: string;
  onUpdateUser?: (updatedUser: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onSwitchUser,
  onLogout,
  transactionsCount,
  totalSpent,
  currency,
  onUpdateUser,
}) => {
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  // Editable Profile General Details
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name || 'Pooja Kaliappan');
  const [email, setEmail] = useState(currentUser.email || 'poojakaliappan490@gmail.com');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [upiId, setUpiId] = useState(currentUser.upiId || 'pooja@finova');
  const [college, setCollege] = useState(currentUser.collegeOrOrganization || 'College of Engineering / Tech');
  const [monthlyIncome, setMonthlyIncome] = useState<string>(currentUser.monthlyIncome ? String(currentUser.monthlyIncome) : '15000');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.avatarUrl || '');

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        if (onUpdateUser) {
          onUpdateUser({
            ...currentUser,
            avatarUrl: result,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGeneralDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name,
      email,
      phone,
      upiId,
      collegeOrOrganization: college,
      monthlyIncome: parseFloat(monthlyIncome) || 15000,
      avatarUrl,
    };

    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setIsEditing(false);
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName) return;

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: newUserName,
      email: newUserEmail || `${newUserName.toLowerCase().replace(/\s+/g, '.')}@finova.app`,
      upiId: `${newUserName.toLowerCase().replace(/\s+/g, '')}@finova`,
      isGuest: false,
    };

    onSwitchUser(newUser);
    setIsAddingUser(false);
    setShowAccountSwitcher(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header Profile Card */}
      <div className="bg-[#1A1C1A] text-[#FAF9F6] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#DCD0FF]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-center space-x-4">
            {/* Profile Photo Avatar with Upload Trigger */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-3xl bg-[#DCD0FF] text-[#1A1C1A] flex items-center justify-center text-3xl font-black shadow-md border-2 border-[#FAF9F6] overflow-hidden">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>

              <label className="absolute -bottom-1 -right-1 p-1.5 bg-[#ffffff] text-[#1A1C1A] hover:bg-[#DCD0FF] rounded-xl cursor-pointer shadow-md transition-all">
                <Camera className="w-3.5 h-3.5" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#3E423F] text-[#FAF9F6] text-[10px] font-extrabold uppercase">
                  {currentUser.isGuest ? 'Guest Account' : 'Verified User'}
                </span>
              </div>
              <p className="text-xs text-[#A09CA8] mt-0.5">{currentUser.email}</p>
              <span className="text-[11px] font-bold text-[#DCD0FF] block mt-1">
                UPI ID: {currentUser.upiId || 'pooja@finova'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-stretch sm:self-auto">
            <button
              onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#2E312F] hover:bg-[#3E423F] text-[#FAF9F6] border border-[#3E423F] text-xs font-bold transition-all flex items-center justify-center space-x-2"
            >
              <Users className="w-4 h-4 text-[#DCD0FF]" />
              <span>Switch User</span>
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-[#FF4D4D]/20 hover:bg-[#FF4D4D]/30 text-[#FF8585] text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#2E312F]">
          <div>
            <span className="text-[10px] font-bold text-[#A09CA8] uppercase block">Total Expenses</span>
            <span className="text-base sm:text-xl font-bold text-[#FAF9F6]">
              {formatCurrency(totalSpent, currency)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#A09CA8] uppercase block">Transactions</span>
            <span className="text-base sm:text-xl font-bold text-[#FAF9F6]">
              {transactionsCount} Records
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#A09CA8] uppercase block">Data Security</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#27AE60] flex items-center space-x-1 mt-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Isolated</span>
            </span>
          </div>
        </div>

      </div>

      {/* 👤 GENERAL DETAILS CARD (User Required App Data) */}
      <div className="bg-[#ffffff] rounded-3xl p-6 sm:p-8 border border-[#E3E2E0] shadow-paper space-y-6">
        <div className="flex items-center justify-between border-b border-[#F4F3F1] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCD0FF] text-[#1A1C1A] flex items-center justify-center font-bold">
              <User className="w-5 h-5 text-[#625981]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1A1C1A]">General Details & Required Data</h3>
              <p className="text-xs text-[#79757E]">Maintained securely in your local user profile space</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF9F6] border border-[#E3E2E0] hover:bg-[#F4F3F1] text-[#1A1C1A] transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#625981]" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit General Details'}</span>
          </button>
        </div>

        {!isEditing ? (
          /* View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-1">
              <span className="text-[10px] font-bold text-[#79757E] uppercase flex items-center gap-1">
                <User className="w-3 h-3 text-[#625981]" /> Full Name
              </span>
              <span className="text-sm font-black text-[#1A1C1A] block">{currentUser.name}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-1">
              <span className="text-[10px] font-bold text-[#79757E] uppercase flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#625981]" /> Email Address
              </span>
              <span className="text-sm font-black text-[#1A1C1A] block">{currentUser.email}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-1">
              <span className="text-[10px] font-bold text-[#79757E] uppercase flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#625981]" /> Primary Phone Number
              </span>
              <span className="text-sm font-black text-[#1A1C1A] block">{currentUser.phone || '+91 98765 43210'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-1">
              <span className="text-[10px] font-bold text-[#79757E] uppercase flex items-center gap-1">
                <BadgeIndianRupee className="w-3 h-3 text-[#625981]" /> Finova UPI ID
              </span>
              <span className="text-sm font-black text-[#1A1C1A] block">{currentUser.upiId || 'pooja@finova'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-1">
              <span className="text-[10px] font-bold text-[#79757E] uppercase flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#625981]" /> College / Institution
              </span>
              <span className="text-sm font-black text-[#1A1C1A] block">{currentUser.collegeOrOrganization || 'College of Technology'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-1">
              <span className="text-[10px] font-bold text-[#79757E] uppercase flex items-center gap-1">
                <Wallet className="w-3 h-3 text-[#625981]" /> Monthly Allowance / Target
              </span>
              <span className="text-sm font-black text-[#27AE60] block">
                {formatCurrency(currentUser.monthlyIncome || 15000, currency)}
              </span>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <form onSubmit={handleSaveGeneralDetails} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454E]">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FAF9F6] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454E]">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FAF9F6] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454E]">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FAF9F6] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454E]">Finova UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FAF9F6] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454E]">College / Institution</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FAF9F6] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454E]">Monthly Allowance ({currency})</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FAF9F6] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#F4F3F1]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FAF9F6] text-[#48454E] hover:bg-[#E9E8E5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1A1C1A] text-[#FAF9F6] hover:bg-[#2E312F] shadow-md transition-all"
              >
                <Save className="w-4 h-4 text-[#00FF66]" />
                <span>Save General Details</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Switcher Modal / Expanded Section */}
      {showAccountSwitcher && (
        <div className="bg-[#ffffff] rounded-3xl p-6 border border-[#E3E2E0] shadow-paper space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[#F4F3F1]">
            <div>
              <h3 className="text-base font-extrabold text-[#1A1C1A]">Switch Personal Account</h3>
              <p className="text-xs text-[#79757E]">
                Test strict privacy & user data isolation between accounts
              </p>
            </div>
            <button
              onClick={() => setIsAddingUser(!isAddingUser)}
              className="px-3.5 py-2 rounded-xl bg-[#DCD0FF] text-[#1A1C1A] text-xs font-bold hover:bg-[#CCC0EE] flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 text-[#625981]" />
              <span>Add New User</span>
            </button>
          </div>

          {/* User List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_USERS.map((user) => {
              const isSelected = currentUser.id === user.id || currentUser.email === user.email;
              return (
                <div
                  key={user.id}
                  onClick={() => {
                    onSwitchUser(user);
                    setShowAccountSwitcher(false);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#1A1C1A] text-[#FAF9F6] border-[#1A1C1A] shadow-md'
                      : 'bg-[#FAF9F6] text-[#1A1C1A] border-[#E3E2E0] hover:bg-[#E9E8E5]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#DCD0FF] text-[#1A1C1A] flex items-center justify-center font-bold overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold">{user.name}</h4>
                      <p className={`text-[10px] ${isSelected ? 'text-[#A09CA8]' : 'text-[#79757E]'}`}>
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="text-xs font-bold text-[#DCD0FF] bg-[#3E423F] px-2.5 py-1 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-[#625981]">Switch →</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add User Form */}
          {isAddingUser && (
            <form onSubmit={handleCreateNewUser} className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-3 mt-3">
              <h4 className="text-xs font-bold text-[#1A1C1A]">Create New Isolated User Space</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="User Full Name (e.g. Rahul Sharma)"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="px-3.5 py-2 text-xs font-bold bg-[#ffffff] border border-[#E3E2E0] rounded-xl text-[#1A1C1A]"
                />
                <input
                  type="email"
                  placeholder="User Email Address"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="px-3.5 py-2 text-xs font-bold bg-[#ffffff] border border-[#E3E2E0] rounded-xl text-[#1A1C1A]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#1A1C1A] text-[#FAF9F6] text-xs font-bold"
              >
                Create & Switch to User
              </button>
            </form>
          )}

        </div>
      )}

      {/* Core Privacy & Security Principles Box */}
      <div className="bg-[#ffffff] rounded-3xl p-6 border border-[#E3E2E0] shadow-paper space-y-4">
        <div className="flex items-center space-x-2 text-[#625981]">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-base font-extrabold text-[#1A1C1A]">
            One Account. One Private Financial Space.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-2">
            <span className="text-lg">🔒</span>
            <h4 className="font-extrabold text-[#1A1C1A]">100% User Data Separation</h4>
            <p className="text-[#79757E] leading-relaxed">
              Pooja's account only sees Pooja's transactions. Rahul's account only sees Rahul's transactions. No cross-viewing permitted.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-2">
            <span className="text-lg">⚡</span>
            <h4 className="font-extrabold text-[#1A1C1A]">Auto-Sync Ledger</h4>
            <p className="text-[#79757E] leading-relaxed">
              Every payment made via Smart UPI is instantly recorded to your isolated ledger and updates your specific category budgets.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-2">
            <span className="text-lg">🤖</span>
            <h4 className="font-extrabold text-[#1A1C1A]">Personal Smart Coach</h4>
            <p className="text-[#79757E] leading-relaxed">
              Your AI Financial Advisor analyzes your individual spending patterns to provide tailored savings insights.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
