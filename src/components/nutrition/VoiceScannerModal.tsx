import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, X, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { nutritionParser } from '../../services/nutritionParser';

interface VoiceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (text: string) => void;
}

const VoiceScannerModal: React.FC<VoiceScannerModalProps> = ({ isOpen, onClose, onAnalysisComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  // Inicializar Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; 
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Error:", event.error);
        if (event.error === 'not-allowed') {
          setError("Acceso al micrófono denegado.");
        } else {
          setError("Error al intentar escuchar.");
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError("Navegador no compatible con voz.");
    }
  }, []);

  // Limpiar estados al cerrar
  useEffect(() => {
    if (!isOpen) {
      setTranscript("");
      setIsAnalyzing(false);
      setIsListening(false);
      setError(null);
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError(null);
      setTranscript("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Start Error:", e);
      }
    }
  };

  const handleConfirm = async () => {
    if (!transcript) return;
    
    setIsAnalyzing(true);
    try {
      // 1. Enviamos el texto al Parser para extraer macros reales
      const foods = await nutritionParser.parseText(transcript);
      
      // 2. Enviamos los objetos detectados al componente padre
      // Lo enviamos como string para mantener la firma de la función actual
      onAnalysisComplete(JSON.stringify(foods));
      
      // 3. Éxito y cierre
      onClose();
    } catch (err) {
      setError("Error en el motor de análisis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-6">
      <div 
        className="absolute inset-0 bg-metra-dark/80 backdrop-blur-xl animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-white rounded-[3.5rem] p-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-metra-blue/5 blur-3xl rounded-full" />
        
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 relative">
            {isListening && (
              <div className="absolute -inset-4 bg-[#FF2D55]/20 rounded-full animate-ping" />
            )}
            <button 
              onClick={toggleListening}
              disabled={isAnalyzing}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${
                isListening ? 'bg-[#FF2D55] scale-110' : 'bg-metra-blue hover:scale-105'
              } disabled:opacity-50`}
            >
              {isAnalyzing ? (
                <Loader2 className="text-white animate-spin" size={32} />
              ) : (
                <Mic className="text-white" size={32} />
              )}
            </button>
          </div>

          <h3 className="text-2xl font-[1000] text-metra-dark uppercase italic tracking-tighter mb-2">
            {isListening ? "Escuchando..." : isAnalyzing ? "IA Analizando" : "Bio-Scanner Voz"}
          </h3>
          
          {error ? (
            <div className="flex items-center gap-2 text-red-500 mb-8 bg-red-50 px-4 py-2 rounded-full">
              <AlertCircle size={14} />
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          ) : (
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">
              {isListening ? "Habla ahora sobre tu comida" : "Pulsa el micro para dictar"}
            </p>
          )}

          {/* Transcript Display */}
          {(transcript || isListening) && (
            <div className={`w-full p-6 rounded-[2rem] mb-8 border transition-all duration-300 ${
              isListening ? 'bg-blue-50 border-metra-blue/20 shadow-inner' : 'bg-slate-50 border-slate-100'
            }`}>
              <p className="text-sm font-bold text-metra-dark italic leading-relaxed">
                {transcript || "..."}
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-metra-blue animate-pulse mb-8">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Extrayendo Macronutrientes...</span>
            </div>
          )}

          {!isListening && !isAnalyzing && transcript.length > 2 && (
            <button 
              onClick={handleConfirm}
              className="w-full bg-metra-dark text-white py-5 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <CheckCircle2 size={16} className="text-metra-green" /> Procesar con IA
            </button>
          )}
        </div>

        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default VoiceScannerModal;
