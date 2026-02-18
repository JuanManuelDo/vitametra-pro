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
import ClosureModal from './components/modals/ClosureModal'; // IMPORTADO

// 2. TABS Y PÁGINAS (RUTAS PROFESIONALES)
import HomeTab from './tabs/HomeTab';
import HistoryTab from './components/HistoryTab';
import ProfileTab from './components/ProfileTab';
import RegisterTab from './components/auth/RegisterTab';
import PlansTab from './components/PlansTab'; 
import CarbInputForm from './components/CarbInputForm';
import ChatBot from './components/ChatBot';
import MedicalSettings from './components/medical/MedicalSettings';
import DataImporter from './components/medical/DataImporter';
import PaymentSuccess from './components/payments/PaymentSuccess';

// 3. SERVICIOS Y TIPOS
import { analyzeFoodText } from './services/ai/geminiService';
import { apiService } from './services/infrastructure/apiService';
import { auth } from './services/infrastructure/firebaseService';
import type { UserData, HistoryEntry, Hba1cEntry } from './types';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [modals, setModals] = useState({ login: false, chat: false });
  const [snackbar, setSnackbar] = useState({ message: '', key: 0 });

  // Estado para el Cierre de Bucle Metabólico
  const [activeClosure, setActiveClosure] = useState<HistoryEntry | null>(null);

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
    if (location.pathname === '/' || location.pathname === '/planes') {
      navigate('/dashboard');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const profile = await apiService.getUserProfile(user.uid);
          if (profile) {
            initializeSession(profile);
          }
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

  // LOGICA DE CIERRE DE BUCLE (IP REAL)
  const handleFinalizeClosure = async (id: string, glucose: number, score: number, insight: string) => {
    try {
      await apiService.closeLearningLoop(id, glucose, score, insight);
      setActiveClosure(null);
      notify("Bucle metabólico cerrado. IA optimizada.");
    } catch (e) {
      notify("Error al sincronizar el aprendizaje.");
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
          <Route path="/" element={
            <HomeTab 
              currentUser={currentUser} 
              onStartClick={() => navigate(isLoggedIn ? '/analyzer' : '/register')} 
              history={dataStreams.history} 
            />
          } />

          <Route path="/planes" element={
            <PlansTab onSelectPlan={() => {
              if (!isLoggedIn) setModals(m => ({ ...m, login: true }));
              else navigate('/profile');
            }} />
          } />

          {/* HomeTab en Dashboard también recibe el disparador para abrir el modal */}
          <Route path="/dashboard" element={
            isLoggedIn ? 
            <HomeTab 
              currentUser={currentUser} 
              history={dataStreams.history} 
              onStartClick={() => navigate('/analyzer')}
            /> : <Navigate to="/" />
          } />

          <Route path="/import" element={isLoggedIn ? <DataImporter /> : <Navigate to="/" />} />
          
          <Route path="/analyzer" element={
            isLoggedIn ? (
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
            ) : <Navigate to="/" />
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
          <Route path="/register" element={<RegisterTab onLoginSuccess={initializeSession} />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {isLoggedIn && (
        <Navigation 
          activeTab={location.pathname.substring(1) || 'dashboard'} 
          onTabChange={(tab) => {
            const path = tab === 'settings' ? 'clinical-settings' : tab;
            navigate(`/${path}`);
          }} 
        />
      )}

      {/* MODALES GLOBALES */}
      {activeClosure && (
        <ClosureModal 
          mealEntry={activeClosure} 
          onClose={() => setActiveClosure(null)} 
          onSaveClosure={handleFinalizeClosure} 
        />
      )}

      <ChatBot />
      <Snackbar message={snackbar.message} snackbarKey={snackbar.key} />
      {modals.login && <LoginModal isOpen={modals.login} onClose={() => setModals(m => ({ ...m, login: false }))} onLoginSuccess={initializeSession} />}
    </div>
  );
};

export default App;