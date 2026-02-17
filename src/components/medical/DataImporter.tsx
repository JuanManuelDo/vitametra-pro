import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom'; // Para la redirección

const DataImporter = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // Aumentado a 10MB para reportes largos
      setError("El reporte es demasiado extenso (Máximo 10MB)");
      setStatus('error');
      return;
    }

    setStatus('processing');
    setError(null);

    try {
      const base64Data = await fileToBase64(file);
      const functions = getFunctions();
      const importMedicalReport = httpsCallable(functions, 'importMedicalReport');

      const result = await importMedicalReport({
        fileBase64: base64Data,
        fileName: file.name,
        fileType: file.type
      });

      const data = result.data as { success: boolean, processedEntries: number };

      if (data.success) {
        setProcessedCount(data.processedEntries);
        setStatus('success');
        
        // REDIRECCIÓN ESTRATÉGICA: Esperamos 2 segundos para que el usuario vea el éxito
        // y luego lo enviamos al Dashboard para que vea sus nuevos Insights.
        setTimeout(() => {
          navigate('/'); // O la ruta donde tengas el HomeTab
        }, 2500);
      }
    } catch (err: any) {
      console.error("Error importando:", err);
      setError(err.message || "Error al procesar el documento médico.");
      setStatus('error');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className={`relative overflow-hidden bg-white p-10 rounded-[3rem] border-2 border-dashed transition-all duration-700 ${
        status === 'success' ? 'border-emerald-500 bg-emerald-50/50' : 
        status === 'error' ? 'border-red-200 bg-red-50/50' : 
        'border-slate-200 hover:border-blue-400 shadow-2xl shadow-slate-100'
      }`}>
        
        <input 
          type="file" 
          id="fileImport" 
          hidden 
          onChange={handleFileUpload} 
          accept=".pdf,.csv"
          disabled={status === 'processing' || status === 'success'}
        />
        
        <label htmlFor="fileImport" className={`flex flex-col items-center gap-6 ${status === 'processing' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          
          <motion.div 
            animate={status === 'processing' ? { rotate: 360 } : { rotate: 0 }}
            transition={status === 'processing' ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
            className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-xl transition-all duration-500 ${
              status === 'success' ? 'bg-emerald-500 text-white' : 
              status === 'processing' ? 'bg-blue-600 text-white' :
              status === 'error' ? 'bg-red-500 text-white' :
              'bg-slate-900 text-white'
            }`}
          >
            {status === 'processing' ? <Loader2 size={40} /> : 
             status === 'success' ? <CheckCircle size={40} /> : 
             status === 'error' ? <AlertCircle size={40} /> :
             <Upload size={40} />}
          </motion.div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-[1000] uppercase italic tracking-tighter text-slate-900">
              {status === 'processing' ? 'Metra está leyendo...' : 
               status === 'success' ? 'Sincronización Completa' : 
               'Cargar Reporte Médico'}
            </h3>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {status === 'success' 
                ? `Hemos procesado ${processedCount} registros con éxito` 
                : 'Analiza tu Bomba o Glucómetro en segundos'}
            </p>
          </div>

          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-emerald-600 font-bold text-xs italic"
            >
              Redirigiendo a tus nuevos Insights... <ArrowRight size={14} className="animate-bounce-x" />
            </motion.div>
          )}

          <AnimatePresence>
            {status === 'processing' && (
              <div className="w-full space-y-3">
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-blue-600 h-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 15 }} // Simulación de lectura profunda
                  />
                </div>
                <p className="text-center text-[9px] font-bold text-blue-600 uppercase tracking-widest animate-pulse">
                  Extrayendo patrones metabólicos con IA
                </p>
              </div>
            )}
          </AnimatePresence>
        </label>

        {status === 'error' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-6 p-4 bg-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-red-200"
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DataImporter;