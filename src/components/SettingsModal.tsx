import React, { useState } from 'react';
import { X, RefreshCw, Trash2, Globe, Check, Shield, Mic, Volume2, AlertTriangle, Sparkles } from 'lucide-react';
import { CURRENCY_SYMBOLS } from '../utils/formatters';
import { FinancialFirewallRules, VoiceSettings, InvisibleWalletState } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  onSelectCurrency: (code: string) => void;
  onResetSeedData: () => void;
  onClearData: () => void;
  firewallRules: FinancialFirewallRules;
  onUpdateFirewallRules: (newRules: Partial<FinancialFirewallRules>) => void;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (newVoice: Partial<VoiceSettings>) => void;
  invisibleWalletState: InvisibleWalletState;
  onUpdateInvisibleWalletState: (newState: Partial<InvisibleWalletState>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currency,
  onSelectCurrency,
  onResetSeedData,
  onClearData,
  firewallRules,
  onUpdateFirewallRules,
  voiceSettings,
  onUpdateVoiceSettings,
  invisibleWalletState,
  onUpdateInvisibleWalletState,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'firewall' | 'voice' | 'wallet'>('general');

  if (!isOpen) return null;

  const handleTestVoiceSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("FINOVA AI Voice active. Your financial firewall and notification alerts are fully protected!");
      utterance.rate = voiceSettings.speechRate || 1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis is not supported in this browser.");
    }
  };

  const handleRequestMic = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        onUpdateVoiceSettings({ hasMicPermission: true });
        alert("Microphone permission granted successfully!");
      } else {
        alert("Microphone API not supported in this browser frame.");
      }
    } catch (err) {
      onUpdateVoiceSettings({ hasMicPermission: false });
      alert("Microphone permission was denied.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1c1a]/40 backdrop-blur-sm p-4">
      <div className="bg-[#ffffff] rounded-3xl w-full max-w-lg border border-[#e3e2e0] shadow-modal overflow-hidden p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e3e2e0]">
          <div>
            <h3 className="text-lg font-black text-[#1a1c1a]">Finova System Preferences</h3>
            <p className="text-xs text-[#79757e]">Control Financial Firewall, AI Voice, & Secret Goal Vault.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#e9e8e5] text-[#79757e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Row inside Settings */}
        <div className="flex space-x-1 bg-[#F4F3F1] p-1 rounded-2xl border border-[#E3E2E0] text-xs font-bold">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'general' ? 'bg-[#ffffff] text-[#1a1c1a] shadow-xs' : 'text-[#79757e]'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('firewall')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'firewall' ? 'bg-[#ffffff] text-[#1a1c1a] shadow-xs' : 'text-[#79757e]'
            }`}
          >
            🔥 Firewall
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'voice' ? 'bg-[#ffffff] text-[#1a1c1a] shadow-xs' : 'text-[#79757e]'
            }`}
          >
            🎙️ AI Voice
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'wallet' ? 'bg-[#ffffff] text-[#1a1c1a] shadow-xs' : 'text-[#79757e]'
            }`}
          >
            🛡️ Secret Vault
          </button>
        </div>

        {/* TAB 1: General Preferences */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-fade-in">
            {/* Currency Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#48454e] flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-[#625981]" />
                <span>Display Currency</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(CURRENCY_SYMBOLS).map((code) => {
                  const isSelected = currency === code;
                  return (
                    <button
                      key={code}
                      onClick={() => onSelectCurrency(code)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#dcd0ff] border-[#625981] text-[#1a1c1a] shadow-sm'
                          : 'bg-[#f4f3f1] border-[#e3e2e0] text-[#48454e] hover:bg-[#e9e8e5]'
                      }`}
                    >
                      <span>{code} ({CURRENCY_SYMBOLS[code]})</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#625981]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data Management Section */}
            <div className="space-y-3 pt-3 border-t border-[#e3e2e0]">
              <label className="text-xs font-bold text-[#48454e]">Data Reset & Recovery</label>

              <button
                onClick={() => {
                  if (window.confirm("Restore default sample financial dataset?")) {
                    onResetSeedData();
                    onClose();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#f5f5dc] hover:bg-[#e1e1c9] text-[#1a1c1a] border border-[#e3e2e0] transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4 text-[#625981]" />
                <span>Restore Default Sample Dataset</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all transactions? This action cannot be undone.")) {
                    onClearData();
                    onClose();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#ffdad6]/60 hover:bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6] transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Ledger Transactions</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Financial Firewall Rules Panel */}
        {activeTab === 'firewall' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1A1C1A] text-[#FAF9F6]">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#00FF66]" />
                <div>
                  <h4 className="text-xs font-black">FINOVA Financial Firewall</h4>
                  <p className="text-[10px] text-[#A09CA8]">Blocks unsafe UPI payments before redirecting</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={firewallRules.isEnabled}
                onChange={(e) => onUpdateFirewallRules({ isEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#00FF66] cursor-pointer"
              />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-[#1A1C1A] block">Max Daily Food Limit ({currency})</span>
                  <span className="text-[10px] text-[#79757E]">Triggers block if daily food spending exceeds limit</span>
                </div>
                <input
                  type="number"
                  value={firewallRules.maxFoodPerDay}
                  onChange={(e) => onUpdateFirewallRules({ maxFoodPerDay: parseFloat(e.target.value) || 300 })}
                  className="w-20 px-2 py-1 rounded-lg bg-[#ffffff] border border-[#E3E2E0] text-center font-extrabold text-[#1A1C1A]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-[#1A1C1A] block">Max Single Transaction Limit ({currency})</span>
                  <span className="text-[10px] text-[#79757E]">Prevents impulse large single payments</span>
                </div>
                <input
                  type="number"
                  value={firewallRules.maxSingleTxLimit}
                  onChange={(e) => onUpdateFirewallRules({ maxSingleTxLimit: parseFloat(e.target.value) || 1000 })}
                  className="w-20 px-2 py-1 rounded-lg bg-[#ffffff] border border-[#E3E2E0] text-center font-extrabold text-[#1A1C1A]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-[#1A1C1A] block">🌙 Night Payment Lockdown (10 PM - 6 AM)</span>
                  <span className="text-[10px] text-[#79757E]">Blocks unnecessary late night impulse transactions</span>
                </div>
                <input
                  type="checkbox"
                  checked={firewallRules.noPaymentsAfter10PM}
                  onChange={(e) => onUpdateFirewallRules({ noPaymentsAfter10PM: e.target.checked })}
                  className="w-4 h-4 accent-[#1A1C1A] cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-[#1A1C1A] block">🛍️ Shopping Category Lockdown</span>
                  <span className="text-[10px] text-[#79757E]">Requires dual confirmation for all shopping merchants</span>
                </div>
                <input
                  type="checkbox"
                  checked={firewallRules.shoppingLockdown}
                  onChange={(e) => onUpdateFirewallRules({ shoppingLockdown: e.target.checked })}
                  className="w-4 h-4 accent-[#1A1C1A] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI Voice & Microphone Integration */}
        {activeTab === 'voice' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="p-4 rounded-2xl bg-[#1A1C1A] text-[#FAF9F6] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-[#DCD0FF]" />
                  <div>
                    <h4 className="font-black">AI Voice Speech Notifications</h4>
                    <p className="text-[10px] text-[#A09CA8]">Have FINOVA speak out budget & firewall warnings aloud</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={voiceSettings.isEnabled}
                  onChange={(e) => onUpdateVoiceSettings({ isEnabled: e.target.checked })}
                  className="w-5 h-5 accent-[#00FF66] cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleTestVoiceSpeech}
                  disabled={!voiceSettings.isEnabled}
                  className="flex-1 py-2 rounded-xl bg-[#00FF66] text-[#1A1C1A] font-black hover:bg-[#00E059] disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test AI Voice Speech</span>
                </button>

                <button
                  onClick={handleRequestMic}
                  className={`flex-1 py-2 rounded-xl font-black border transition-all flex items-center justify-center space-x-1.5 ${
                    voiceSettings.hasMicPermission
                      ? 'bg-[#E2F0D9] text-[#27AE60] border-[#27AE60]'
                      : 'bg-[#FAF9F6] text-[#1A1C1A] border-[#E3E2E0] hover:bg-[#E9E8E5]'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{voiceSettings.hasMicPermission ? 'Mic Granted ✓' : 'Enable Mic Option'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-2">
              <label className="font-extrabold text-[#1A1C1A] block">Voice Speech Speed</label>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.25"
                value={voiceSettings.speechRate}
                onChange={(e) => onUpdateVoiceSettings({ speechRate: parseFloat(e.target.value) })}
                className="w-full accent-[#1A1C1A]"
              />
              <div className="flex justify-between text-[10px] text-[#79757E] font-bold">
                <span>Slow (0.75x)</span>
                <span>Normal (1.0x)</span>
                <span>Fast (1.5x)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Secret / Invisible Goal Wallet Settings */}
        {activeTab === 'wallet' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2E0] space-y-3">
              <div className="flex items-center space-x-2 text-[#625981]">
                <Shield className="w-5 h-5 text-[#625981]" />
                <h4 className="font-black text-[#1A1C1A]">Dream Product Goal Settings</h4>
              </div>

              <div>
                <label className="font-bold text-[#48454E] block mb-1">Target Dream Product</label>
                <input
                  type="text"
                  value={invisibleWalletState.goalTitle}
                  onChange={(e) => onUpdateInvisibleWalletState({ goalTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#ffffff] border border-[#E3E2E0] font-bold text-[#1A1C1A]"
                  placeholder="MacBook Pro / Gaming Laptop"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#48454E] block mb-1">Target Price ({currency})</label>
                  <input
                    type="number"
                    value={invisibleWalletState.goalTargetAmount}
                    onChange={(e) => onUpdateInvisibleWalletState({ goalTargetAmount: parseFloat(e.target.value) || 50000 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#ffffff] border border-[#E3E2E0] font-bold text-[#1A1C1A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#48454E] block mb-1">Daily Goal Target ({currency})</label>
                  <input
                    type="number"
                    value={invisibleWalletState.dailyBudget}
                    onChange={(e) => onUpdateInvisibleWalletState({ dailyBudget: parseFloat(e.target.value) || 500 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#ffffff] border border-[#E3E2E0] font-bold text-[#1A1C1A]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

