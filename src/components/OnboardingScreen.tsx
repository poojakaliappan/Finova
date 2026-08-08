import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, ArrowRight, ShieldCheck, Sparkles, User, X } from 'lucide-react';
import { DEMO_USERS } from '../data/mockData';
import { UserProfile } from '../types';

interface OnboardingScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'main' | 'mobile' | 'email'>('main');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  const handleSelectGoogleAccount = (user: UserProfile) => {
    onLoginSuccess(user);
  };

  const handleGuestLogin = () => {
    onLoginSuccess({
      id: 'user-guest',
      name: 'Pooja (Guest)',
      email: 'pooja.guest@finova.app',
      upiId: 'guest@finova',
      isGuest: true,
    });
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setOtpSent(true);
    setOtpError('');
    setResendTimer(30);
    setOtp('1234'); // Pre-fill mock OTP for smooth demo
  };

  const handleResendOtp = () => {
    setOtpSent(true);
    setOtpError('');
    setResendTimer(30);
    setOtp('1234');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234') {
      setOtpError('❌ Invalid OTP! Enter 1234 to proceed.');
      return;
    }

    onLoginSuccess({
      id: `user-phone-${phoneNumber}`,
      name: 'Pooja Kaliappan',
      email: `${phoneNumber}@phone.finova`,
      upiId: `${phoneNumber}@paytm`,
      isGuest: false,
    });
  };

  const handleSendEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setOtpSent(true);
    setOtpError('');
    setResendTimer(30);
    setOtp('5678');
  };

  const handleVerifyEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '5678') {
      setOtpError('❌ Invalid OTP! Enter 5678 to proceed.');
      return;
    }

    onLoginSuccess({
      id: `user-email-${emailInput}`,
      name: emailInput.split('@')[0] || 'Pooja',
      email: emailInput,
      upiId: `${emailInput.split('@')[0]}@okaxis`,
      isGuest: false,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1C1A] flex flex-col justify-between p-6 max-w-md mx-auto selection:bg-[#DCD0FF] relative">
      
      {/* Top Header branding */}
      <div className="pt-6 space-y-2 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#DCD0FF]/60 border border-[#E3E2E0] text-xs font-semibold text-[#625981]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Welcome to Finova</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#1A1C1A]">Start Managing Smartly</h2>
        <p className="text-xs text-[#79757e]">
          Connect your account to sync transactions, budgets & smart tips across devices.
        </p>
      </div>

      {/* Center Auth Options */}
      <div className="my-auto py-8 space-y-4">

        {activeTab === 'main' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            
            {/* Google Login Trigger */}
            <button
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#ffffff] hover:bg-[#FAF9F6] text-[#1A1C1A] font-bold text-xs border border-[#E3E2E0] shadow-sm transition-all flex items-center justify-center space-x-3 active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Mobile Number Login */}
            <button
              onClick={() => { setActiveTab('mobile'); setOtpSent(false); }}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#ffffff] hover:bg-[#FAF9F6] text-[#1A1C1A] font-bold text-xs border border-[#E3E2E0] shadow-sm transition-all flex items-center justify-center space-x-3 active:scale-98"
            >
              <Phone className="w-4 h-4 text-[#625981]" />
              <span>Continue with Mobile Number</span>
            </button>

            {/* Email Login */}
            <button
              onClick={() => { setActiveTab('email'); setOtpSent(false); }}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#ffffff] hover:bg-[#FAF9F6] text-[#1A1C1A] font-bold text-xs border border-[#E3E2E0] shadow-sm transition-all flex items-center justify-center space-x-3 active:scale-98"
            >
              <Mail className="w-4 h-4 text-[#625981]" />
              <span>Continue with Email</span>
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-[#E3E2E0]"></div>
              <span className="absolute bg-[#FAF9F6] px-3 text-[10px] font-bold uppercase tracking-wider text-[#79757e]">
                OR
              </span>
            </div>

            {/* Guest Mode */}
            <button
              onClick={handleGuestLogin}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#F5F5DC] hover:bg-[#EAE8D5] text-[#1A1C1A] font-extrabold text-xs border border-[#E3E2E0] shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-98"
            >
              <User className="w-4 h-4 text-[#625981]" />
              <span>Continue in Guest Mode</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#625981]" />
            </button>

          </motion.div>
        )}

        {/* Mobile Verification Form */}
        {activeTab === 'mobile' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 bg-[#ffffff] p-5 rounded-2xl border border-[#E3E2E0]">
            <h3 className="text-sm font-bold text-[#1A1C1A]">Enter Mobile Number</h3>
            
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="flex space-x-2">
                  <span className="px-3 py-2.5 rounded-xl bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] focus:outline-none focus:border-[#625981]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#1A1C1A] text-[#FAF9F6] text-xs font-bold"
                >
                  Send Mobile OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <p className="text-[11px] text-[#27AE60] font-semibold bg-[#E2F0D9] p-2 rounded-xl flex justify-between items-center">
                  <span>✓ OTP 1234 sent to +91 {phoneNumber}</span>
                  <span className="text-[10px] text-[#60577F] font-bold">SMS Sent</span>
                </p>

                {otpError && (
                  <p className="text-[11px] text-[#C62828] font-bold bg-[#FFEBEE] p-2 rounded-xl border border-[#FFCDD2]">
                    {otpError}
                  </p>
                )}

                <input
                  type="text"
                  required
                  placeholder="Enter 4-digit OTP (1234)"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-bold text-center tracking-widest text-[#1A1C1A] focus:outline-none"
                />

                <div className="flex items-center justify-between text-[11px]">
                  {resendTimer > 0 ? (
                    <span className="text-[#79757E]">⏱️ Resend OTP in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#625981] font-bold underline hover:text-[#1A1C1A]"
                    >
                      ⏱️ Resend New OTP
                    </button>
                  )}
                  <span className="text-[#79757E]">Backend Verified</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#DCD0FF] text-[#1A1C1A] text-xs font-bold hover:bg-[#CCC0EE] shadow-sm transition-all"
                >
                  Verify OTP & Login
                </button>
              </form>
            )}

            <button
              onClick={() => { setActiveTab('main'); setOtpSent(false); }}
              className="w-full text-center text-xs text-[#79757e] hover:underline pt-1"
            >
              Back to options
            </button>
          </motion.div>
        )}

        {/* Email Login Form */}
        {activeTab === 'email' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 bg-[#ffffff] p-5 rounded-2xl border border-[#E3E2E0]">
            <h3 className="text-sm font-bold text-[#1A1C1A]">Enter Email Address</h3>
            
            {!otpSent ? (
              <form onSubmit={handleSendEmailOtp} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="pooja@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-bold text-[#1A1C1A] focus:outline-none focus:border-[#625981]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#1A1C1A] text-[#FAF9F6] text-xs font-bold"
                >
                  Send Email OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailOtp} className="space-y-3">
                <p className="text-[11px] text-[#27AE60] font-semibold bg-[#E2F0D9] p-2 rounded-xl">
                  ✓ OTP 5678 sent to {emailInput}
                </p>
                <input
                  type="text"
                  required
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F4F3F1] border border-[#E3E2E0] text-xs font-bold text-center tracking-widest text-[#1A1C1A] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#DCD0FF] text-[#1A1C1A] text-xs font-bold"
                >
                  Verify Email & Login
                </button>
              </form>
            )}

            <button
              onClick={() => { setActiveTab('main'); setOtpSent(false); }}
              className="w-full text-center text-xs text-[#79757e] hover:underline pt-1"
            >
              Back to options
            </button>
          </motion.div>
        )}

      </div>

      {/* GOOGLE ACCOUNT SELECTION MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1C1A]/60 backdrop-blur-sm p-4">
          <div className="bg-[#ffffff] rounded-3xl w-full max-w-sm border border-[#E3E2E0] shadow-modal overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#F4F3F1]">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 className="text-sm font-extrabold text-[#1A1C1A]">Choose Google Account</h3>
              </div>
              <button onClick={() => setShowGoogleModal(false)} className="text-[#79757E]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-[#79757E]">
              Select account to log into your private Finova financial space:
            </p>

            <div className="space-y-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectGoogleAccount(user)}
                  className="w-full p-3 rounded-2xl bg-[#FAF9F6] hover:bg-[#DCD0FF]/40 border border-[#E3E2E0] transition-all flex items-center space-x-3 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1A1C1A] text-[#FAF9F6] font-bold flex items-center justify-center text-sm shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1A1C1A] block">{user.name}</span>
                    <span className="text-[10px] text-[#79757E] font-medium block">{user.email}</span>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Footer Features Trust */}
      <div className="pt-4 border-t border-[#E3E2E0] flex items-center justify-center space-x-2 text-[11px] text-[#79757e]">
        <ShieldCheck className="w-4 h-4 text-[#27AE60]" />
        <span>100% Secure • Private User Data Isolation</span>
      </div>

    </div>
  );
};
