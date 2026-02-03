import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Home, Activity, PieChart, User, Star, Zap, PlusCircle } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

import Header from './components/Header';
import HomeTab from './components/HomeTab';
import CarbInputForm from './components/CarbInputForm';
import HistoryTab from './components/HistoryTab';
import ProfileTab from './components/ProfileTab';
import ReportsTab from './components/ReportsTab';
import LoginModal from './components/LoginModal';
import Snackbar from './components/Snackbar';
import ChatBot from './components/ChatBot';
import { PlansView } from './components/PlansView';
import { GlucoseCalibrationCard } from './components/GlucoseCalibrationCard';
import { AnalysisResultView } from './components/AnalysisResultView';

import { apiService } from './services/apiService';
import { auth } from './services/firebaseService';
import type { UserData, HistoryEntry, AnalysisResult } from './types';

// CONFIGURACIÓN DE MERCADO PAGO
const MP_LINKS = {
  monthly: "https://mpago.li/TU_LINK_6990",    // Reemplaza con tu link real
  quarterly: "https://mpago.li/TU_LINK_18990", // Reemplaza con tu link real
  annual: "https://mpago.li/TU_LINK_69900"      // Reemplaza con tu link real
};

const VitametrasApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [snackbar, setSnackbar] = useState({ show: false, msg: '', type: 'info' as any });
  const [prediction, setPrediction] = useState<AnalysisResult | null>(null);
  const [lastFoodName, setLastFoodName] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        apiService.subscribeToUserProfile(user.uid, (profile) => {
          setCurrentUser(profile);
          setIsLoadingAuth(false);
        });
      } else {
        setCurrentUser(null);
        setIsLoadingAuth(false);
        if (location.pathname !== '/') navigate('/');
      }
    });
    return () => unsub();
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (currentUser?.id) {
      const unsubHistory = apiService.subscribeToHistory(currentUser.id, setHistory);
      return () => unsubHistory();
    }
  }, [currentUser?.id]);

  const handleAnalysisSuccess = (result: AnalysisResult) => {
    setPrediction(result);
    setLastFoodName(result.items?.[0]?.food || "Nueva comida");
    setSnackbar({ show: true, msg: 'Análisis metabólico inteligente listo', type: 'success' });
  };

  const handlePlanSelection = (planId: string) => {
    const url = MP_LINKS[planId as keyof typeof MP_LINKS];
    if (url) {
      window.open(url, '_blank');
      setSnackbar({ show: true, msg: 'Redirigiendo a Mercado Pago...', type: 'info' });
    }
  };

  if (isLoadingAuth) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center animate-pulse shadow-2xl shadow-blue-200">
          <Zap className="text-white" size={32} fill="white" />
        </div>
      </div>
      <p className="text-[10px] font-[900] text-slate-400 uppercase tracking-[0.5em] mt-10 italic">Vitametra Bio-Core</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-white font-sans antialiased text-slate-900 flex flex-col">
      <Header 
        isLoggedIn={!!currentUser} 
        currentUser={currentUser}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogoutClick={() => apiService.logout()}
      />

      <main className="flex-grow w-full pt-28 pb-48">
        <div className="w-full h-full px-6 md:px-12 lg:px-20"> 
          <Routes>
            <Route path="/" element={!currentUser ? <HomeTab onStartClick={() => setIsLoginOpen(true)} /> : <Navigate to="/analyzer" />} />
            
            <Route path="/analyzer" element={currentUser ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start w-full">
                
                {/* IZQUIERDA: INPUT */}
                <div className="space-y-8">
                  {history.filter(e => !e.isCalibrated && e.totalCarbs > 0).slice(0, 1).map(entry => (
                    <GlucoseCalibrationCard 
                      key={entry.id} 
                      entry={entry} 
                      onCalibrated={() => setSnackbar({ show: true, msg: 'Calibración procesada', type: 'success' })} 
                    />
                  ))}
                  
                  <div className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.08)] border border-slate-50">
                     <div className="flex items-center gap-6 mb-12">
                        <div className="p-5 bg-[#007AFF] text-white rounded-[1.5rem] shadow-xl shadow-blue-200">
                            <PlusCircle size={40} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-[1000] tracking-tighter uppercase italic leading-none">Bio-Scanner</h2>
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Neural Analysis Active</p>
                        </div>
                     </div>
                     
                     <CarbInputForm 
                        onSubmit={handleAnalysisSuccess} 
                        isLoading={false} 
                        currentUser={currentUser} 
                        prediction={prediction} 
                        history={history} 
                     />
                  </div>
                </div>

                {/* DERECHA: RESULTADOS */}
                <div className="w-full">
                  {prediction ? (
                    <AnalysisResultView result={prediction} foodName={lastFoodName} />
                  ) : (
                    <div className="hidden xl:flex h-[700px] border-2 border-dashed border-slate-100 rounded-[3.5rem] flex-col items-center justify-center text-slate-200 p-20 text-center">
                        <Activity size={100} className="mb-8 opacity-20" />
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-300 italic">Esperando Datos...</h3>
                        <p className="max-w-sm font-bold text-slate-400 text-sm mt-4 leading-relaxed uppercase tracking-widest">
                           Ingresa alimentos para proyectar el impacto glucémico.
                        </p>
                    </div>
                  )}
                </div>
              </div>
            ) : <Navigate to="/" />} />
            
            <Route path="/history" element={currentUser ? <HistoryTab currentUser={currentUser} history={history} /> : <Navigate to="/" />} />
            <Route path="/reports" element={currentUser ? <ReportsTab currentUser={currentUser} history={history} /> : <Navigate to="/" />} />
            <Route path="/profile" element={currentUser ? <ProfileTab currentUser={currentUser} onUpdateUser={async () => {}} /> : <Navigate to="/" />} />
            <Route path="/plans" element={currentUser ? <PlansView onSelectPlan={handlePlanSelection} /> : <Navigate to="/" />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* DOCK DE NAVEGACIÓN (Apple Style) */}
      {currentUser && (
        <nav className="fixed bottom-10 left-0 right-0 z-[60] px-6">
          <div className="max-w-4xl mx-auto bg-[#001D3D]/95 backdrop-blur-2xl border border-white/10 p-3 flex justify-around items-center rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
            <NavIcon active={location.pathname === '/analyzer'} onClick={() => navigate('/analyzer')} icon={<Home />} label="Bio-Scan" />
            <NavIcon active={location.pathname === '/history'} onClick={() => navigate('/history')} icon={<Activity />} label="Log" />
            <NavIcon active={location.pathname === '/reports'} onClick={() => navigate('/reports')} icon={<PieChart />} label="Data" />
            <NavIcon active={location.pathname === '/plans'} onClick={() => navigate('/plans')} icon={<Star />} label="Pro" />
            <NavIcon active={location.pathname === '/profile'} onClick={() => navigate('/profile')} icon={<User />} label="Bio" />
          </div>
        </nav>
      )}
      
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onLoginSuccess={() => { setIsLoginOpen(false); navigate('/analyzer'); }} />}
      {snackbar.show && <Snackbar message={snackbar.msg} type={snackbar.type} snackbarKey={Date.now()} duration={4000} />}
      
      <div className="fixed bottom-36 right-8 z-50 transition-all hover:scale-110 active:scale-90">
        <ChatBot currentUser={currentUser || ({} as any)} />
      </div>
    </div>
  );
};

const NavIcon = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 flex-1 transition-all active:scale-90 group">
    <div className={`p-3.5 rounded-2xl transition-all duration-300 ${active ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-500/40' : 'text-slate-400 hover:text-white'}`}>
      {React.cloneElement(icon, { size: 22, strokeWidth: active ? 3 : 2 })}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
  </button>
);

export default VitametrasApp;