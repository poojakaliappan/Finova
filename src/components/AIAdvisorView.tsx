import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Lightbulb, 
  PieChart, 
  TrendingDown, 
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { AIAdvisorMessage, Transaction, Category } from '../types';

interface AIAdvisorViewProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({
  transactions,
  categories,
  currency,
}) => {
  const [messages, setMessages] = useState<AIAdvisorMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: "Hello! I am Finova AI, your calm personal finance guide. I've analyzed your recent ledger and spending trends. How can I help you optimize your wealth today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Audit my monthly subscriptions',
        'How can I save 50% of my income?',
        'Analyze my dining out expenses',
        'Recommend a 50/30/20 budget breakdown',
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: AIAdvisorMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    // Prepare financial context for Gemini
    const totalInflow = transactions.filter((t) => t.type === 'inflow').reduce((sum, t) => sum + t.amount, 0);
    const totalOutflow = transactions.filter((t) => t.type === 'outflow').reduce((sum, t) => sum + t.amount, 0);

    const financialContext = {
      totalBalance: totalInflow - totalOutflow,
      monthlyIncome: totalInflow,
      monthlyExpenses: totalOutflow,
      savingsRatePercentage: totalInflow > 0 ? Math.round(((totalInflow - totalOutflow) / totalInflow) * 100) : 0,
      topCategories: categories.map((c) => ({
        name: c.name,
        spent: transactions.filter((t) => t.categoryId === c.id && t.type === 'outflow').reduce((s, t) => s + t.amount, 0),
      })),
    };

    try {
      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          financialContext,
          conversationHistory: messages.slice(-6),
        }),
      });

      const data = await response.json();

      const aiMsg: AIAdvisorMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'I am happy to assist with your financial planning.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'What are my highest expense items?',
          'How does my savings rate compare?',
          'Suggest cost cutting ideas',
        ],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: AIAdvisorMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an issue connecting to the financial intelligence engine. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-[#f5f5dc] rounded-2xl p-6 border border-[#e3e2e0] shadow-paper flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#dcd0ff] text-[#625981] flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1a1c1a]">Finova AI Financial Guide</h2>
            <p className="text-xs text-[#79757e]">Powered by Gemini server-side intelligence for calm, tailored money advice.</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2.5 rounded-xl bg-[#ffffff] hover:bg-[#faf9f6] text-[#79757e] border border-[#e3e2e0] transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e3e2e0] shadow-paper min-h-[480px] flex flex-col justify-between overflow-hidden">
        
        {/* Messages Feed */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[520px]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                    isUser
                      ? 'bg-[#1a1c1a] text-[#ffffff]'
                      : 'bg-[#dcd0ff] text-[#625981]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`space-y-2 max-w-xl ${isUser ? 'items-end text-right' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-5 py-3.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#1a1c1a] text-[#ffffff] rounded-tr-none'
                        : 'bg-[#faf9f6] border border-[#e3e2e0] text-[#1a1c1a] rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>

                  <span className="block text-[10px] text-[#79757e] px-1 font-medium">
                    {msg.timestamp}
                  </span>

                  {/* Suggested Quick Prompt Chips from Assistant */}
                  {!isUser && msg.suggestedActions && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(action)}
                          className="px-3 py-1.5 rounded-xl bg-[#f4f3f1] hover:bg-[#dcd0ff]/50 text-[#60577f] text-[11px] font-semibold border border-[#e3e2e0] transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-[#dcd0ff] text-[#625981] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#faf9f6] border border-[#e3e2e0] rounded-2xl px-4 py-3 text-xs text-[#79757e] flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#625981]" />
                <span>Finova AI is analyzing your ledger...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#e3e2e0] bg-[#faf9f6]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask about budgets, expenses, investments, or savings..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-xs bg-[#ffffff] border border-[#e3e2e0] focus:outline-none focus:border-[#625981] text-[#1a1c1a] shadow-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 bg-[#dcd0ff] hover:bg-[#ccc0ee] disabled:opacity-50 text-[#1a1c1a] rounded-xl transition-all shadow-sm shrink-0"
            >
              <Send className="w-4 h-4 text-[#625981]" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
