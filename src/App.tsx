import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

// 1. COMPONENTES UI
import Header from './components/ui/Header';
import Navigation from './components/ui/Navigation';
import Snackbar from './components/ui/Snackbar';
import ResultDisplay from './components/ui/ResultDisplay';
import LoginModal from './components/modals/LoginModal';
import WelcomeModal from './components/modals/WelcomeModal';

// 2. TABS Y PÁGINAS (RUTAS PROFESIONALES)
import HomeTab from './tabs/HomeTab';
import HistoryTab from './components/HistoryTab';
import ProfileTab from './components/ProfileTab';
import RegisterTab from './components/auth/RegisterTab'; // Ubicación corregida
import PlansTab from './components/PlansTab'; 
import CarbInputForm from './components/CarbInputForm';
import ChatBot from './components/ChatBot';
import MedicalSettings from './components/medical/MedicalSettings';
import DataImporter from './components/medical/DataImporter';
import PaymentSuccess from './components/payments/PaymentSuccess'; // Ubicación corregida

// 3. SERVICIOS Y TIPOS
import { analyzeFoodText } from './services/ai/geminiService';
import { apiService } from './services/infrastructure/apiService';
import { auth, logClinicalEvent } from './services/infrastructure/firebaseService';
import type { UserData, HistoryEntry, Hba1cEntry } from './types';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [modals, setModals] = useState({ login: false, chat: false });
  const [snackbar, setSnackbar] = useState({ message: '', key: 0 });

  const [analysis, setAnalysis] = useState({
    input: '', isLoading: false, result: null as any | null, error: null as string | null
  });

  const [dataStreams, setDataStreams] = useState({
    history: [] as HistoryEntry[],
    hba1c: [] as Hba1cEntry[]
  });

  const notify = (msg: string) => setSnackbar({ message: msg, key: Date.now() });

  const initializeSession = useCallback((userData: UserData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    if (location.pathname === '/' || location.pathname === '/plans') navigate('/dashboard');
  }, [location.pathname, navigate]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const profile = await apiService.getUserProfile(user.uid);
          if (profile) initializeSession(profile);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (e) {
        console.error("Auth Error:", e);
      } finally {
        setIsInitializing(false);
      }
    });
    return () => unsub();
  }, [initializeSession]);

  useEffect(() => {
    if (isLoggedIn && currentUser?.id) {
      const unsubH = apiService.subscribeToHistory(currentUser.id, (h) => 
        setDataStreams(prev => ({ ...prev, history: h })));
      const unsubHb = apiService.subscribeToHba1cHistory(currentUser.id, (hb) => 
        setDataStreams(prev => ({ ...prev, hba1c: hb })));
      return () => { unsubH(); unsubHb(); };
    }
  }, [isLoggedIn, currentUser?.id]);

  const handleAnalyze = async () => {
    if (!analysis.input || !currentUser || !currentUser.id) return;
    setAnalysis(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await apiService.checkAnalysisLimit(currentUser.id);
      const result = await analyzeFoodText(analysis.input, currentUser);
      setAnalysis(prev => ({ ...prev, result }));
    } catch (err: any) {
      setAnalysis(prev => ({ ...prev, error: err.message }));
      notify(err.message);
    } finally {
      setAnalysis(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (isInitializing) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-black text-[10px] uppercase tracking-widest text-slate-400">
      Vitametra OS 2026...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {isLoggedIn && currentUser && <WelcomeModal />}
      
      <Header 
        isLoggedIn={isLoggedIn} 
        onLoginClick={() => setModals(m => ({ ...m, login: true }))} 
        onLogoutClick={() => apiService.logout()} 
        currentUser={currentUser} 
      />
      
      <main className="container mx-auto px-4 pt-20 pb-32">
        <Routes>
          <Route path="/" element={<HomeTab currentUser={currentUser} onStartClick={() => navigate('/analyzer')} history={dataStreams.history} />} />
          <Route path="/dashboard" element={isLoggedIn && currentUser ? <HomeTab currentUser={currentUser} history={dataStreams.history} onStartClick={() => navigate('/analyzer')} /> : <Navigate to="/" />} />
          <Route path="/import" element={isLoggedIn && currentUser ? <DataImporter /> : <Navigate to="/" />} />
          
          <Route path="/analyzer" element={
            <div className="max-w-4xl mx-auto pt-10">
              {!analysis.result ? (
                <CarbInputForm foodInput={analysis.input} setFoodInput={(v) => setAnalysis(p => ({ ...p, input: v }))} onSubmit={handleAnalyze} isLoading={analysis.isLoading} />
              ) : (
                <ResultDisplay 
                  result={analysis.result} 
                  currentUser={currentUser} 
                  onLogEntry={() => { notify("Registro Guardado"); setAnalysis(p => ({ ...p, result: null, input: '' })); navigate('/history'); }} 
                  onAdjust={() => setAnalysis(p => ({ ...p, result: null }))} 
                  onLoginRequest={() => setModals(m => ({ ...m, login: true }))} 
                  verifiedFoods={[]} onFoodItemVerified={() => {}} onDeleteItem={() => {}} 
                />
              )}
            </div>
          } />
          
          <Route path="/history" element={
            isLoggedIn && currentUser ? (
              <HistoryTab currentUser={currentUser} history={dataStreams.history} hba1cHistory={dataStreams.hba1c} 
                onDelete={(id) => { apiService.deleteHistoryEntry(id); notify("Eliminado"); }} 
                onUpdate={() => {}} onSaveHba1c={() => {}} onUpdateHba1c={() => {}} onDeleteHba1c={() => {}} onUpdateLayout={() => {}} onNavigateToAnalyzer={() => navigate('/analyzer')} 
              />
            ) : <Navigate to="/" />
          } />
          
          <Route path="/profile" element={isLoggedIn && currentUser ? <ProfileTab currentUser={currentUser} onUpdateUser={(u) => { setCurrentUser(u as UserData); notify("Perfil actualizado"); }} /> : <Navigate to="/" />} />
          <Route path="/clinical-settings" element={isLoggedIn && currentUser ? <MedicalSettings currentUser={currentUser} onUpdate={(u) => { setCurrentUser(u); notify("Ajustes guardados"); }} /> : <Navigate to="/" />} />
          <Route path="/plans" element={<PlansTab onSelectPlan={() => setModals(m => ({ ...m, login: true }))} />} />
          <Route path="/register" element={<RegisterTab onLoginSuccess={initializeSession} />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </main>

      {isLoggedIn && (
        <Navigation 
          activeTab={location.pathname.substring(1) || 'dashboard'} 
          onTabChange={(tab) => navigate(`/${tab === 'settings' ? 'clinical-settings' : tab}`)} 
        />
      )}

      <ChatBot />
      <Snackbar message={snackbar.message} snackbarKey={snackbar.key} />
      {modals.login && <LoginModal isOpen={modals.login} onClose={() => setModals(m => ({ ...m, login: false }))} onLoginSuccess={initializeSession} />}
    </div>
  );
};

export default App;