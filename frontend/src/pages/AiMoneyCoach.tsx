import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Bot, Send, Sparkles, User, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export const AiMoneyCoach: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial welcome message from Coach
    api.askAiCoach().then((res) => {
      setMessages([
        {
          id: 'welcome',
          sender: 'coach',
          text: `Hey! I'm your RupeeWise AI Money Coach. ${res.context_summary} What financial move would you like to review today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }).catch(console.error);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      setLoading(true);
      const res = await api.askAiCoach(userText);
      const coachMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: res.advice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      alert(err.message || 'AI Coach unavailable');
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Can I afford to go to an expensive restaurant tonight?",
    "Should I cancel my streaming subscriptions?",
    "How can I save ₹2,000 before Day 30?",
    "What is my biggest financial risk right now?"
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>RupeeWise AI Money Coach</h1>
          <span className="badge badge-purple">Context-Aware AI</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Real-time financial guidance anchored in your live ₹10k budget constraints and pending commitments.
        </p>
      </div>

      {/* Chat History Panel */}
      <div className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}
            >
              {m.sender === 'coach' && (
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Bot size={20} color="#fff" />
                </div>
              )}

              <div style={{
                background: m.sender === 'user' ? '#a3e635' : 'rgba(255, 255, 255, 0.05)',
                color: m.sender === 'user' ? '#090d16' : '#fff',
                padding: '14px 18px',
                borderRadius: '16px',
                border: m.sender === 'coach' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                fontWeight: m.sender === 'user' ? 600 : 400,
                fontSize: '14px',
                lineHeight: 1.5
              }}>
                <div>{m.text}</div>
                <div style={{ fontSize: '10px', color: m.sender === 'user' ? 'rgba(0,0,0,0.6)' : '#64748b', marginTop: '6px', textAlign: 'right' }}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="#a855f7" />
              </div>
              <div style={{ padding: '12px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '13px' }}>
                Coach is analyzing budget state...
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => setInput(p)}
              style={{
                flexShrink: 0,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <input
            type="text"
            placeholder="Ask your coach anything about your finances..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)',
              color: '#090d16',
              fontWeight: 700,
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
