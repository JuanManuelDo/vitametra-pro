import React, { useState } from 'react';
import { 
  Camera, Loader2, User, LogOut, ShieldCheck, 
  Activity, Clock, Target, Scale, X, Droplets, Shield 
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../services/firebaseService";
import { doc, updateDoc } from "firebase/firestore";
import { apiService } from '../services/apiService';
import type { UserData, InsulinRatioSegment } from '../types';

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
    <div className="min-h-screen bg-[#F2F2F7] pb-32">
      <header className="bg-white pt-16 pb-10 px-6 rounded-b-[3.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-green-500 opacity-50"></div>
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="relative w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="animate-spin text-blue-500" size={32} />
              ) : currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Bio-Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-slate-300" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border-2 border-white cursor-pointer active:scale-90 transition-transform">
              <Camera size={18} />
              <input type="file" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
          <h2 className="mt-8 text-3xl font-[1000] tracking-tighter text-slate-900 italic uppercase">
            {currentUser?.firstName || 'Usuario'} <span className="text-blue-600">PRO</span>
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Metabolic Core Active</p>
        </div>
      </header>

      <main className="px-6 mt-8 space-y-6">
        <section className="space-y-3">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Calibración Bio-Core</p>
          <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.8rem] mb-2">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-2xl text-blue-600 shadow-sm">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Esfuerzo</p>
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter">{currentUser.activityLevel || 'Sin definir'}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal('activity')} className="text-[9px] font-black text-blue-600 uppercase bg-white px-4 py-2 rounded-xl shadow-sm">Editar</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.8rem] mb-2">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-2xl text-green-600 shadow-sm">
                  <Target size={18} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Objetivos</p>
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter">
                    {currentUser.targetWeight || 70}kg | {currentUser.targetHba1c || 5.5}%
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveModal('goals')} className="text-[9px] font-black text-blue-600 uppercase bg-white px-4 py-2 rounded-xl shadow-sm">Configurar</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.8rem]">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-2xl text-red-500 shadow-sm">
                  <Droplets size={18} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Sistema</p>
                  <p className="text-xs font-bold text-slate-800 uppercase">{currentUser.glucoseUnitPreference}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal('units')} className="text-[9px] font-black text-blue-600 uppercase bg-white px-4 py-2 rounded-xl shadow-sm">Cambiar</button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ratios Clínicos</p>
            <Scale size={16} className="text-slate-300" />
          </div>
          <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-100">
            {ratios.map((segment, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-5 ${index !== ratios.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Clock size={18} />
                  </div>
                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{segment.startTime}</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl">
                  <input 
                    type="number"
                    value={segment.ratio}
                    onChange={(e) => updateRatio(index, e.target.value)}
                    className="w-14 bg-white border-none rounded-xl py-2 text-center font-black text-blue-600 shadow-sm outline-none"
                  />
                  <span className="text-[9px] font-black text-slate-400 uppercase mr-2">grs</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button 
          onClick={saveClinicalConfig}
          disabled={isSaving}
          className="w-full bg-slate-900 text-white p-6 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={18} className="text-green-500" /> Sincronizar Bio-Core</>}
        </button>

        <button 
          onClick={() => apiService.logout()}
          className="w-full flex items-center justify-center gap-2 p-5 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-[2rem] active:bg-red-50 transition-colors"
        >
          <LogOut size={16} /> Finalizar Sesión
        </button>
      </main>

      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-[3.5rem] p-8 shadow-2xl pb-12">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-[1000] text-slate-900 uppercase italic tracking-tighter">
                {activeModal === 'activity' && 'Bio-Actividad'}
                {activeModal === 'units' && 'Sistema de Medida'}
                {activeModal === 'goals' && 'Metas Clínicas'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            {activeModal === 'activity' && (
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <ActivityLevelSelector selectedId={currentUser.activityLevel} onSelect={handleUpdateActivity} />
              </div>
            )}
            {activeModal === 'units' && (
              <div className="grid gap-4">
                {['mg/dL', 'mmol/L'].map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUpdateUnits(u as any)}
                    className={`p-6 rounded-[2rem] border-2 flex justify-between items-center transition-all ${
                      currentUser.glucoseUnitPreference === u 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                      : 'bg-slate-50 border-transparent text-slate-800'
                    }`}
                  >
                    <span className="font-black uppercase tracking-widest">{u}</span>
                    {currentUser.glucoseUnitPreference === u && <Shield size={20} />}
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
        </div>
      )}
    </div>
  );
};

export default ProfileTab;