import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

// --- CONFIGURACIÓN DE IDENTIDAD VITAMETRA ---
import { APP_CONFIG, UI_MESSAGES } from './constants';

// --- COMPONENTES DE UI NUCLEARES ---
import Header from './components/ui/Header';
import Navigation from './components/ui/Navigation';
import Snackbar from './components/ui/Snackbar';
import LockedView from './components/LockedView';

// --- SISTEMA DE MODALES E INTERACCIÓN ---
import LoginModal from './components/modals/LoginModal';
import AuthBarrierModal from './components/modals/AuthBarrierModal'; 
import LimitReachedModal from './components/modals/LimitReachedModal'; 
import WelcomeModal from './components/WelcomeModal';

// --- VISTAS MAESTRAS (TABS) ---
import HomeTab from './tabs/HomeTab';
import HistoryTab from './components/HistoryTab';
import ProfileTab from './components/ProfileTab';
import RegisterTab from './components/RegisterTab';
import PlansTab from './components/PlansTab'; 
import CarbInputForm from './components/CarbInputForm';
import ResultDisplay from './components/ResultDisplay';
import ChatBot from './components/ChatBot';
import InstitutionalAdminTab from './components/InstitutionalAdminTab';
import SuperAdminTab from './components/SuperAdminTab';

// --- SERVICIOS CORE ---
import { analyzeFoodText } from './services/geminiService';
import { apiService } from './services/apiService';
import { auth } from './services/firebaseService';
import type { AnalysisResult, UserData, VerifiedFood, HistoryEntry, Hba1cEntry } from './types';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [modals, setModals] = useState({
    login: false,
    authBarrier: false,
    limit: false,
    chat: false
  });

  const [analysis, setAnalysis] = useState({
    input: '',
    isLoading: false,
    result: null as AnalysisResult | null,
    error: null as string | null,
    dailyLeft: 3
  });

  const [dataStreams, setDataStreams] = useState({
    history: [] as HistoryEntry[],
    hba1c: [] as Hba1cEntry[],
    lastDeleted: null as HistoryEntry | null
  });

  const [snackbar, setSnackbar] = useState({ message: '', key: 0 });

  const notify = (msg: string) => setSnackbar({ message: msg, key: Date.now() });

  const initializeSession = useCallback((userData: UserData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    if (location.pathname === '/') {
        if (userData.email === 'admin@vitametra.com') navigate('/founder');
        else if (userData.role === 'ADMIN_INSTITUCIONAL') navigate('/institution');
        else navigate('/dashboard');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await apiService.getUserProfile(user.uid);
          if (profile) initializeSession(profile);
        } catch (e) { console.error("Error profile:", e); }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      setIsInitializing(false);
    });
    return () => unsub();
  }, [initializeSession]);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const unsubH = apiService.subscribeToHistory(currentUser.id, (h) => 
        setDataStreams(prev => ({ ...prev, history: h })));
      const unsubHb = apiService.subscribeToHba1cHistory(currentUser.id, (hb) => 
        setDataStreams(prev => ({ ...prev, hba1c: hb })));
      return () => { unsubH(); unsubHb(); };
    }
  }, [isLoggedIn, currentUser]);

  const handleAnalyze = async () => {
    if (!analysis.input) return;
    if (!currentUser) { setModals(m => ({ ...m, authBarrier: true })); return; }
    setAnalysis(prev => ({ ...prev, isLoading: true, result: null, error: null }));
    try {
      await apiService.checkAnalysisLimit(currentUser.id);
      const result = await analyzeFoodText(analysis.input, undefined);
      setAnalysis(prev => ({ 
        ...prev, 
        result, 
        dailyLeft: currentUser.subscription_tier === 'PRO' ? Infinity : Math.max(0, prev.dailyLeft - 1)
      }));
    } catch (err: any) {
      if (err.message?.includes("límite")) setModals(m => ({ ...m, limit: true }));
      else setAnalysis(prev => ({ ...prev, error: err.message }));
    } finally {
      setAnalysis(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (isInitializing) return <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center animate-pulse" />;

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {isLoggedIn && <WelcomeModal />}

      <Header 
        isLoggedIn={isLoggedIn} 
        onLoginClick={() => setModals(m => ({ ...m, login: true }))} 
        onLogoutClick={() => { apiService.logout(); setIsLoggedIn(false); }} 
        currentUser={currentUser} 
      />
      
      <main className={`container mx-auto px-4 ${location.pathname === '/' ? 'pt-0' : 'pt-24'} pb-32`}>
        <Routes>
          <Route path="/" element={
            <HomeTab 
              currentUser={currentUser || ({} as UserData)} 
              history={dataStreams.history} 
              hba1cHistory={dataStreams.hba1c} 
              onSaveHba1c={(e) => apiService.saveHba1cEntry({...e, id: `hba1c-${Date.now()}`, userId: currentUser?.id || ''})} 
              onAccessModuleClick={() => navigate('/analyzer')} 
              onGoToProfileClick={() => navigate('/plans')} 
              onOpenChatbot={() => setModals(m => ({ ...m, chat: true }))} 
              dailyAnalysisLeft={analysis.dailyLeft} 
              onStartClick={() => setModals(m => ({ ...m, login: true }))} 
            />
          }/>

          <Route path="/dashboard" element={isLoggedIn ? <Navigate to="/" /> : <Navigate to="/" />} />
          
          <Route path="/analyzer" element={
            <div className="max-w-4xl mx-auto pt-10">
              <h2 className="text-3xl font-[1000] italic uppercase tracking-tighter text-[#007AFF] mb-8 text-center">VITA<span className="text-slate-900">FLOW</span></h2>
              {!analysis.result ? (
                <CarbInputForm foodInput={analysis.input} setFoodInput={(val) => setAnalysis(prev => ({ ...prev, input: val }))} onSubmit={handleAnalyze} isLoading={analysis.isLoading} />
              ) : (
                <ResultDisplay 
                  result={analysis.result} 
                  currentUser={currentUser} 
                  onLogEntry={() => notify("Guardado.")} 
                  onLoginRequest={() => setModals(m => ({ ...m, login: true }))} 
                  onAdjust={() => setAnalysis(prev => ({ ...prev, result: null }))} 
                  onFoodItemVerified={() => {}} 
                  verifiedFoods={[]} 
                  onDeleteItem={() => {}} 
                />
              )}
            </div>
          } />
          
          <Route path="/history" element={isLoggedIn ? <HistoryTab currentUser={currentUser!} history={dataStreams.history} hba1cHistory={dataStreams.hba1c} onDelete={(id) => apiService.deleteHistoryEntry(id)} onUpdate={() => {}} onSaveHba1c={() => {}} onUpdateHba1c={() => {}} onDeleteHba1c={() => {}} onUpdateLayout={() => {}} onNavigateToAnalyzer={() => navigate('/analyzer')} /> : <LockedView title="Historial" message="Inicia sesión." onLoginClick={() => setModals(m => ({ ...m, login: true }))} onRegisterClick={() => navigate('/register')} />} />
          <Route path="/profile" element={isLoggedIn ? <ProfileTab currentUser={currentUser!} onUpdateUser={(user) => setCurrentUser(user as UserData)} /> : <LockedView title="Perfil" message="Identifícate." onLoginClick={() => setModals(m => ({ ...m, login: true }))} onRegisterClick={() => navigate('/register')} />} />
          <Route path="/plans" element={<PlansTab currentUser={currentUser} onUpdateUser={(user) => setCurrentUser(user as UserData)} />} />
          <Route path="/register" element={<RegisterTab onLoginSuccess={initializeSession} />} />
          <Route path="/institution" element={isLoggedIn && currentUser?.role === 'ADMIN_INSTITUCIONAL' ? <InstitutionalAdminTab currentUser={currentUser} /> : <Navigate to="/" />} />
          <Route path="/founder" element={isLoggedIn && currentUser?.email === 'admin@vitametra.com' ? <SuperAdminTab /> : <Navigate to="/" />} />
        </Routes>
      </main>

      {isLoggedIn && <Navigation activeTab={location.pathname.substring(1) || 'dashboard'} onTabChange={(tab) => navigate(`/${tab === 'dashboard' ? '' : tab}`)} />}
      
      <ChatBot currentUser={currentUser} isOpen={modals.chat} onToggle={() => setModals(m => ({ ...m, chat: !m.chat }))} history={dataStreams.history} />
      
      {modals.login && <LoginModal onClose={() => setModals(m => ({ ...m, login: false }))} onLoginSuccess={initializeSession} />}
      {modals.authBarrier && <AuthBarrierModal onClose={() => setModals(m => ({ ...m, authBarrier: false }))} onRegisterClick={() => navigate('/register')} onLoginClick={() => setModals(m => ({ ...m, login: true }))} />}
      {modals.limit && <LimitReachedModal onClose={() => setModals(m => ({ ...m, limit: false }))} onUpgradeClick={() => navigate('/plans')} />}
      
      <Snackbar message={snackbar.message} snackbarKey={snackbar.key} />
    </div>
  );
};

export default App;