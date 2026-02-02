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
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900 pb-32">
      <Header 
        isLoggedIn={!!currentUser} 
        currentUser={currentUser}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogoutClick={() => apiService.logout()}
      />

      <main className="container mx-auto px-4 pt-24 max-w-2xl animate-in fade-in duration-700">
        <Routes>
          <Route path="/" element={!currentUser ? <HomeTab onStartClick={() => setIsLoginOpen(true)} /> : <Navigate to="/analyzer" />} />
          
          <Route path="/analyzer" element={currentUser ? (
            <div className="space-y-6">
              {/* Tarjetas de Calibración Pendiente (UX de alta retención) */}
              {history.filter(e => !e.isCalibrated && e.totalCarbs > 0).slice(0, 1).map(entry => (
                <GlucoseCalibrationCard 
                  key={entry.id} 
                  entry={entry} 
                  onCalibrated={() => setSnackbar({ show: true, msg: 'Calibración procesada por la IA', type: 'success' })} 
                />
              ))}
              
              <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-50">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                        <PlusCircle size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-[1000] tracking-tighter uppercase italic leading-none">Nuevo Análisis</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Motor Gemini 1.5 Flash Pro</p>
                    </div>
                 </div>
                 
                 <CarbInputForm 
                    onSubmit={handleAnalysisSuccess} 
                    isLoading={false} 
                    currentUser={currentUser} 
                    prediction={prediction} 
                    history={history} // Pasamos el historial para que la IA aprenda
                 />
              </div>

              {prediction && <AnalysisResultView result={prediction} foodName={lastFoodName} />}
            </div>
          ) : <Navigate to="/" />} />
          
          <Route path="/history" element={currentUser ? <HistoryTab currentUser={currentUser} history={history} /> : <Navigate to="/" />} />
          <Route path="/reports" element={currentUser ? <ReportsTab currentUser={currentUser} history={history} /> : <Navigate to="/" />} />
          <Route path="/profile" element={currentUser ? <ProfileTab currentUser={currentUser} onUpdateUser={async () => {}} /> : <Navigate to="/" />} />
          <Route path="/plans" element={currentUser ? <PlansView onSelectPlan={(id) => { setSelectedPlanId(id as any); navigate('/checkout'); }} /> : <Navigate to="/" />} />
          <Route path="/checkout" element={currentUser ? <PaymentGateway currentUser={currentUser} planId={selectedPlanId} /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {currentUser && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6">
          <div className="max-w-md mx-auto bg-white/80 backdrop-blur-3xl border border-white/20 p-2 flex justify-around items-center rounded-[2.5rem] shadow-2xl shadow-slate-200">
            <NavIcon active={location.pathname === '/analyzer'} onClick={() => navigate('/analyzer')} icon={<Home />} label="Hoy" />
            <NavIcon active={location.pathname === '/history'} onClick={() => navigate('/history')} icon={<Activity />} label="Log" />
            <NavIcon active={location.pathname === '/reports'} onClick={() => navigate('/reports')} icon={<PieChart />} label="Data" />
            <NavIcon active={location.pathname === '/plans'} onClick={() => navigate('/plans')} icon={<Star />} label="PRO" />
            <NavIcon active={location.pathname === '/profile'} onClick={() => navigate('/profile')} icon={<User />} label="Perfil" />
          </div>
        </nav>
      )}
      
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} onLoginSuccess={() => { setIsLoginOpen(false); navigate('/analyzer'); }} />}
      {snackbar.show && <Snackbar message={snackbar.msg} type={snackbar.type} snackbarKey={Date.now()} duration={4000} />}
      <div className="fixed bottom-28 right-6 z-50 shadow-2xl"><ChatBot currentUser={currentUser || ({} as any)} /></div>
    </div>
  );
};

const NavIcon = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 flex-1 transition-all active:scale-75">
    <div className={`p-3 rounded-2xl transition-all duration-500 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-300'}`}>
      {React.cloneElement(icon, { size: 20, strokeWidth: active ? 3 : 2 })}
    </div>
    <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-blue-600' : 'text-slate-300'}`}>{label}</span>
  </button>
);

export default VitametrasApp;