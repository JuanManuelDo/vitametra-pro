import React, { useState } from 'react';
import { Camera, Loader2, User, LogOut, ShieldCheck, Zap, Activity, Clock, Target, Scale } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../services/firebaseService";
import { doc, updateDoc } from "firebase/firestore";
import { apiService } from '../services/apiService';
import type { UserData, InsulinRatioSegment } from '../types';

interface ProfileTabProps {
  currentUser: UserData;
  onUpdateUser: () => Promise<void>;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ currentUser }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estado local para los ratios (se inicializa con lo que haya en Firebase o defaults)
  const [ratios, setRatios] = useState<InsulinRatioSegment[]>(
    currentUser.insulinRatioSchedule || [
      { startTime: "06:00", ratio: 15 },
      { startTime: "13:00", ratio: 15 },
      { startTime: "20:00", ratio: 15 }
    ]
  );

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.id) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${currentUser.id}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", currentUser.id), { photoURL });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const saveClinicalConfig = async () => {
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", currentUser.id);
      await updateDoc(userRef, {
        insulinRatioSchedule: ratios,
        updatedAt: new Date().toISOString()
      });
      alert("Configuración Metabólica Actualizada");
    } catch (error) {
      alert("Error al guardar configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const updateRatio = (index: number, value: string) => {
    const newRatios = [...ratios];
    newRatios[index].ratio = Number(value);
    setRatios(newRatios);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-32 animate-in fade-in duration-500 px-4">
      
      {/* HEADER DE PERFIL */}
      <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-50 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
        
        <div className="relative w-28 h-28 mx-auto mb-4">
          <div className="w-full h-full rounded-[2.2rem] overflow-hidden border-4 border-white shadow-xl bg-slate-50 flex items-center justify-center">
            {isUploading ? <Loader2 className="animate-spin text-blue-500" /> : 
             currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Perfil" className="w-full h-full object-cover" /> : 
             <User size={40} className="text-slate-200" />}
          </div>
          <label className="absolute -bottom-2 -right-2 bg-blue-600 p-3 rounded-2xl text-white shadow-lg cursor-pointer hover:scale-110 transition-all">
            <Camera size={16} />
            <input type="file" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>

        <h2 className="text-2xl font-[1000] text-slate-900 tracking-tighter uppercase italic">
          {currentUser?.firstName || 'Usuario'} PRO
        </h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{currentUser?.email}</p>
      </div>

      {/* SECCIÓN CLÍNICA: EL MOTOR DE APRENDIZAJE */}
      <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-50 space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Scale size={20} />
          </div>
          <div>
            <h3 className="text-lg font-[1000] text-slate-900 tracking-tight uppercase">Configuración de Ratios</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gramos de carbohidratos por 1 unidad de insulina</p>
          </div>
        </div>

        

        <div className="grid gap-4">
          {ratios.map((segment, index) => (
            <div key={index} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-blue-500" />
                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{segment.startTime}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase">1 UI :</span>
                <input 
                  type="number"
                  value={segment.ratio}
                  onChange={(e) => updateRatio(index, e.target.value)}
                  className="w-20 bg-white border-2 border-slate-200 rounded-xl py-2 text-center font-[1000] text-blue-600 focus:border-blue-400 outline-none"
                />
                <span className="text-[10px] font-black text-slate-400 uppercase">g</span>
              </div>
            </div>
          ))}
        </div>

        {/* FACTORES DE SENSIBILIDAD ADICIONALES */}
        <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                    <Target size={14} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meta Glucosa</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-[1000] text-slate-800">100</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">mg/dL</span>
                </div>
            </div>
            <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 opacity-50">
                <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sensibilidad IA</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-[1000] text-slate-800">1:50</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">mg/dL</span>
                </div>
            </div>
        </div>

        <button 
          onClick={saveClinicalConfig}
          disabled={isSaving}
          className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-[1000] uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : 'Sincronizar Parámetros'}
        </button>
      </div>

      <button 
        onClick={() => apiService.logout()}
        className="w-full bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-center gap-3 text-red-500 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-50 transition-colors"
      >
        <LogOut size={18} /> Cerrar Sesión
      </button>

      <div className="text-center opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Vitametra Metabolic Core v2.0</p>
      </div>
    </div>
  );
};

export default ProfileTab;