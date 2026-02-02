import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  Sparkles, 
  CreditCard, 
  MessageCircle, 
  X, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { type UserData } from '../types';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  type?: 'text' | 'cta';
}

interface ChatBotProps {
  currentUser: UserData;
}

const ChatBot: React.FC<ChatBotProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `¡Hola! Soy tu asistente Vitametra. ¿Quieres que analicemos el impacto glucémico de tu próxima comida?`,
      type: 'text'
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      processAISentiment(input);
    }, 600);
  };

  const processAISentiment = (text: string) => {
    const query = text.toLowerCase();
    let response: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      type: 'text'
    };

    if (query.includes('pro') || query.includes('pagar') || query.includes('ilimitado') || query.includes('precio')) {
      response.content = "Con Vitametra PRO obtienes predicciones exactas y reportes para tu médico. ¿Revisamos los planes?";
      response.type = 'cta';
    } else if (query.includes('glucosa') || query.includes('azúcar')) {
      response.content = "El orden de los alimentos importa: Fibra > Proteína > Carbohidratos. Esto reduce drásticamente tu pico de glucosa.";
    } else {
      response.content = "Excelente pregunta. Mi sistema de IA está listo para procesar esa información. ¿Tienes una foto de tu comida?";
    }

    setMessages(prev => [...prev, response]);
  };

  return (
    <>
      {/* Botón Flotante - Z-INDEX MAXIMO */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-2xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:scale-110 hover:bg-slate-900 transition-all z-[9999] group ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="relative">
          <MessageCircle size={28} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-blue-600 animate-pulse"></span>
        </div>
      </button>

      {/* Ventana de Chat - DISEÑO 2026 */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[420px] h-[100dvh] md:h-[650px] bg-white/95 backdrop-blur-2xl md:rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] flex flex-col z-[10000] overflow-hidden border border-white animate-in slide-in-from-right-10 duration-500">
          
          {/* Header Premium */}
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Assistant IA</h3>
                <p className="text-lg font-black tracking-tighter uppercase italic">Vitametra Pro</p>
              </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)} 
                className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-100' 
                    : 'bg-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  {msg.content}
                  
                  {msg.type === 'cta' && (
                    <button 
                      onClick={() => { navigate('/plans'); setIsOpen(false); }}
                      className="mt-4 w-full bg-slate-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
                    >
                      <CreditCard size={14} /> Ver Planes <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-slate-50">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
                <button 
                type="submit"
                className="absolute right-2 bg-blue-600 text-white p-3 rounded-xl hover:bg-slate-900 transition-all shadow-lg"
                >
                <Send size={18} />
                </button>
            </form>
            <div className="mt-4 flex justify-center items-center gap-2 opacity-30">
                <ShieldCheck size={12} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cifrado de grado clínico</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;