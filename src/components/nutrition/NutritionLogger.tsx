import React, { useState } from 'react';
import { Utensils, Flame, Plus } from 'lucide-react';
import VoiceScannerModal from './VoiceScannerModal';
import { glucosePredictor } from '../../services/glucosePredictor';

interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  color: string;
}

const MacroRing: React.FC<MacroRingProps> = ({ label, current, target, color }) => {
  const percentage = Math.min((current / target) * 100, 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
          <circle 
            cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
            strokeDasharray={175.9}
            strokeDashoffset={175.9 - (175.9 * percentage) / 100}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-[1000] italic">{Math.round(percentage)}%</span>
      </div>
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
};

export const NutritionLogger: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dailyStats, setDailyStats] = useState({ calories: 1200, protein: 45, carbs: 80, fat: 30 });
  const [meals, setMeals] = useState([{ name: 'Desayuno Base', time: '08:00 AM', cal: 450, carbs: '30g' }]);

  const targets = { calories: 2200, protein: 160, carbs: 200, fat: 70 };

  const handleAnalysisComplete = (dataString: string) => {
    try {
      if (!dataString) return;
      const newFoods = JSON.parse(dataString);
      
      // SEGURO: Validar que sea un array y tenga elementos
      if (!Array.isArray(newFoods) || newFoods.length === 0) {
        throw new Error("Formato de alimento inválido");
      }

      const addedCal = newFoods.reduce((acc, f) => acc + (f.calories || 0), 0);
      const addedProtein = newFoods.reduce((acc, f) => acc + (f.protein || 0), 0);
      const addedCarbs = newFoods.reduce((acc, f) => acc + (f.carbs || 0), 0);
      const addedFat = newFoods.reduce((acc, f) => acc + (f.fat || 0), 0);

      if (addedCarbs > 0 && glucosePredictor) {
        glucosePredictor.predictImpact(100, addedCarbs);
      }

      setDailyStats(prev => ({
        calories: prev.calories + addedCal,
        protein: prev.protein + addedProtein,
        carbs: prev.carbs + addedCarbs,
        fat: prev.fat + addedFat
      }));

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setMeals(prev => [{
        name: newFoods[0]?.name || "Comida Registrada",
        time: timeStr,
        cal: addedCal,
        carbs: `${addedCarbs}g`
      }, ...prev]);

    } catch (e) {
      console.error("Error en Bio-Core Nutrition:", e);
      // Aquí podrías mostrar un snackbar al usuario diciendo que el formato no fue reconocido
    }
  };

  return (
    <>
      <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 p-3 rounded-2xl text-orange-500">
              <Flame size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Energía Diaria</p>
              <h3 className="text-2xl font-[1000] text-metra-dark italic uppercase tracking-tighter">
                {dailyStats.calories.toLocaleString()} <span className="text-xs text-slate-400 font-bold">/ {targets.calories} kcal</span>
              </h3>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-metra-dark text-white p-3 rounded-2xl active:scale-90 transition-transform shadow-lg hover:bg-metra-blue transition-colors">
            <Plus size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 pb-8 border-b border-slate-50">
          <MacroRing label="Proteína" current={dailyStats.protein} target={targets.protein} color="text-metra-blue" />
          <MacroRing label="Carbos" current={dailyStats.carbs} target={targets.carbs} color="text-metra-green" />
          <MacroRing label="Grasas" current={dailyStats.fat} target={targets.fat} color="text-orange-400" />
        </div>

        <div className="mt-6 space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
          {meals.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.8rem] group hover:bg-white transition-all border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                  <Utensils size={16} />
                </div>
                <div>
                  <p className="text-xs font-[1000] text-metra-dark uppercase tracking-tight">{item.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{item.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-metra-dark italic">{item.cal} kcal</p>
                <p className="text-[9px] font-bold text-metra-green uppercase">{item.carbs}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <VoiceScannerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAnalysisComplete={handleAnalysisComplete} />
    </>
  );
};

export default NutritionLogger;