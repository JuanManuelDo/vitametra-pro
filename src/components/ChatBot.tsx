import React, { useState, useEffect, useRef } from 'react'
import { Send, Sparkles, CreditCard, X, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { type UserData } from '../types'

interface ChatBotProps { currentUser: UserData; }

const ChatBot: React.FC<ChatBotProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { id: '1', role: 'assistant', content: 'Bio-Core activo. ¿Analizamos tu última ingesta?', type: 'text' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const response = { id: (Date.now() + 1).toString(), role: 'assistant', content: input.toLowerCase().includes('pro') ? 'Vitametra PRO desbloquea análisis molecular avanzado.' : 'Sugerencia: Ingiere fibra antes de esos carbohidratos.', type: input.toLowerCase().includes('pro') ? 'cta' : 'text' };
      setMessages(prev => [...prev, response]);
    }, 800);
  };

  return (
    <>
      {/* El Orbe Flotante */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 z-[999] active:scale-90 ${
          isOpen ? 'scale-0 opacity-0' : 'bg-metra-blue shadow-[0_0_30px_rgba(0,122,255,0.4)] hover:shadow-metra-blue/60'
        }`}
      >
        <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-20" />
        <Zap className="text-white fill-white" size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-28 md:right-6 w-full md:w-[400px] h-[100dvh] md:h-[600px] bg-white/90 backdrop-blur-2xl md:rounded-[3rem] shadow-2xl flex flex-col z-[1000] border border-white/20 animate-in slide-in-from-right-10 duration-500">
          <header className="bg-metra-dark p-8 text-white flex justify-between items-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-metra-blue/10 animate-pulse" />
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 bg-metra-blue rounded-2xl flex items-center justify-center shadow-lg shadow-metra-blue/20">
                   <Sparkles size={20} className="text-white" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-metra-blue uppercase tracking-widest">Neural Link</p>
                   <h3 className="text-xl font-black italic tracking-tighter uppercase">Bio-Assistant</h3>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="bg-white/10 p-3 rounded-2xl relative z-10 hover:bg-white/20">
                <X size={20} />
             </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-3xl text-sm font-bold ${
                  msg.role === 'user' ? 'bg-metra-blue text-white rounded-tr-none' : 'bg-slate-100 text-metra-dark rounded-tl-none'
                }`}>
                  {msg.content}
                  {msg.type === 'cta' && (
                    <button onClick={() => navigate('/plans')} className="mt-4 w-full bg-metra-dark text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest">
                      <CreditCard size={14} /> Desbloquear PRO <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white border-t border-slate-50">
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Consulta al Bio-Core..."
                className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-6 pr-16 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 ring-metra-blue/10"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-metra-dark text-white p-3 rounded-xl shadow-lg">
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;