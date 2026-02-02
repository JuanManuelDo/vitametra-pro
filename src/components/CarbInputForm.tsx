import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { MetraCore } from '../services/metraCore'; // IMPORTANTE: El nuevo cerebro
import { Zap, Camera, Send, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { type UserData, type AnalysisResult, type HistoryEntry } from '../types';
import LimitReachedModal from './LimitReachedModal';
import { useNavigate } from 'react-router-dom';

interface Props {
  onSubmit: (data: AnalysisResult) => void;
  isLoading?: boolean;
  currentUser: UserData | null;
  history: HistoryEntry[]; // Añadimos el historial como prop para el aprendizaje
}

export const CarbInputForm: React.FC<Props> = ({ 
  currentUser, 
  onSubmit,
  history 
}) => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleProcessAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input && !imageB64) return;
    if (!currentUser) return alert("Debes iniciar sesión para usar la IA.");

    setIsProcessing(true);
    try {
      let result: AnalysisResult;

      // 1. ANÁLISIS CONTEXTUAL (Texto o Imagen)
      if (imageB64) {
        // La visión artificial ahora es contextual
        result = await apiService.analyzeFoodVision(imageB64, currentUser.id);
      } else {
        // USAMOS EL NUEVO METRA-CORE (Inferencia Inteligente)
        // Esto busca patrones en el 'history' antes de llamar a Gemini
        result = await MetraCore.processMetabolicInference(
            input, 
            history, 
            currentUser,
            100 // Glucemia base, el SaveModal la ajustará después con precisión
        );
      }

      // 2. PREPARAR ENTRADA PARA EL HISTORIAL
      const newEntry: Omit<HistoryEntry, 'id'> = {
        userId: currentUser.id,
        createdAt: new Date(),
        date: new Date().toISOString(),
        mealType: 'almuerzo', // Por defecto, el SaveModal permitirá cambiarlo
        userInput: input || "Análisis por foto",
        foodName: result.items?.[0]?.food || input.substring(0, 25) || "Plato detectado",
        items: result.items || [],
        totalCarbs: result.totalCarbs,
        glycemicIndex: result.glycemicIndex || 'medio',
        isCalibrated: false,
        recommendedInsulinUnits: result.prediction?.suggestedInsulin || 0
      };

      // Guardamos el registro preliminar
      await apiService.saveHistoryEntry(newEntry);
      
      // 3. ÉXITO Y FEEDBACK
      onSubmit(result);
      setInput('');
      setImageB64(null);
      
    } catch (error: any) {
      if (error.message === "LIMIT_REACHED") {
        setShowLimitModal(true);
      } else {
        console.error("MetraCore Error:", error);
        alert("La IA está sincronizando tus patrones metabólicos. Reintenta en unos segundos.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageB64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-50 shadow-2xl shadow-blue-900/5 relative overflow-hidden group">
        {/* EFECTO DE FONDO IA */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors duration-700" />

        {/* Badge de uso diario */}
        {currentUser?.subscription_tier !== 'PRO' && (
          <div className="absolute top-6 right-8 flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-slate-100 shadow-sm">
            <Sparkles size={10} className="text-blue-500 animate-pulse" />
            <span className="text-[9px] font-[900] text-slate-400 uppercase tracking-tighter">
              {currentUser?.daily_ia_usage || 0} de 3 IA Credits
            </span>
          </div>
        )}

        <form onSubmit={handleProcessAnalysis} className="space-y-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-xl shadow-slate-200 rotate-3 group-hover:rotate-0 transition-transform">
              <BrainCircuit size={22} className="text-blue-400" />
            </div>
            <div>
                <h2 className="text-xl font-[1000] text-slate-800 tracking-tighter uppercase italic leading-none">Bio-Analizador</h2>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">Predictive Intelligence</p>
            </div>
          </div>

          <div className="relative">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ej: Plato de tallarines con salsa roja y una manzana..."
                className="w-full h-40 p-8 rounded-[2.5rem] bg-slate-50 border-none focus:ring-4 focus:ring-blue-50 focus:bg-white text-slate-700 font-bold transition-all resize-none placeholder:text-slate-300 shadow-inner text-lg"
            />
            {isProcessing && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center gap-3 animate-in fade-in">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Calculando Bio-Impacto...</span>
                </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex-1 flex items-center justify-center gap-4 p-6 rounded-[2rem] border-2 border-dashed border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all group/btn">
              <div className={`p-3 rounded-xl transition-colors ${imageB64 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover/btn:bg-blue-100'}`}>
                <Camera size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                  {imageB64 ? "Foto Lista" : "Subir Foto"}
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Vision Engine</p>
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            <button
              type="submit"
              disabled={isProcessing || (!input && !imageB64)}
              className="flex-[1.5] bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white rounded-[2rem] font-[1000] p-6 flex items-center justify-center gap-4 transition-all shadow-2xl shadow-blue-100 active:scale-95 group/save"
            >
              <span className="tracking-widest text-xs uppercase italic">Ejecutar Análisis IA</span>
              <div className="bg-white/20 p-2 rounded-lg group-hover/save:translate-x-1 transition-transform">
                <Send size={18} />
              </div>
            </button>
          </div>
        </form>
      </div>

      {showLimitModal && (
        <LimitReachedModal 
          onClose={() => setShowLimitModal(false)} 
          onUpgradeClick={() => { setShowLimitModal(false); navigate('/plans'); }}
        />
      )}
    </>
  );
};

export default CarbInputForm;