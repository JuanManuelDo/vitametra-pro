import React, { useState } from 'react';
import { 
  Camera, Loader2, User, LogOut, ShieldCheck, 
  Activity, Clock, Target, Scale, X, Droplets, Shield, 
  ChevronRight, Zap, Fingerprint, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../services/firebaseService";
import { doc, updateDoc } from "firebase/firestore";
import { apiService } from '../services/apiService';
import type { UserData, InsulinRatioSegment } from '../types';

import AILongTermMemory from './AILongTermMemory';
import ClinicalSettingsEditor from './ClinicalSettingsEditor';
import ActivityLevelSelector from './auth/ActivityLevelSelector';
import ClinicalGoalsSelector from './auth/ClinicalGoalsSelector';

interface ProfileTabProps {
  currentUser: UserData;
  onUpdateUser: (updates: Partial<UserData>) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ currentUser, onUpdateUser }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeModal, setActiveModal] = useState<'activity' | 'units' | 'goals' | null>(null);

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
      onUpdateUser({ photoURL });
    } catch (error) {
      console.error("Error subiendo Bio-Avatar:", error);
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
      onUpdateUser({ insulinRatioSchedule: ratios });
    } catch (error) {
      console.error("Error guardando parámetros:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateRatio = (index: number, value: string) => {
    const newRatios = [...ratios];
    newRatios[index].ratio = Number(value);
    setRatios(newRatios);
  };

  const handleUpdateActivity = async (level: string) => {
    onUpdateUser({ activityLevel: level });
    const userRef = doc(db, "users", currentUser.id);
    await updateDoc(userRef, { activityLevel: level });
    setTimeout(() => setActiveModal(null), 300);
  };

  const handleUpdateUnits = async (unit: 'mg/dL' | 'mmol/L') => {
    onUpdateUser({ glucoseUnitPreference: unit });
    const userRef = doc(db, "users", currentUser.id);
    await updateDoc(userRef, { glucoseUnitPreference: unit });
    setActiveModal(null);
  };

  const handleUpdateGoals = async (data: { targetWeight?: number; targetHba1c?: number }) => {
    onUpdateUser(data);
    const userRef = doc(db, "users", currentUser.id);
    await updateDoc(userRef, data);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] pb-40">
      {/* HEADER PREMIUM */}
      <header className="relative pt-20 pb-12 px-6 bg-white rounded-b-[4rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 blur-[100px] rounded-full -mr-32 -mt-32 opacity-60" />
        
        <div className="relative flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-[3rem] p-1 bg-gradient-to-tr from-blue-500 to-emerald-400 shadow-2xl">
              <div className="w-full h-full rounded-[2.8rem] bg-white overflow-hidden flex items-center justify-center border-4 border-white">
                {isUploading ? (
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                ) : currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Bio-Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-200" />
                )}
              </div>
            </div>
            <label className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border-4 border-white cursor-pointer hover:scale-110 active:scale-90 transition-all">
              <Camera size={18} strokeWidth={2.5} />
              <input type="file" className="hidden" onChange={handlePhotoChange} />
            </label>
          </motion.div>

          <h2 className="mt-8 text-4xl font-[1000] tracking-tighter text-slate-900 italic uppercase leading-none">
            {currentUser?.firstName || 'Usuario'} <span className="text-blue-600 italic">PRO</span>
          </h2>
          
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-full shadow-lg shadow-blue-100">
            <Fingerprint size={12} className="text-blue-400" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Bio-Core Identity Active</span>
          </div>
        </div>
      </header>

      <main className="px-6 mt-10 space-y-10">
        
        {/* MEMORIA IA - ESTILO CARD APPLE */}
        <section className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Sparkles size={20} />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Memoria Cognitiva IA</h3>
            </div>
            <AILongTermMemory currentUser={currentUser} />
        </section>

        {/* CALIBRACIÓN DEL SISTEMA */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Parámetros de Calibración</h3>
          <div className="bg-white rounded-[3rem] border border-slate-50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
            <SettingsRow 
              icon={<Activity className="text-blue-600" />} 
              label="Esfuerzo Diario" 
              value={currentUser.activityLevel || 'Sin definir'} 
              onClick={() => setActiveModal('activity')} 
            />
            <SettingsRow 
              icon={<Target className="text-emerald-500" />} 
              label="Objetivos Clínicos" 
              value={`${currentUser.targetWeight || 70}kg • ${currentUser.targetHba1c || 5.5}%`} 
              onClick={() => setActiveModal('goals')} 
            />
            <SettingsRow 
              icon={<Droplets className="text-rose-500" />} 
              label="Unidades Médicas" 
              value={currentUser.glucoseUnitPreference} 
              onClick={() => setActiveModal('units')} 
              isLast
            />
          </div>
        </section>

        {/* EDITOR CLÍNICO */}
        <section className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
           <ClinicalSettingsEditor 
              currentUser={currentUser} 
              onUpdate={(updates) => onUpdateUser(updates)} 
           />
        </section>

        {/* RATIOS METABÓLICOS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Cronología de Ratios</h3>
            <Scale size={16} className="text-slate-300" />
          </div>
          <div className="bg-white rounded-[3.5rem] p-4 border border-slate-50 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            {ratios.map((segment, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-6 ${index !== ratios.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 border border-slate-100">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Inicio Segmento</p>
                    <span className="text-lg font-black text-slate-900 italic tracking-tighter">{segment.startTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                  <input 
                    type="number"
                    value={segment.ratio}
                    onChange={(e) => updateRatio(index, e.target.value)}
                    className="w-16 bg-white border-none rounded-xl py-3 text-center font-black text-blue-600 shadow-sm outline-none text-xl"
                  />
                  <span className="text-[10px] font-black text-slate-400 uppercase mr-3 italic">g/ui</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTONES DE ACCIÓN */}
        <div className="space-y-4 pt-6">
            <button 
                onClick={saveClinicalConfig}
                disabled={isSaving}
                className="group relative w-full bg-slate-900 text-white p-6 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-200"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-3">
                    {isSaving ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} className="text-blue-400" /> Sincronizar Bio-Core</>}
                </span>
            </button>

            <button 
                onClick={() => apiService.logout()}
                className="w-full flex items-center justify-center gap-3 p-6 text-rose-500 font-black text-[11px] uppercase tracking-[0.3em] rounded-[2.5rem] border border-transparent hover:bg-rose-50 transition-all"
            >
                <LogOut size={18} /> Finalizar Sesión Segura
            </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-20 text-center opacity-30">
        <Zap size={20} fill="currentColor" className="mx-auto mb-4 text-slate-400" />
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.6em]">Vitametra Engine v4.2.0 • 2026</p>
      </footer>

      {/* MODAL ESTILO APPLE (BOTTON SHEET) */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[2000] flex items-end justify-center">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" 
                onClick={() => setActiveModal(null)} 
            />
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-lg bg-white rounded-t-[4rem] p-10 shadow-2xl pb-16"
            >
              <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />
              
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-[1000] text-slate-900 uppercase italic tracking-tighter">
                  {activeModal === 'activity' && 'Bio-Actividad'}
                  {activeModal === 'units' && 'Sistema Médica'}
                  {activeModal === 'goals' && 'Metas Clínicas'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={24} strokeWidth={3} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {activeModal === 'activity' && (
                  <ActivityLevelSelector selectedId={currentUser.activityLevel} onSelect={handleUpdateActivity} />
                )}
                {activeModal === 'units' && (
                  <div className="grid gap-4">
                    {['mg/dL', 'mmol/L'].map((u) => (
                      <button
                        key={u}
                        onClick={() => handleUpdateUnits(u as any)}
                        className={`p-8 rounded-[2.5rem] border-2 flex justify-between items-center transition-all ${
                          currentUser.glucoseUnitPreference === u 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-[1.02]' 
                          : 'bg-slate-50 border-transparent text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-black text-lg uppercase tracking-widest">{u}</span>
                        {currentUser.glucoseUnitPreference === u && <ShieldCheck size={24} />}
                      </button>
                    ))}
                  </div>
                )}
                {activeModal === 'goals' && (
                  <ClinicalGoalsSelector 
                    targetWeight={currentUser.targetWeight || 70}
                    targetHba1c={currentUser.targetHba1c || 5.5}
                    onUpdate={handleUpdateGoals}
                    unit={currentUser.glucoseUnitPreference}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// COMPONENTE DE FILA DE AJUSTES
const SettingsRow = ({ icon, label, value, onClick, isLast }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between p-7 hover:bg-slate-50 transition-all ${!isLast ? 'border-b border-slate-50' : ''}`}
    >
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-50">
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">{value}</p>
            </div>
        </div>
        <ChevronRight size={20} className="text-slate-200" />
    </button>
);

export default ProfileTab;