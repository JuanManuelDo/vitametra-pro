import React, { useState, useEffect } from 'react';
import { Camera, Search, BookText, ChevronLeft, X, Sparkles, CheckCircle2, Zap } from 'lucide-react';

interface FoodLoggerProps {
  onSave?: () => void;
}

const FoodLogger: React.FC<FoodLoggerProps> = ({ onSave }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [activeMode, setActiveMode] = useState<'menu' | 'camera'>('menu');

  // Simulación de Escaneo de IA
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            setShowResult(true);
            return 100;
          }
          return prev + 2;
        });
      }, 40);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setIsScanning(true);
        setActiveMode('camera');
      };
      reader.readAsDataURL(file);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setIsScanning(false);
    setShowResult(false);
    setActiveMode('menu');
  };

  return (
    <div className="min-h-screen bg-metra-slate flex flex-col items-center p-6 pb-32">
      <div className="w-full max-w-md">
        
        {activeMode === 'menu' ? (
          /* --- VISTA INICIAL: MENÚ DE SELECCIÓN --- */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mt-8 mb-10">
              <div className="inline-flex items-center gap-2 bg-metra-blue/10 px-3 py-1 rounded-full mb-4">
                <Zap size={14} className="text-metra-blue" fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest text-metra-blue">Módulo de Nutrición</span>
              </div>
              <h1 className="text-4xl font-[1000] tracking-tighter text-metra-dark leading-none">Bio-Scanner</h1>
              <p className="text-slate-500 font-medium mt-2">Registra biomarcadores de tu comida</p>
            </header>

            <div className="grid gap-4">
              <label className="apple-card p-6 flex items-center gap-4 active:scale-95 transition-all text-left group cursor-pointer bg-white">
                <div className="bg-metra-blue/10 p-4 rounded-2xl text-metra-blue group-hover:bg-metra-blue group-hover:text-white transition-all shadow-sm">
                  <Camera size={28} />
                </div>
                <div className="flex-1">
                  <span className="block text-xl font-black text-metra-dark tracking-tight">Cámara IA</span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Predicción Estructural</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              <button className="apple-card p-6 flex items-center gap-4 active:scale-95 transition-all text-left group bg-white">
                <div className="bg-metra-green/10 p-4 rounded-2xl text-metra-green group-hover:bg-metra-green group-hover:text-white transition-all">
                  <Search size={28} />
                </div>
                <div>
                  <span className="block text-xl font-black text-metra-dark tracking-tight">Búsqueda</span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Base de datos Global</span>
                </div>
              </button>

              <button className="apple-card p-6 flex items-center gap-4 active:scale-95 transition-all text-left group bg-white/50 border-dashed border-2 border-slate-200 shadow-none">
                <div className="bg-slate-200 p-4 rounded-2xl text-slate-400">
                  <BookText size={28} />
                </div>
                <div>
                  <span className="block text-xl font-bold text-slate-400">Recientes</span>
                  <span className="text-xs text-slate-400">Próximamente</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* --- VISTA DE ESCANEO ACTIVA --- */
          <div className="animate-in zoom-in-95 duration-500">
            <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
              {image && <img src={image} alt="Analizando" className="w-full h-full object-cover" />}
              
              {/* EFECTO LÁSER NEÓN */}
              {isScanning && (
                <div className="absolute inset-0 z-20">
                  <div className="absolute inset-0 bg-metra-blue/20" />
                  <div 
                    className="absolute left-0 right-0 h-1.5 bg-metra-blue shadow-[0_0_25px_#007AFF] z-30 transition-all duration-75 ease-linear"
                    style={{ top: `${scanProgress}%` }}
                  />
                  {/* Puntos de interés IA */}
                  <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full animate-ping shadow-[0_0_10px_white]" />
                  <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-white rounded-full animate-ping delay-300 shadow-[0_0_10px_white]" />
                  
                  <div className="absolute bottom-12 left-0 right-0 text-center px-10">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] drop-shadow-lg mb-3">Escaneando Nutrientes</p>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
                      <div className="h-full bg-metra-blue shadow-[0_0_10px_#007AFF] transition-all" style={{ width: `${scanProgress}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {/* OVERLAY DE RESULTADOS FINALES */}
              {showResult && (
                <div className="absolute inset-0 bg-metra-dark/90 backdrop-blur-xl z-40 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                  <div className="w-20 h-20 bg-metra-green/20 rounded-[2rem] flex items-center justify-center text-metra-green mb-6 border border-metra-green/30 shadow-[0_0_30px_rgba(52,199,89,0.2)]">
                    <CheckCircle2 size={48} />
                  </div>
                  
                  <h3 className="text-3xl font-[1000] text-white tracking-tighter mb-1">Analizado</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 text-center">Datos Bio-Core Procesados</p>

                  <div className="w-full space-y-3 mb-12">
                    <div className="flex justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
                      <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Carbohidratos</span>
                      <span className="font-black text-xl text-metra-blue">48g</span>
                    </div>
                    <div className="flex justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
                      <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Impacto Glucémico</span>
                      <span className="font-black text-xl text-metra-green">Bajo</span>
                    </div>
                  </div>

                  <div className="flex gap-4 w-full">
                    <button onClick={resetScanner} className="flex-1 py-5 rounded-2xl border border-white/20 text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                      Repetir
                    </button>
                    <button onClick={onSave} className="flex-1 py-5 bg-metra-blue rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-metra-blue/30 active:scale-95 transition-all">
                      Confirmar
                    </button>
                  </div>
                </div>
              )}

              {/* BOTÓN CERRAR */}
              <button onClick={resetScanner} className="absolute top-6 right-6 z-50 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white active:scale-90 transition-all">
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* BOTÓN VOLVER (Solo visible en el menú) */}
        {activeMode === 'menu' && (
          <button 
            onClick={() => window.history.back()}
            className="mt-12 w-full flex items-center justify-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] py-4"
          >
            <ChevronLeft size={16} /> Volver al Resumen
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodLogger;