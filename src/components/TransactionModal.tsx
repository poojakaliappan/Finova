import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Check, 
  Camera, 
  Clock, 
  Calendar,
  Loader2,
  FileText
} from 'lucide-react';
import { Transaction, Category, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>, editId?: string) => void;
  categories: Category[];
  editingTransaction?: Transaction | null;
  initialMode?: 'manual' | 'scan';
  preselectedCategoryId?: string;
  transactions?: Transaction[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingTransaction,
  initialMode = 'manual',
  preselectedCategoryId,
  transactions = [],
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'scan'>(initialMode);
  const [type, setType] = useState<TransactionType>('outflow');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [dateOption, setDateOption] = useState<'today' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('02:30 PM');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Bank'>('UPI');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'weekly' | 'yearly' | 'daily'>('monthly');

  // AI Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const quickCategoryIcons = [
    { id: 'cat-food', name: 'Food', emoji: '🍔' },
    { id: 'cat-travel', name: 'Travel', emoji: '🚌' },
    { id: 'cat-education', name: 'Education', emoji: '📚' },
    { id: 'cat-shopping', name: 'Shopping', emoji: '🛍️' },
    { id: 'cat-recharge', name: 'Recharge', emoji: '📱' },
    { id: 'cat-entertainment', name: 'Entertainment', emoji: '🎬' },
    { id: 'cat-health', name: 'Health', emoji: '💊' },
    { id: 'cat-others', name: 'Others', emoji: '📦' },
  ];

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.categoryId);
      setDescription(editingTransaction.title || editingTransaction.notes || '');
      setCustomDate(editingTransaction.date);
      setPaymentMethod((editingTransaction.paymentMethod as any) || 'UPI');
      setIsRecurring(Boolean(editingTransaction.isRecurring));
      setRecurringFrequency(editingTransaction.recurringFrequency || 'monthly');
      setActiveTab('manual');
    } else {
      setType('outflow');
      setAmount('');
      setCategoryId(preselectedCategoryId || 'cat-food');
      setDescription('');
      setDateOption('today');
      setCustomDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setPaymentMethod('UPI');
      setReceiptImage(null);
      setIsRecurring(false);
      setRecurringFrequency('monthly');
      setActiveTab(initialMode);
    }
  }, [editingTransaction, isOpen, initialMode, preselectedCategoryId]);

  if (!isOpen) return null;

  // Compute live Smart Tip for category budget
  const selectedCat = categories.find((c) => c.id === categoryId) || categories[0];
  const catTargetBudget = selectedCat?.targetBudget || 1000;
  
  // Exiting spent in this category
  const existingSpentInCat = transactions
    .filter((t) => t.categoryId === selectedCat?.id && t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);

  const numAmount = parseFloat(amount) || 0;
  const projectedTotalSpent = existingSpentInCat + numAmount;
  const projectedPercent = catTargetBudget > 0 ? Math.round((projectedTotalSpent / catTargetBudget) * 100) : 0;

  const getNextDueDate = (startDate: string, freq: 'monthly' | 'weekly' | 'yearly' | 'daily') => {
    const d = new Date(startDate);
    if (freq === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (freq === 'weekly') d.setDate(d.getDate() + 7);
    else if (freq === 'yearly') d.setFullYear(d.getFullYear() + 1);
    else if (freq === 'daily') d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const catObj = categories.find((c) => c.id === categoryId) || categories[0];
    const txDate = dateOption === 'today' ? new Date().toISOString().split('T')[0] : customDate;

    onSave(
      {
        title: description || `${catObj?.name || 'Expense'} Purchase`,
        amount: parseFloat(amount),
        type,
        categoryId: catObj.id,
        categoryName: catObj.name,
        date: txDate,
        paymentMethod,
        notes: `${description} (${time})`,
        receiptUrl: receiptImage || undefined,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        nextDueDate: isRecurring ? getNextDueDate(txDate, recurringFrequency) : undefined,
      },
      editingTransaction?.id
    );

    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const runAiReceiptScan = async () => {
    if (!receiptImage) return;

    setIsScanning(true);
    setScanMessage('Scanning receipt with Gemini AI...');

    try {
      const res = await fetch('/api/receipt/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: receiptImage }),
      });

      const data = await res.json();

      if (data) {
        if (data.amount) setAmount(data.amount.toString());
        if (data.title) setDescription(data.title);
        if (data.paymentMethod) setPaymentMethod(data.paymentMethod);
        if (data.categoryId) {
          const matched = categories.find((c) => c.id === data.categoryId);
          if (matched) setCategoryId(matched.id);
        }
        setScanMessage('Receipt parsed successfully!');
        setActiveTab('manual');
      }
    } catch (err) {
      console.error(err);
      setScanMessage('Failed to read receipt. Please fill details manually.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1C1A]/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#ffffff] rounded-3xl w-full max-w-lg border border-[#E3E2E0] shadow-modal overflow-hidden my-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E3E2E0] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center space-x-2">
            <span className="text-xl">➕</span>
            <div>
              <h3 className="text-base font-extrabold text-[#1A1C1A]">
                {editingTransaction ? 'Edit Expense' : 'Add Expense Screen'}
              </h3>
              <p className="text-[11px] text-[#79757E]">Fast & smart money logger</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#E9E8E5] text-[#79757E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#E3E2E0] bg-[#F4F3F1] p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'manual'
                ? 'bg-[#ffffff] text-[#1A1C1A] shadow-sm'
                : 'text-[#79757E]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Fast Expense Form</span>
          </button>

          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'scan'
                ? 'bg-[#ffffff] text-[#1A1C1A] shadow-sm'
                : 'text-[#79757E]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#625981]" />
            <span>Scan Receipt</span>
          </button>
        </div>

        {/* Form Body */}
        {activeTab === 'manual' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Amount Section */}
            <div className="space-y-1.5 bg-[#FAF9F6] p-4 rounded-2xl border border-[#E3E2E0] text-center">
              <label className="text-xs font-bold text-[#625981] uppercase tracking-wider block">
                Amount Spent
              </label>
              <div className="flex items-center justify-center space-x-1">
                <span className="text-3xl font-extrabold text-[#1A1C1A]">₹</span>
                <input
                  type="number"
                  step="1"
                  required
                  autoFocus
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-48 text-3xl font-extrabold text-[#1A1C1A] bg-transparent border-b-2 border-[#1A1C1A] text-center focus:outline-none placeholder-[#D3D1D8]"
                />
              </div>
            </div>

            {/* Smart Tip Feature & FINOVA Decision Mode Preview */}
            {numAmount > 0 && (
              <div className="space-y-2">
                {/* Decision Mode Impact Card */}
                <div className="bg-[#1A1C1A] text-[#FAF9F6] p-3.5 rounded-2xl text-xs space-y-1.5 border border-[#8B5CF6]/50 shadow-md animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[#00FF66] font-black uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>FINOVA Mission Impact</span>
                    </span>
                    <span className="text-[10px] text-[#DCD0FF] font-semibold">
                      Laptop Mission (₹50,000)
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[#DCD0FF]">
                    ⚠️ Spending <strong className="text-[#FAF9F6]">₹{numAmount}</strong> will move your Laptop goal <strong className="text-[#FF7A00]">{Math.max(1, Math.round(numAmount / 133))} days further away</strong>.
                  </p>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-[#79757E]">Want to see 3 futures first?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        // Trigger Decision Mode tab navigation via custom event or prompt
                        window.dispatchEvent(new CustomEvent('navigate_tab', { detail: 'simulator' }));
                      }}
                      className="px-2.5 py-1 rounded-xl bg-[#8B5CF6] text-[#ffffff] text-[11px] font-black hover:bg-[#7C3AED] transition-all"
                    >
                      🔮 Open Decision Simulator
                    </button>
                  </div>
                </div>

                <div className="bg-[#F5F5DC] border border-[#E3E2E0] p-3.5 rounded-2xl text-xs text-[#1A1C1A] flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-[#625981] shrink-0 mt-0.5" />
                  <div>
                    <strong>💡 Smart Tip:</strong> You have already spent <span className="font-extrabold text-[#625981]">{projectedPercent}%</span> of your monthly {selectedCat.name.toLowerCase()} budget.
                  </div>
                </div>
              </div>
            )}

            {/* Category Selection with Large Icons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#48454E] block">
                Select Category
              </label>

              <div className="grid grid-cols-4 gap-2">
                {quickCategoryIcons.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                        isSelected
                          ? 'bg-[#1A1C1A] text-[#FAF9F6] border-[#1A1C1A] shadow-md scale-105'
                          : 'bg-[#FAF9F6] text-[#1A1C1A] border-[#E3E2E0] hover:bg-[#E9E8E5]'
                      }`}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="text-[10px] font-bold truncate max-w-full">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#48454E] block">
                Description
              </label>
              <input
                type="text"
                placeholder="What did you spend on? (e.g. Lunch with friends)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F4F3F1] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A] font-semibold"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454E] flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#625981]" />
                  <span>Date</span>
                </label>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setDateOption('today')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                      dateOption === 'today'
                        ? 'bg-[#DCD0FF] text-[#1A1C1A] border-[#625981]'
                        : 'bg-[#F4F3F1] text-[#79757E] border-[#E3E2E0]'
                    }`}
                  >
                    📅 Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateOption('custom')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border ${
                      dateOption === 'custom'
                        ? 'bg-[#DCD0FF] text-[#1A1C1A] border-[#625981]'
                        : 'bg-[#F4F3F1] text-[#79757E] border-[#E3E2E0]'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {dateOption === 'custom' && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-xl text-xs bg-[#F4F3F1] border border-[#E3E2E0] text-[#1A1C1A]"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454E] flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#625981]" />
                  <span>Time</span>
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F4F3F1] border border-[#E3E2E0] focus:outline-none text-[#1A1C1A] font-semibold"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#48454E] block">
                Payment Method
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Cash', emoji: '💵' },
                  { label: 'Card', emoji: '💳' },
                  { label: 'UPI', emoji: '📱' },
                  { label: 'Bank', emoji: '🏦' },
                ].map((pm) => {
                  const isSelected = paymentMethod === pm.label;
                  return (
                    <button
                      key={pm.label}
                      type="button"
                      onClick={() => setPaymentMethod(pm.label as any)}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                        isSelected
                          ? 'bg-[#DCD0FF] border-[#625981] text-[#1A1C1A] shadow-sm'
                          : 'bg-[#F4F3F1] border-[#E3E2E0] text-[#79757E] hover:bg-[#E9E8E5]'
                      }`}
                    >
                      <span>{pm.emoji}</span>
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recurring Transaction Flag */}
            <div className="p-3 bg-[#FAF9F6] border border-[#E3E2E0] rounded-2xl space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">🔄</span>
                  <div>
                    <span className="text-xs font-bold text-[#1A1C1A] block">
                      Recurring Payment / Subscription
                    </span>
                    <span className="text-[10px] text-[#79757E]">
                      Auto-repeats on fixed schedule (e.g. Rent, Netflix)
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 accent-[#1A1C1A] rounded cursor-pointer"
                />
              </label>

              {isRecurring && (
                <div className="pt-2 border-t border-[#E3E2E0] flex items-center justify-between text-xs animate-in fade-in duration-200">
                  <span className="font-bold text-[#48454E]">Repeat Frequency:</span>
                  <select
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-[#ffffff] border border-[#E3E2E0] font-bold text-[#1A1C1A] focus:outline-none"
                  >
                    <option value="monthly">Monthly (Rent, Subscriptions)</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              )}
            </div>

            {/* Optional Receipt Attachment Preview */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-[#48454E] flex items-center justify-between">
                <span>📷 Add Receipt (Optional)</span>
                {receiptImage && <span className="text-[#27AE60] text-[10px]">Attached ✓</span>}
              </label>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-[#79757E] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#F4F3F1] file:text-[#1A1C1A] hover:file:bg-[#E9E8E5]"
              />
            </div>

            {/* CTA Button */}
            <div className="pt-3 border-t border-[#E3E2E0] flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl text-xs font-bold bg-[#F4F3F1] text-[#48454E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl text-xs font-extrabold bg-[#1A1C1A] text-[#FAF9F6] shadow-md hover:bg-[#2E312F] transition-all flex items-center justify-center space-x-2 active:scale-95"
              >
                <Check className="w-4 h-4 text-[#DCD0FF]" />
                <span>Save Expense</span>
              </button>
            </div>

          </form>
        ) : (
          /* Scan Receipt Tab */
          <div className="p-6 space-y-4">
            <div className="border-2 border-dashed border-[#DCD0FF] bg-[#FAF9F6] rounded-2xl p-6 text-center space-y-3">
              {receiptImage ? (
                <div className="relative">
                  <img src={receiptImage} alt="Receipt preview" className="mx-auto h-40 object-contain rounded-xl" />
                  <button
                    onClick={() => setReceiptImage(null)}
                    className="absolute top-1 right-1 p-1 bg-[#1A1C1A] text-[#FAF9F6] rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#DCD0FF] text-[#625981] flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-[#1A1C1A]">
                    Upload or snap a receipt photo
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {scanMessage && <p className="text-xs font-bold text-[#625981] text-center">{scanMessage}</p>}

            <button
              type="button"
              disabled={isScanning || !receiptImage}
              onClick={runAiReceiptScan}
              className="w-full py-3 bg-[#DCD0FF] disabled:opacity-50 text-[#1A1C1A] rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing Receipt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#625981]" />
                  <span>Parse Receipt Details</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
