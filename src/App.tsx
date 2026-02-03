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
import PaymentGateway from './components/PaymentGateway';
import { GlucoseCalibrationCard } from './components/GlucoseCalibrationCard';
import { AnalysisResultView } from './components/AnalysisResultView';

import { apiService } from './services/apiService';
import { auth } from './services/firebaseService';
import type { UserData, HistoryEntry, AnalysisResult } from './types';

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
  const [selectedPlanId, setSelectedPlanId] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

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

  if (isLoadingAuth) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
      <div className="relative">
        <Zap className="text-blue-600 animate-bounce" size={48} />
        <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse"></div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-8">Vitametra Bio-Core 2.0</p>
    </div>
  );

  return (
    /* Eliminamos cualquier margen/padding que pueda venir del index */
    <div className="min-h-screen w-full bg-[#F8FAFC] font-sans antialiased text-slate-900 flex flex-col m-0 p-0">
      <Header 
        isLoggedIn={!!currentUser} 
        currentUser={currentUser}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogoutClick={() => apiService.logout()}
      />

      {/* MODIFICACIÓN CLAVE: 
          - Se eliminaron restricciones de ancho.
          - Se usa w-full para ocupar todo el viewport.
          - Se ajustó el padding lateral para pantallas grandes.
      */}
      <main className="flex-grow w-full pt-28 pb-48 px-4 md:px-10 lg:px-16 animate-in fade-in duration-700">
        <div className="w-full h-full max-w-[100%] mx-auto"> 
          <Routes>
            <Route path="/" element={!currentUser ? <HomeTab onStartClick={() => setIsLoginOpen(true)} /> : <Navigate to="/analyzer" />} />
            
            <Route path="/analyzer" element={currentUser ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start w-full">
                
                {/* PANEL ACCIÓN (IZQUIERDO) */}
                <div className="space-y-6 w-full">
                  {history.filter(e => !e.isCalibrated && e.totalCarbs > 0).slice(0, 1).map(entry => (
                    <GlucoseCalibrationCard 
                      key={entry.id} 
                      entry={entry} 
                      onCalibrated={() => setSnackbar({ show: true, msg: 'Calibración procesada', type: 'success' })} 
                    />
                  ))}
                  
                  <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/40 border border-white">
                     <div className="flex items-center gap-5 mb-10">
                        <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200">
                            <PlusCircle size={36} />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-[1000] tracking-tighter uppercase italic leading-none">Bio-Scanner</h2>
                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-2">Gemini 1.5 PRO Enabled</p>
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

                {/* PANEL RESULTADOS (DERECHO) */}
                <div className="w-full h-full">
                  {prediction ? (
                    <AnalysisResultView result={prediction} foodName={lastFoodName} />
                  ) : (
                    <div className="hidden xl:flex h-[600px] border-4 border-dashed border-slate-200 rounded-[3rem] flex-col items-center justify-center text-slate-300 p-12 text-center">
                        <Activity size={80} className="mb-6 opacity-10" />
                        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-400 italic">Monitor Metabólico</h3>
                        <p className="max-w-sm font-bold text-sm mt-2">Ingresa tus alimentos para visualizar el impacto glucémico proyectado en tu perfil biométrico.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : <Navigate to="/" />} />
            
            <Route path="/history" element={currentUser ? <HistoryTab currentUser={currentUser} history={history} /> : <Navigate to="/" />} />
            <Route path="/reports" element={currentUser ? <ReportsTab currentUser={currentUser} history={history} /> : <Navigate to="/" />} />
            <Route path="/profile" element={currentUser ? <ProfileTab currentUser={currentUser} onUpdateUser={async () => {}} /> : <Navigate to="/" />} />
            <Route path="/plans" element={currentUser ? <PlansView onSelectPlan={(id) => { setSelectedPlanId(id as any); navigate('/checkout'); }} /> : <Navigate to="/" />} />
            <Route path="/checkout" element={currentUser ? <PaymentGateway currentUser={currentUser} planId={selectedPlanId} /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* BARRA DE NAVEGACIÓN FULL-WIDTH EN ESCRITORIO */}
      {currentUser && (
        <nav className="fixed bottom-8 left-0 right-0 z-[60] px-4 md:px-10 lg:px-20">
          <div className="max-w-6xl mx-auto bg-slate-900/95 backdrop-blur-3xl border border-white/10 p-3 md:p-4 flex justify-around items-center rounded-[2.5rem] shadow-2xl">
            <NavIcon active={location.pathname === '/analyzer'} onClick={() => navigate('/analyzer')} icon={<Home />} label="Dashboard" />
            <NavIcon active={location.pathname === '/history'} onClick={() => navigate('/history')} icon={<Activity />} label="Historial" />
            <NavIcon active={location.pathname === '/reports'} onClick={() => navigate('/reports')} icon={<PieChart />} label="Estadísticas" />
            <NavIcon active={location.pathname === '/plans'} onClick={() => navigate('/plans')} icon={<Star />} label="Premium" />
            <NavIcon active={location.pathname === '/profile'} onClick={() => navigate('/profile')} icon={<User />} label="Cuenta" />
          </div>
        </nav>
      )}
      
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onLoginSuccess={() => { setIsLoginOpen(false); navigate('/analyzer'); }} />}
      {snackbar.show && <Snackbar message={snackbar.msg} type={snackbar.type} snackbarKey={Date.now()} duration={4000} />}
      
      <div className="fixed bottom-32 right-8 md:right-16 z-50 transition-all hover:scale-110">
        <ChatBot currentUser={currentUser || ({} as any)} />
      </div>
    </div>
  );
};

const NavIcon = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center gap-1.5 flex-1 transition-all active:scale-95 group">
    <div className={`p-3 md:p-4 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/50' : 'text-slate-500 hover:text-slate-300'}`}>
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 3 : 2 })}
    </div>
    <span className={`text-[9px] md:text-[11px] font-[900] uppercase tracking-widest ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
  </button>
);

export default VitametrasApp;