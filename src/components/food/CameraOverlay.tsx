import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw, Zap } from 'lucide-react';

interface CameraOverlayProps {
  onClose: () => void;
}

const CameraOverlay = ({ onClose }: CameraOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1080 } },
          audio: false
        });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error("Error cámara:", err);
        alert("No se pudo acceder a la cámara");
        onClose();
      }
    }
    setupCamera();

    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const handleCapture = () => {
    // Aquí iría la lógica para enviar el frame al backend/IA
    alert("Analizando plato con Bio-Core...");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* Botón Cerrar */}
      <button 
        onClick={onClose}
        className="absolute top-10 left-6 z-[110] bg-white/10 backdrop-blur-lg p-3 rounded-full text-white"
      >
        <X size={24} />
      </button>

      {/* Video Stream */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />

      {/* Máscara de Escaneo Estilo Apple */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-72 h-72 border-2 border-white/50 rounded-[40px] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
          {/* Esquinas animadas de escaneo */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-metra-blue rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-metra-blue rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-metra-blue rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-metra-blue rounded-br-lg" />
          
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-metra-blue/30 animate-pulse" />
        </div>
      </div>

      {/* Controles Inferiores */}
      <div className="absolute bottom-12 w-full flex flex-col items-center gap-6">
        <p className="text-white/80 font-medium text-sm bg-black/40 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
          <Zap size={14} className="text-yellow-400 fill-yellow-400" />
          Bio-Core listo para escanear
        </p>
        
        <button 
          onClick={handleCapture}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform border-[6px] border-white/30"
        >
          <div className="w-16 h-16 bg-white rounded-full border-2 border-metra-dark flex items-center justify-center">
            <div className="w-12 h-12 bg-metra-blue rounded-full opacity-20 animate-ping absolute" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default CameraOverlay;