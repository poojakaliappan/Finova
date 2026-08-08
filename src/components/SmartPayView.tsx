import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Users, 
  AtSign, 
  Phone, 
  HandCoins, 
  History, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Search, 
  X, 
  ShieldCheck,
  Send,
  Zap,
  Check,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Category, Transaction, Contact, FinancialFirewallRules, VoiceSettings, InvisibleWalletState, MoneyLockState } from '../types';
import { formatCurrency } from '../utils/formatters';
import { INITIAL_CONTACTS } from '../data/mockData';

interface SmartPayViewProps {
  categories: Category[];
  transactions: Transaction[];
  currency: string;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onNavigate: (tab: string) => void;
  firewallRules?: FinancialFirewallRules;
  voiceSettings?: VoiceSettings;
  invisibleWalletState?: InvisibleWalletState;
  moneyLockState?: MoneyLockState;
}

export const SmartPayView: React.FC<SmartPayViewProps> = ({
  categories,
  transactions,
  currency,
  onAddTransaction,
  onNavigate,
  firewallRules,
  voiceSettings,
  invisibleWalletState,
  moneyLockState,
}) => {
  const [payMode, setPayMode] = useState<'qr' | 'contact' | 'upi' | 'request' | 'history'>('qr');
  
  // Group Splitter State
  const [splitType, setSplitType] = useState<'individual' | 'group'>('group');
  const [groupFriends, setGroupFriends] = useState<string[]>(['Pooja', 'Rahul', 'Priya', 'Alex', 'Vivek']);
  const [groupTotalAmount, setGroupTotalAmount] = useState('2500');
  const [groupBillNote, setGroupBillNote] = useState('Weekend Dinner & Cabs');
  const [newFriendName, setNewFriendName] = useState('');
  
  // Payment Form State
  const [recipientName, setRecipientName] = useState('ABC Restaurant');
  const [recipientUpi, setRecipientUpi] = useState('abcrestaurant@upi');
  const [amount, setAmount] = useState('350');
  const [selectedCategory, setSelectedCategory] = useState('cat-food');
  const [note, setNote] = useState('Dinner with friends');
  const [searchContact, setSearchContact] = useState('');

  // Request Money State
  const [reqPayer, setReqPayer] = useState('Pooja (Friend)');
  const [reqAmount, setReqAmount] = useState('250');
  const [reqNote, setReqNote] = useState('Split for dinner last night');
  const [generatedRequest, setGeneratedRequest] = useState<{
    upiLink: string;
    qrUrl: string;
    payer: string;
    amount: number;
    note: string;
    status: 'pending' | 'completed';
  } | null>(null);

  // Modals & Confirmation States
  const [showSmartConfirmation, setShowSmartConfirmation] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  // Live Camera QR State
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize Real Camera Feed
  useEffect(() => {
    let active = true;
    if (payMode === 'qr' && isCameraOn) {
      async function enableRealCamera() {
        try {
          setCameraPermissionError(null);
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            if (active) {
              mediaStreamRef.current = stream;
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => {});
              }
            } else {
              stream.getTracks().forEach((track) => track.stop());
            }
          } else {
            setCameraPermissionError('Camera API not accessible in this browser frame.');
          }
        } catch (err: any) {
          console.warn('Camera stream notice:', err);
          setCameraPermissionError('Camera access required. Please grant permission or choose a preset QR.');
        }
      }
      enableRealCamera();
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [payMode, isCameraOn]);

  // Quick preset sample QRs for instant demo
  const sampleQrs = [
    { name: 'ABC Restaurant', upi: 'abcrestaurant@upi', amount: '350', categoryId: 'cat-food', icon: '🍔' },
    { name: 'Fashion Hub', upi: 'fashionhub@okaxis', amount: '1200', categoryId: 'cat-shopping', icon: '🛍️' },
    { name: 'City Metro Transit', upi: 'metro@sbi', amount: '60', categoryId: 'cat-travel', icon: '🚇' },
    { name: 'BookLand Stationery', upi: 'bookland@icici', amount: '250', categoryId: 'cat-education', icon: '📚' },
  ];

  // Budget Analysis for requested payment
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];
  const categoryBudget = currentCategoryObj?.targetBudget || 1500;
  
  const currentCategorySpent = transactions
    .filter((t) => t.categoryId === selectedCategory && t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);

  const numAmount = parseFloat(amount) || 0;
  const projectedSpent = currentCategorySpent + numAmount;
  const isOverBudget = categoryBudget > 0 && projectedSpent > categoryBudget;
  const budgetDifference = projectedSpent - categoryBudget;
  const remainingInBudget = Math.max(0, categoryBudget - projectedSpent);

  // Firewall evaluation
  const isNightTime = (() => {
    const hr = new Date().getHours();
    return hr >= 22 || hr < 6;
  })();

  const categoryNameLower = (currentCategoryObj?.name || '').toLowerCase();
  const isFoodCategory = categoryNameLower.includes('food') || (selectedCategory || '').includes('food');
  const isShoppingCategory = categoryNameLower.includes('shopping') || (selectedCategory || '').includes('shopping');

  const foodSpentToday = transactions
    .filter((t) => (t.categoryName.toLowerCase().includes('food') || t.categoryId.includes('food')) && t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);

  let firewallViolation: string | null = null;
  if (firewallRules?.isEnabled) {
    if (isFoodCategory && (foodSpentToday + numAmount) > (firewallRules.maxFoodPerDay || 300)) {
      firewallViolation = `🔥 Financial Firewall Alert: Daily food limit is ₹${firewallRules.maxFoodPerDay || 300}. Adding ₹${numAmount} exceeds your set rule!`;
    } else if (firewallRules.noPaymentsAfter10PM && isNightTime) {
      firewallViolation = `🌙 Financial Firewall Alert: Late night payment lockdown (10 PM - 6 AM) is active.`;
    } else if (numAmount > (firewallRules.maxSingleTxLimit || 1000)) {
      firewallViolation = `⚠️ Financial Firewall Alert: Single payment of ₹${numAmount} exceeds your ₹${firewallRules.maxSingleTxLimit || 1000} limit rule.`;
    } else if (isShoppingCategory && firewallRules.shoppingLockdown) {
      firewallViolation = `🛍️ Financial Firewall Alert: Shopping category lockdown active. Please confirm intent carefully.`;
    }
  }

  const goalTitle = invisibleWalletState?.goalTitle || 'Dream Product';
  const goalDelayDays = Math.max(1, Math.ceil(numAmount / 50));

  // One-Word Smart Categorization state
  const [oneWordInput, setOneWordInput] = useState('');
  const [detectedCategoryName, setDetectedCategoryName] = useState('');

  const handleOneWordCategorize = (word: string) => {
    const w = word.toLowerCase().trim();
    setOneWordInput(word);

    let catId = 'cat-food';
    let catName = 'Food';

    if (w.includes('bus') || w.includes('cab') || w.includes('metro') || w.includes('fuel') || w.includes('uber') || w.includes('travel') || w.includes('auto')) {
      catId = 'cat-travel';
      catName = 'Travel';
    } else if (w.includes('notebook') || w.includes('book') || w.includes('college') || w.includes('pen') || w.includes('tuition') || w.includes('education') || w.includes('exam')) {
      catId = 'cat-education';
      catName = 'Education';
    } else if (w.includes('movie') || w.includes('netflix') || w.includes('cinema') || w.includes('game') || w.includes('entertainment')) {
      catId = 'cat-entertainment';
      catName = 'Entertainment';
    } else if (w.includes('recharge') || w.includes('mobile') || w.includes('wifi') || w.includes('bill')) {
      catId = 'cat-recharge';
      catName = 'Recharge';
    } else if (w.includes('shop') || w.includes('cloth') || w.includes('dress') || w.includes('shoes')) {
      catId = 'cat-shopping';
      catName = 'Shopping';
    } else if (w.includes('medicine') || w.includes('doctor') || w.includes('health') || w.includes('pharma')) {
      catId = 'cat-health';
      catName = 'Health';
    }

    setDetectedCategoryName(catName);
    setSelectedCategory(catId);
  };

  // Filter contacts
  const filteredContacts = INITIAL_CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
      c.upiId.toLowerCase().includes(searchContact.toLowerCase()) ||
      c.phone.includes(searchContact)
  );

  // Filter UPI Payment History
  const upiTransactions = transactions.filter((t) => t.paymentMethod === 'UPI' || t.upiId);

  const handleSelectContact = (contact: Contact) => {
    setRecipientName(contact.name);
    setRecipientUpi(contact.upiId);
    if (contact.recentAmount) setAmount(contact.recentAmount.toString());
    if (contact.category) setSelectedCategory(contact.category);
    setPayMode('upi');
  };

  const handleSelectQrPreset = (qr: typeof sampleQrs[0]) => {
    setRecipientName(qr.name);
    setRecipientUpi(qr.upi);
    setAmount(qr.amount);
    setSelectedCategory(qr.categoryId);
    setNote(`Payment to ${qr.name}`);
    setPayMode('upi');
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    // Show Smart Confirmation Modal with budget advice first
    setShowSmartConfirmation(true);
  };

  const handleExecutePayment = () => {
    setIsProcessing(true);

    // Formulate real UPI intent deep link: upi://pay?pa=...&pn=...&am=...&cu=INR
    const encodedName = encodeURIComponent(recipientName || 'Merchant');
    const upiUri = `upi://pay?pa=${encodeURIComponent(recipientUpi)}&pn=${encodedName}&am=${numAmount}&cu=INR`;

    // Attempt opening UPI intent on supported mobile devices
    try {
      window.location.href = upiUri;
    } catch (e) {
      console.log('UPI intent launched or fallback');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nextMonthStr = (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().split('T')[0];
    })();

    setTimeout(() => {
      const newTxData: Omit<Transaction, 'id'> = {
        title: recipientName,
        amount: parseFloat(amount),
        type: 'outflow',
        categoryId: currentCategoryObj.id,
        categoryName: currentCategoryObj.name,
        merchant: recipientName,
        paymentMethod: 'UPI',
        upiId: recipientUpi,
        notes: note || `UPI payment to ${recipientName}`,
        date: todayStr,
        isAutoTracked: true,
        isRecurring,
        recurringFrequency: isRecurring ? 'monthly' : undefined,
        nextDueDate: isRecurring ? nextMonthStr : undefined,
      };

      onAddTransaction(newTxData);

      const createdTx: Transaction = {
        ...newTxData,
        id: `tx-upi-${Date.now()}`,
      };

      setIsProcessing(false);
      setShowSmartConfirmation(false);
      setPaymentSuccess(createdTx);
    }, 900);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1A1C1A] text-[#FAF9F6] p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#DCD0FF]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#DCD0FF]/20 text-[#DCD0FF] text-xs font-bold border border-[#DCD0FF]/30">
            <Zap className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Pay + Auto-Track + Manage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Smart UPI Pay
          </h1>
          <p className="text-xs sm:text-sm text-[#A09CA8] max-w-md">
            Scan any QR or send via UPI. Finova automatically records, categorizes, and updates your budget in real time.
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10 self-start md:self-auto">
          <div className="px-4 py-2.5 rounded-2xl bg-[#2E312F] border border-[#3E423F] text-center">
            <span className="text-[10px] uppercase font-bold text-[#A09CA8] block">Total UPI Spent</span>
            <span className="text-lg font-extrabold text-[#FAF9F6]">
              {formatCurrency(upiTransactions.reduce((s, t) => s + t.amount, 0), currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#F4F3F1] p-2 rounded-2xl border border-[#E3E2E0]">
        {[
          { id: 'qr', label: 'Scan QR', icon: QrCode },
          { id: 'contact', label: 'Contacts', icon: Users },
          { id: 'upi', label: 'UPI ID', icon: AtSign },
          { id: 'request', label: 'Group Split & Request', icon: HandCoins },
          { id: 'history', label: 'History', icon: History },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = payMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPayMode(item.id as any)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#1A1C1A] text-[#FAF9F6] shadow-md scale-102'
                  : 'text-[#48454E] hover:bg-[#E9E8E5]'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-[#DCD0FF]' : 'text-[#79757E]'}`} />
              <span className="text-[11px] font-bold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* MODE 1: SCAN QR CODE */}
      {payMode === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Real Live Camera Scanner Box */}
          <div className="bg-[#ffffff] rounded-3xl p-6 border border-[#E3E2E0] shadow-paper space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-[#F4F3F1]">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-[#625981]" />
                <h3 className="text-base font-extrabold text-[#1A1C1A]">Scan Any Merchant UPI QR</h3>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  className="px-2.5 py-1 rounded-xl bg-[#F4F3F1] hover:bg-[#E9E8E5] text-[#1A1C1A] text-[10px] font-bold border border-[#E3E2E0] transition-all flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3 text-[#625981]" />
                  <span>{isCameraOn ? 'Restart' : 'Start'} Camera</span>
                </button>

                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                  isCameraOn ? 'bg-[#E2F0D9] text-[#27AE60]' : 'bg-[#F4F3F1] text-[#79757E]'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isCameraOn ? 'bg-[#27AE60] animate-ping' : 'bg-[#79757E]'}`} />
                  <span>{isCameraOn ? 'Live Camera Active' : 'Camera Off'}</span>
                </span>
              </div>
            </div>

            {/* Live Camera Feed Container */}
            <div className="relative aspect-square max-w-sm mx-auto rounded-3xl bg-[#1A1C1A] border-4 border-[#1A1C1A] overflow-hidden flex flex-col items-center justify-center shadow-2xl group">
              
              {/* Real Video Element */}
              {isCameraOn && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              )}

              {/* Viewfinder Bracket Overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-t-4 border-l-4 border-[#00FF66] rounded-tl-2xl shadow-[0_0_10px_#00FF66]" />
                  <div className="w-10 h-10 border-t-4 border-r-4 border-[#00FF66] rounded-tr-2xl shadow-[0_0_10px_#00FF66]" />
                </div>

                {/* Animated Laser Scanning Beam */}
                <div className="relative w-full h-0.5 bg-[#00FF66] shadow-[0_0_20px_#00FF66] animate-pulse my-auto" />

                <div className="flex justify-between">
                  <div className="w-10 h-10 border-b-4 border-l-4 border-[#00FF66] rounded-bl-2xl shadow-[0_0_10px_#00FF66]" />
                  <div className="w-10 h-10 border-b-4 border-r-4 border-[#00FF66] rounded-br-2xl shadow-[0_0_10px_#00FF66]" />
                </div>
              </div>

              {/* Fallback overlay text if camera isn't active or permission error */}
              {cameraPermissionError && (
                <div className="absolute inset-0 z-20 bg-[#1A1C1A]/90 p-6 flex flex-col items-center justify-center text-center space-y-3">
                  <Camera className="w-10 h-10 text-[#FF5722] animate-bounce" />
                  <p className="text-xs text-[#FAF9F6] font-bold max-w-xs">{cameraPermissionError}</p>
                  <button
                    onClick={() => setIsCameraOn(true)}
                    className="px-4 py-2 rounded-xl bg-[#00FF66] text-[#1A1C1A] text-xs font-black shadow-md"
                  >
                    Allow & Open Live Camera
                  </button>
                </div>
              )}

              {/* Action Floating Overlay Button */}
              <div className="absolute bottom-4 z-20 inset-x-4 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handleSelectQrPreset(sampleQrs[0])}
                  className="px-4 py-2.5 rounded-2xl bg-[#00FF66] text-[#1A1C1A] text-xs font-black hover:bg-[#00E65C] transition-all shadow-xl border border-[#00FF66] flex items-center space-x-2 active:scale-95"
                >
                  <QrCode className="w-4 h-4 text-[#1A1C1A]" />
                  <span>Scan QR & Launch GPay App</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#79757E] font-medium">
              Point your live phone camera at Google Pay, PhonePe, Paytm, or BHIM QR codes.
            </p>
          </div>

          {/* Preset Merchant QRs for instant demo */}
          <div className="bg-[#ffffff] rounded-3xl p-6 border border-[#E3E2E0] shadow-paper space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1A1C1A]">Tap to Scan Merchant QR</h3>
              <p className="text-xs text-[#79757E]">Instantly opens Google Pay / UPI flow and logs expense</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sampleQrs.map((qr) => (
                <button
                  key={qr.upi}
                  onClick={() => handleSelectQrPreset(qr)}
                  className="p-4 rounded-2xl bg-[#FAF9F6] hover:bg-[#DCD0FF]/30 border border-[#E3E2E0] hover:border-[#625981] transition-all text-left flex items-center space-x-3 group active:scale-98 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#ffffff] border border-[#E3E2E0] flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    {qr.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1C1A]">{qr.name}</h4>
                    <span className="text-[10px] text-[#79757E] font-medium block">{qr.upi}</span>
                    <span className="text-xs font-extrabold text-[#625981] mt-0.5 block">
                      Pay {formatCurrency(parseFloat(qr.amount), currency)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Direct GPay & App Launcher Info */}
            <div className="p-4 rounded-2xl bg-[#1A1C1A] text-[#FAF9F6] border border-[#8B5CF6]/50 space-y-3">
              <div className="flex items-center space-x-2 text-[#00FF66]">
                <Zap className="w-4 h-4 fill-[#00FF66]" />
                <span className="text-xs font-black uppercase tracking-wider">Direct UPI Deep Link Active</span>
              </div>
              <p className="text-xs text-[#D3D1D8] leading-relaxed">
                When you initiate payment, FINOVA triggers the native <code className="text-[#00FF66]">upi://pay</code> link to securely launch Google Pay, PhonePe, or BHIM on your device!
              </p>
            </div>
          </div>

        </div>
      )}

      {/* MODE 2: CONTACTS LIST */}
      {payMode === 'contact' && (
        <div className="bg-[#ffffff] rounded-3xl p-6 border border-[#E3E2E0] shadow-paper space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F4F3F1]">
            <div>
              <h3 className="text-base font-extrabold text-[#1A1C1A]">Send Money to Contact</h3>
              <p className="text-xs text-[#79757E]">Select a friend or merchant to transfer via UPI</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#79757E]" />
              <input
                type="text"
                placeholder="Search contact or phone..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl bg-[#F4F3F1] border border-[#E3E2E0] focus:outline-none focus:border-[#625981] text-[#1A1C1A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] hover:border-[#625981] transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#DCD0FF] text-xl flex items-center justify-center shrink-0">
                    {contact.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#1A1C1A]">{contact.name}</h4>
                    <p className="text-[10px] text-[#79757E] font-medium">{contact.upiId}</p>
                    <p className="text-[10px] text-[#625981] font-semibold">{contact.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectContact(contact)}
                  className="px-4 py-2 rounded-xl bg-[#1A1C1A] hover:bg-[#2E312F] text-[#FAF9F6] text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 text-[#DCD0FF]" />
                  <span>Pay</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 3 & 4: ENTER UPI ID OR PHONE NUMBER PAYMENT FORM */}
      {(payMode === 'upi' || payMode === 'mobile') && (
        <div className="max-w-xl mx-auto bg-[#ffffff] rounded-3xl p-6 sm:p-8 border border-[#E3E2E0] shadow-paper space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#F4F3F1]">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-2xl bg-[#DCD0FF] text-[#625981] flex items-center justify-center font-extrabold">
                💸
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1A1C1A]">
                  {payMode === 'mobile' ? 'Pay to Phone Number' : 'Pay via UPI ID'}
                </h3>
                <p className="text-[11px] text-[#79757E]">Direct transfer & automatic expense tracking</p>
              </div>
            </div>

            <button
              onClick={() => setPayMode('qr')}
              className="text-xs font-bold text-[#79757E] hover:text-[#1A1C1A] p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleInitiatePayment} className="space-y-5">
            
            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454E] block">
                  Recipient Name / Shop
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Restaurant"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] focus:outline-none focus:border-[#625981]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#48454E] block">
                  {payMode === 'mobile' ? 'Mobile Number' : 'UPI ID'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={payMode === 'mobile' ? '9876543210' : 'username@upi'}
                  value={recipientUpi}
                  onChange={(e) => setRecipientUpi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] focus:outline-none focus:border-[#625981]"
                />
              </div>
            </div>

            {/* Amount Input */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E3E2E0] text-center space-y-1">
              <label className="text-xs font-bold text-[#625981] uppercase tracking-wider block">
                Enter Amount
              </label>
              <div className="flex items-center justify-center space-x-1">
                <span className="text-3xl font-extrabold text-[#1A1C1A]">₹</span>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-48 text-3xl font-extrabold text-[#1A1C1A] bg-transparent border-b-2 border-[#1A1C1A] text-center focus:outline-none placeholder-[#D3D1D8]"
                />
              </div>
            </div>

            {/* Category Auto-Assignment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#48454E] block">
                Assign Expense Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {categories.slice(0, 8).map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-[#1A1C1A] text-[#FAF9F6] border-[#1A1C1A] shadow-sm'
                          : 'bg-[#FAF9F6] text-[#1A1C1A] border-[#E3E2E0] hover:bg-[#E9E8E5]'
                      }`}
                    >
                      <span className="text-lg block">{cat.icon}</span>
                      <span className="text-[10px] font-bold truncate block">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#48454E] block">
                Note / Description
              </label>
              <input
                type="text"
                placeholder="What is this payment for? (e.g. Rent, Netflix, Dinner)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-semibold text-[#1A1C1A] focus:outline-none"
              />
            </div>

            {/* Recurring Payment Toggle */}
            <div className="p-3 bg-[#FAF9F6] border border-[#E3E2E0] rounded-2xl flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-2">
                <span className="text-sm">🔄</span>
                <div>
                  <span className="text-xs font-bold text-[#1A1C1A] block">
                    Mark as Recurring Bill / Subscription
                  </span>
                  <span className="text-[10px] text-[#79757E]">
                    Monthly repeat (e.g. Rent, Netflix, Wifi)
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 accent-[#1A1C1A] rounded cursor-pointer"
              />
            </div>

            {/* Live Budget Projection Preview */}
            <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
              isOverBudget
                ? 'bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828]'
                : 'bg-[#F5F5DC] border-[#E3E2E0] text-[#1A1C1A]'
            }`}>
              <div className="flex items-center space-x-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-[#625981]" />
                <span>Smart Budget Insight:</span>
              </div>
              <p className="leading-relaxed">
                {isOverBudget ? (
                  <>
                    ⚠️ Paying <strong>{formatCurrency(numAmount, currency)}</strong> will take your {currentCategoryObj.name} spending to <strong>{formatCurrency(projectedSpent, currency)}</strong>, exceeding your limit by <strong>{formatCurrency(budgetDifference, currency)}</strong>.
                  </>
                ) : (
                  <>
                    ✅ Paying <strong>{formatCurrency(numAmount, currency)}</strong> fits comfortably within your {currentCategoryObj.name} budget. You will have <strong>{formatCurrency(remainingInBudget, currency)}</strong> remaining.
                  </>
                )}
              </p>
            </div>

            {/* Submit Action Buttons: Proceed to Pay vs Simulate in Decision Mode */}
            <div className="space-y-2">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-[#1A1C1A] hover:bg-[#2E312F] text-[#FAF9F6] text-xs font-extrabold shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-98"
              >
                <span>Proceed to Pay {formatCurrency(numAmount, currency)}</span>
                <ArrowRight className="w-4 h-4 text-[#DCD0FF]" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('simulator')}
                className="w-full py-3 rounded-2xl bg-[#DCD0FF] hover:bg-[#CCC0EE] text-[#1A1C1A] text-xs font-black border border-[#B8A2FF] transition-all flex items-center justify-center space-x-2 active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                <span>Simulate Choice in Decision Mode (See 3 Futures)</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* MODE 5: REQUEST MONEY & GROUP BILL SPLITTER */}
      {payMode === 'request' && (
        <div className="max-w-2xl mx-auto bg-[#ffffff] rounded-3xl p-6 border border-[#E3E2E0] shadow-paper space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#F4F3F1]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DCD0FF] text-[#625981] flex items-center justify-center font-black text-xl">
                💰
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1A1C1A]">Group Bill Splitter & Request Box</h3>
                <p className="text-xs text-[#79757E]">Equal group bill splits, automated QRs & WhatsApp requests</p>
              </div>
            </div>

            <div className="flex space-x-1 bg-[#F4F3F1] p-1 rounded-xl text-xs font-extrabold border border-[#E3E2E0]">
              <button
                onClick={() => setSplitType('group')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  splitType === 'group' ? 'bg-[#1A1C1A] text-[#FAF9F6] shadow-xs' : 'text-[#79757E]'
                }`}
              >
                👥 Group Split
              </button>
              <button
                onClick={() => setSplitType('individual')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  splitType === 'individual' ? 'bg-[#1A1C1A] text-[#FAF9F6] shadow-xs' : 'text-[#79757E]'
                }`}
              >
                👤 Single Person
              </button>
            </div>
          </div>

          {/* GROUP BILL SPLITTER MODE */}
          {splitType === 'group' ? (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#48454E] block mb-1">Total Bill Amount ({currency})</label>
                  <input
                    type="number"
                    value={groupTotalAmount}
                    onChange={(e) => setGroupTotalAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-sm font-extrabold text-[#1A1C1A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#48454E] block mb-1">Bill Description / Note</label>
                  <input
                    type="text"
                    value={groupBillNote}
                    onChange={(e) => setGroupBillNote(e.target.value)}
                    placeholder="Weekend Dinner & Cabs"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A]"
                  />
                </div>
              </div>

              {/* Group Friends Manager */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#1A1C1A]">
                    Group Friends ({groupFriends.length} members)
                  </label>
                  <span className="text-[11px] font-bold text-[#27AE60] bg-[#E2F0D9] px-2.5 py-0.5 rounded-full">
                    Auto-Split: {formatCurrency(Math.round((parseFloat(groupTotalAmount) || 0) / Math.max(1, groupFriends.length)), currency)} / person
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {groupFriends.map((friendName, idx) => (
                    <div
                      key={friendName}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] flex items-center space-x-2 shadow-xs"
                    >
                      <span>{idx === 0 ? '👑 You (' + friendName + ')' : friendName}</span>
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setGroupFriends(groupFriends.filter((f) => f !== friendName))}
                          className="text-[#BA1A1A] font-black hover:scale-110 ml-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add friend's name (e.g. Sneha)"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFriendName.trim()) {
                        setGroupFriends([...groupFriends, newFriendName.trim()]);
                        setNewFriendName('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1A1C1A] text-[#FAF9F6] text-xs font-black hover:bg-[#2E312F]"
                  >
                    + Add Friend
                  </button>
                </div>
              </div>

              {/* Individual Split Summary & Entry Logger */}
              {groupFriends.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E3E2E0]">
                    <div>
                      <span className="text-xs font-extrabold text-[#1A1C1A] block">Group Split Summary</span>
                      <span className="text-[10px] text-[#79757E]">
                        Total {formatCurrency(parseFloat(groupTotalAmount) || 0, currency)} divided equally
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#60577F]">
                      {formatCurrency(Math.round((parseFloat(groupTotalAmount) || 0) / groupFriends.length), currency)} each
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const myShare = Math.round((parseFloat(groupTotalAmount) || 0) / groupFriends.length);
                        onAddTransaction({
                          title: `My Share: ${groupBillNote}`,
                          amount: myShare,
                          type: 'outflow',
                          categoryId: 'cat-food',
                          categoryName: 'Group Bill Share',
                          date: new Date().toISOString().split('T')[0],
                          merchant: 'Group Bill',
                          paymentMethod: 'UPI',
                          notes: `Group Bill Total ₹${groupTotalAmount} for ${groupFriends.length} friends`,
                        });
                        alert(`✅ Only your share (${formatCurrency(myShare, currency)}) was recorded in your spend entries!`);
                      }}
                      className="w-full py-3 rounded-xl bg-[#1A1C1A] text-[#FAF9F6] text-xs font-extrabold hover:bg-[#2E312F] shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#70E000]" />
                      <span>Log ONLY My Share ({formatCurrency(Math.round((parseFloat(groupTotalAmount) || 0) / groupFriends.length), currency)}) into My Spend Entries</span>
                    </button>

                    {/* WhatsApp links per friend */}
                    <div className="pt-2 space-y-2">
                      <span className="text-[11px] font-bold text-[#79757E] uppercase block">Share Request via WhatsApp to Friends:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {groupFriends.slice(1).map((friend) => {
                          const friendShare = Math.round((parseFloat(groupTotalAmount) || 0) / groupFriends.length);
                          const upiStr = `upi://pay?pa=finova.user@okicici&pn=FINOVAUser&am=${friendShare}&tn=${encodeURIComponent(groupBillNote)}`;
                          return (
                            <a
                              key={friend}
                              href={`https://wa.me/?text=${encodeURIComponent(
                                `Hi ${friend}! Your share for "${groupBillNote}" is ${formatCurrency(friendShare, currency)}. Pay via FINOVA UPI link:\n${upiStr}\n\nThank you!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#1A1C1A] text-xs font-bold flex items-center justify-between transition-all"
                            >
                              <span>💬 Request {friend} ({formatCurrency(friendShare, currency)})</span>
                              <ExternalLink className="w-3.5 h-3.5 text-[#25D366]" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* SINGLE PERSON REQUEST MODE */
            <div className="space-y-3.5 animate-fade-in">
              <div>
                <label className="text-xs font-bold text-[#48454E] block mb-1">Friend Contact or UPI ID</label>
                <input
                  type="text"
                  value={reqPayer}
                  onChange={(e) => setReqPayer(e.target.value)}
                  placeholder="e.g. Pooja (9876543210 / pooja@okaxis)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#48454E] block mb-1">Amount Requested ({currency})</label>
                <input
                  type="number"
                  value={reqAmount}
                  onChange={(e) => setReqAmount(e.target.value)}
                  placeholder="250"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#48454E] block mb-1">Note / Reason for Bill Request</label>
                <input
                  type="text"
                  value={reqNote}
                  onChange={(e) => setReqNote(e.target.value)}
                  placeholder="Split for dinner / coffee"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] text-xs font-semibold text-[#1A1C1A]"
                />
              </div>

              <button
                onClick={() => {
                  const amtNum = parseFloat(reqAmount) || 250;
                  const upiStr = `upi://pay?pa=finova.user@okicici&pn=FINOVAUser&am=${amtNum}&tn=${encodeURIComponent(reqNote || 'Payment Request')}`;
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiStr)}`;
                  setGeneratedRequest({
                    upiLink: upiStr,
                    qrUrl,
                    payer: reqPayer || 'Friend',
                    amount: amtNum,
                    note: reqNote || 'Bill Split',
                    status: 'pending',
                  });
                }}
                className="w-full py-3.5 rounded-2xl bg-[#1A1C1A] text-[#FAF9F6] text-xs font-extrabold shadow-md hover:bg-[#2E312F] transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-[#DCD0FF]" />
                <span>Generate Automated QR & WhatsApp Request</span>
              </button>

              {generatedRequest && (
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-4 text-center">
                  <div className="bg-[#ffffff] p-3 rounded-2xl border border-[#E3E2E0] inline-block mx-auto shadow-sm">
                    <img src={generatedRequest.qrUrl} alt="Request QR" className="w-40 h-40 mx-auto rounded-lg" />
                  </div>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Hi ${generatedRequest.payer}! Please pay ${formatCurrency(generatedRequest.amount, currency)} for "${generatedRequest.note}" via FINOVA UPI link:\n${generatedRequest.upiLink}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-[#25D366] text-[#ffffff] font-extrabold text-xs flex items-center justify-center space-x-2 block"
                  >
                    <span>💬 Share via WhatsApp to {generatedRequest.payer}</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 6: UPI PAYMENT HISTORY */}
      {payMode === 'history' && (
        <div className="bg-[#ffffff] rounded-3xl p-6 border border-[#E3E2E0] shadow-paper space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#F4F3F1]">
            <div>
              <h3 className="text-base font-extrabold text-[#1A1C1A]">UPI Payment History</h3>
              <p className="text-xs text-[#79757E]">All auto-tracked transactions paid via UPI</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DCD0FF] text-[#60577F]">
              {upiTransactions.length} Payments
            </span>
          </div>

          <div className="divide-y divide-[#F4F3F1]">
            {upiTransactions.length === 0 ? (
              <p className="py-8 text-center text-xs font-medium text-[#79757E]">
                No UPI transactions logged yet. Try scanning a QR above!
              </p>
            ) : (
              upiTransactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-[#FAF9F6] px-2 rounded-xl">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#F4F3F1] border border-[#E3E2E0] flex items-center justify-center text-lg">
                      📱
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1C1A]">{tx.title}</h4>
                      <p className="text-[10px] text-[#79757E]">
                        {tx.upiId || 'UPI Direct'} • {tx.categoryName} • {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-[#1A1C1A]">
                      -{formatCurrency(tx.amount, currency)}
                    </span>
                    <span className="text-[9px] font-extrabold text-[#27AE60] bg-[#E2F0D9] px-1.5 py-0.5 rounded block mt-0.5">
                      Auto-Tracked ✓
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SMART PAYMENT CONFIRMATION MODAL (Hackathon Requirement!) */}
      {showSmartConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1C1A]/60 backdrop-blur-sm p-4">
          <div className="bg-[#ffffff] rounded-3xl w-full max-w-md border border-[#E3E2E0] shadow-modal overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-[#F4F3F1] pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#625981]" />
                <h3 className="text-base font-extrabold text-[#1A1C1A]">FINOVA Payment Check & Purpose</h3>
              </div>
              <button onClick={() => setShowSmartConfirmation(false)} className="text-[#79757E] hover:text-[#1A1C1A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-1 py-1">
              <span className="text-xs font-semibold text-[#79757E] uppercase block">You are about to pay</span>
              <div className="text-3xl font-black text-[#1A1C1A]">
                {formatCurrency(numAmount, currency)}
              </div>
              <span className="text-xs font-bold text-[#625981] block">
                To: {recipientName} ({recipientUpi})
              </span>
            </div>

            {/* Purpose Capture Field before Payment */}
            <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E3E2E0] space-y-2">
              <label className="text-xs font-bold text-[#1A1C1A] block">
                What is this payment for? (Auto-Categorization Purpose)
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {['Lunch', 'Bus', 'Books', 'Shopping', 'Recharge', 'Snacks'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleOneWordCategorize(p)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-extrabold border transition-all ${
                      oneWordInput.toLowerCase() === p.toLowerCase()
                        ? 'bg-[#1A1C1A] text-[#FAF9F6] border-[#1A1C1A]'
                        : 'bg-[#ffffff] text-[#1A1C1A] border-[#E3E2E0] hover:bg-[#E9E8E5]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type purpose (e.g. Cafeteria, Metro)..."
                value={oneWordInput}
                onChange={(e) => handleOneWordCategorize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#ffffff] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A]"
              />
            </div>

            {/* Financial Firewall Alert Banner */}
            {firewallViolation && (
              <div className="p-3.5 rounded-2xl bg-[#FFDAD6] border border-[#BA1A1A] text-[#BA1A1A] text-xs space-y-1 animate-pulse">
                <div className="flex items-center space-x-1.5 font-black">
                  <AlertTriangle className="w-4 h-4 text-[#BA1A1A]" />
                  <span>Financial Firewall Lockdown Triggered</span>
                </div>
                <p className="font-bold leading-relaxed">{firewallViolation}</p>
              </div>
            )}

            {/* Dream Product Impact Warning */}
            <div className="p-3.5 rounded-2xl bg-[#1A1C1A] text-[#FAF9F6] border border-[#8B5CF6]/40 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-black text-[#00FF66]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dream Product Target Impact ({goalTitle})</span>
              </div>
              <p className="text-[#D3D1D8] font-medium leading-relaxed">
                If you spend <strong>{formatCurrency(numAmount, currency)}</strong> on {currentCategoryObj.name.toLowerCase()}, your <strong>{goalTitle}</strong> purchase goal will be delayed by <strong>~{goalDelayDays} days</strong>!
              </p>
            </div>

            {/* Smart Coach Advice Alert */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              isOverBudget
                ? 'bg-[#FFF3E0] border-[#FFE0B2] text-[#E65100]'
                : 'bg-[#F5F5DC] border-[#E3E2E0] text-[#1A1C1A]'
            }`}>
              <div className="flex items-center space-x-2 font-bold">
                <AlertTriangle className={`w-4 h-4 ${isOverBudget ? 'text-[#E65100]' : 'text-[#625981]'}`} />
                <span>FINOVA Money Shield Advice</span>
              </div>

              <p className="leading-relaxed">
                {isOverBudget ? (
                  <>
                    ⚠️ <strong>Warning:</strong> This payment will take you over your monthly <strong>{currentCategoryObj.name}</strong> budget by <strong>{formatCurrency(budgetDifference, currency)}</strong>!
                  </>
                ) : (
                  <>
                    💡 You have spent <strong>{formatCurrency(currentCategorySpent, currency)}</strong> of your <strong>{formatCurrency(categoryBudget, currency)}</strong> {currentCategoryObj.name.toLowerCase()} budget. After this payment, you will have <strong>{formatCurrency(remainingInBudget, currency)}</strong> remaining.
                  </>
                )}
              </p>
            </div>

            {/* Choose UPI Provider & Trigger */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-[#79757E] uppercase block text-center">
                Select Authorized UPI App to Complete
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  className="p-2.5 rounded-xl bg-[#F4F3F1] hover:bg-[#E9E8E5] border border-[#E3E2E0] text-xs font-bold flex items-center justify-center space-x-1.5 text-[#1A1C1A]"
                >
                  <span className="text-base">🔵</span>
                  <span>Google Pay</span>
                </button>
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  className="p-2.5 rounded-xl bg-[#F4F3F1] hover:bg-[#E9E8E5] border border-[#E3E2E0] text-xs font-bold flex items-center justify-center space-x-1.5 text-[#1A1C1A]"
                >
                  <span className="text-base">🟣</span>
                  <span>PhonePe</span>
                </button>
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  className="p-2.5 rounded-xl bg-[#F4F3F1] hover:bg-[#E9E8E5] border border-[#E3E2E0] text-xs font-bold flex items-center justify-center space-x-1.5 text-[#1A1C1A]"
                >
                  <span className="text-base">🔷</span>
                  <span>Paytm</span>
                </button>
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  className="p-2.5 rounded-xl bg-[#F4F3F1] hover:bg-[#E9E8E5] border border-[#E3E2E0] text-xs font-bold flex items-center justify-center space-x-1.5 text-[#1A1C1A]"
                >
                  <span className="text-base">🟠</span>
                  <span>BHIM UPI</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-1">
              <button
                onClick={() => setShowSmartConfirmation(false)}
                className="flex-1 py-3 rounded-2xl bg-[#F4F3F1] hover:bg-[#E9E8E5] text-[#1A1C1A] text-xs font-bold transition-all"
              >
                Cancel
              </button>

              <button
                disabled={isProcessing}
                onClick={handleExecutePayment}
                className="flex-1 py-3 rounded-2xl bg-[#1A1C1A] hover:bg-[#2E312F] text-[#FAF9F6] text-xs font-extrabold transition-all shadow-md flex items-center justify-center space-x-2 active:scale-95"
              >
                {isProcessing ? (
                  <span>Launching UPI App...</span>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 text-[#00FF66]" />
                    <span>Pay & Launch GPay</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PAYMENT SUCCESSFUL & AUTO-TRACKED SHEET */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1C1A]/60 backdrop-blur-sm p-4">
          <div className="bg-[#ffffff] rounded-3xl w-full max-w-md border border-[#E3E2E0] shadow-modal overflow-hidden p-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Green Check Animation */}
            <div className="w-16 h-16 rounded-full bg-[#E2F0D9] text-[#27AE60] flex items-center justify-center mx-auto text-3xl shadow-sm">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold text-[#27AE60] uppercase tracking-wider block">
                ✅ Payment Successful
              </span>
              <h3 className="text-3xl font-black text-[#1A1C1A]">
                {formatCurrency(paymentSuccess.amount, currency)}
              </h3>
              <p className="text-xs font-bold text-[#79757E]">
                Paid to {paymentSuccess.title} ({paymentSuccess.upiId})
              </p>
            </div>

            {/* One-Word Auto Categorization Feature */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E3E2E0] text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1C1A] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#625981]" />
                  What was this payment for?
                </span>
                <span className="text-[10px] text-[#79757E] font-medium">Say 1 Word</span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Lunch', emoji: '🍔' },
                  { name: 'Bus', emoji: '🚌' },
                  { name: 'Notebook', emoji: '📚' },
                  { name: 'Shopping', emoji: '🛍️' },
                  { name: 'Movie', emoji: '🎬' },
                  { name: 'Recharge', emoji: '📱' },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleOneWordCategorize(item.name)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                      oneWordInput.toLowerCase() === item.name.toLowerCase()
                        ? 'bg-[#1A1C1A] text-[#FAF9F6] border-[#1A1C1A]'
                        : 'bg-[#ffffff] text-[#1A1C1A] border-[#E3E2E0] hover:bg-[#E9E8E5]'
                    }`}
                  >
                    {item.emoji} {item.name}
                  </button>
                ))}
              </div>

              {/* One Word Input Field */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type 1 word (e.g. Cafeteria, Bus)..."
                  value={oneWordInput}
                  onChange={(e) => handleOneWordCategorize(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#ffffff] border border-[#E3E2E0] text-xs font-semibold text-[#1A1C1A] focus:outline-none focus:border-[#625981]"
                />
              </div>

              {detectedCategoryName && (
                <div className="text-[11px] text-[#27AE60] font-bold bg-[#E2F0D9] p-2 rounded-xl flex items-center justify-between">
                  <span>🤖 Finova detected category:</span>
                  <span className="uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-[#ffffff] text-[#1A1C1A] shadow-xs">
                    {detectedCategoryName}
                  </span>
                </div>
              )}
            </div>

            {/* Auto-Tracked Confirmation Badge */}
            <div className="bg-[#F5F5DC] p-3 rounded-2xl border border-[#E3E2E0] text-xs text-left space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-[#1A1C1A]">
                <ShieldCheck className="w-4 h-4 text-[#27AE60]" />
                <span>Added to Expenses & Budget Updated</span>
              </div>
              <p className="text-[11px] text-[#48454E]">
                "Pay once. Say one word. Finova tracks the rest."
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setPaymentSuccess(null);
                  setPayMode('qr');
                }}
                className="flex-1 py-3 rounded-2xl bg-[#F4F3F1] text-[#1A1C1A] text-xs font-bold"
              >
                Done
              </button>

              <button
                onClick={() => {
                  setPaymentSuccess(null);
                  onNavigate('transactions');
                }}
                className="flex-1 py-3 rounded-2xl bg-[#1A1C1A] text-[#FAF9F6] text-xs font-bold shadow-md"
              >
                View Ledger
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
