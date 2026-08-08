import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { VoiceSettings } from '../types';

interface VoiceAssistanceProps {
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (newVoice: Partial<VoiceSettings>) => void;
  onTriggerAlert?: (text: string) => void;
}

export const VoiceAssistance: React.FC<VoiceAssistanceProps> = ({
  voiceSettings,
  onUpdateVoiceSettings,
  onTriggerAlert,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [speechStatus, setSpeechStatus] = useState<string | null>(null);

  // Function to speak aloud text using Web Speech API
  const speakText = (text: string) => {
    if (!voiceSettings.isEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.speechRate || 1.0;
      utterance.onstart = () => setSpeechStatus(`Speaking: "${text}"`);
      utterance.onend = () => setSpeechStatus(null);
      utterance.onerror = () => setSpeechStatus(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Request Microphone Permission
  const handleRequestMicPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        onUpdateVoiceSettings({ hasMicPermission: true });
        speakText("Microphone permission granted! FINOVA AI Voice is now listening and active.");
      } else {
        alert("Microphone API is not supported in this browser environment.");
      }
    } catch (err) {
      onUpdateVoiceSettings({ hasMicPermission: false });
      alert("Microphone access was denied. You can enable text-only notifications in settings.");
    }
  };

  // Toggle speech recognition listening
  const toggleListening = () => {
    if (!voiceSettings.hasMicPermission) {
      handleRequestMicPermission();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition API is not supported in this browser. Voice notifications remain active.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      setSpeechStatus(null);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechStatus('Listening for voice commands...');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setLastTranscript(transcript);
          setIsListening(false);
          setSpeechStatus(`Command received: "${transcript}"`);
          speakText(`FINOVA processed: ${transcript}`);
        };

        recognition.onerror = () => {
          setIsListening(false);
          setSpeechStatus(null);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  return (
    <div className="bg-[#1A1C1A] text-[#FAF9F6] p-4 rounded-2xl border border-[#3E423F] shadow-lg flex items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
          isListening ? 'bg-[#FF8585] text-[#1A1C1A] animate-pulse' : 'bg-[#DCD0FF]/20 text-[#DCD0FF]'
        }`}>
          {voiceSettings.isEnabled ? <Volume2 className="w-5 h-5 text-[#DCD0FF]" /> : <VolumeX className="w-5 h-5 text-[#FF8585]" />}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-[#FAF9F6]">FINOVA Voice Integration</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
              voiceSettings.isEnabled ? 'bg-[#E2F0D9] text-[#27AE60]' : 'bg-[#3E423F] text-[#A09CA8]'
            }`}>
              {voiceSettings.isEnabled ? 'Speech Active' : 'Text Only'}
            </span>
          </div>
          <p className="text-[11px] text-[#A09CA8] truncate max-w-xs">
            {speechStatus || (voiceSettings.hasMicPermission ? 'Mic Ready • Auto-reads budget alerts' : 'Mic permission required for voice commands')}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {!voiceSettings.hasMicPermission ? (
          <button
            onClick={handleRequestMicPermission}
            className="px-3 py-1.5 rounded-xl bg-[#DCD0FF] hover:bg-[#CCC0EE] text-[#1A1C1A] font-extrabold text-xs transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Enable Mic</span>
          </button>
        ) : (
          <button
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-all ${
              isListening ? 'bg-[#BA1A1A] text-[#ffffff]' : 'bg-[#2E312F] text-[#DCD0FF] hover:bg-[#3E423F]'
            }`}
            title="Listen for Voice Command"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        <button
          onClick={() => speakText("Test alert: Your daily budget is ₹500 and you have ₹250 remaining.")}
          className="px-2.5 py-1.5 rounded-xl bg-[#2E312F] text-[#DCD0FF] text-[11px] font-bold hover:bg-[#3E423F] border border-[#3E423F]"
        >
          Test Voice
        </button>
      </div>
    </div>
  );
};
