import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

// --- UI & CORE ---
import Header from './components/ui/Header';
import Navigation from './components/ui/Navigation';
import Snackbar from './components/ui/Snackbar';
import LockedView from './components/LockedView';
import LoginModal from './components/modals/LoginModal';
import WelcomeModal from './components/WelcomeModal';

// --- VISTAS MAESTRAS ---
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

// --- COMPONENTE DE CALIBRACIÓN CLÍNICA ---
import MedicalSettings from './components/medical/MedicalSettings';

// --- SERVICIOS ---
import { analyzeFoodText } from './services/geminiService';
import { apiService } from './services/apiService';
import { auth, logClinicalEvent } from './services/firebaseService';
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
    input: '',
    isLoading: false,
    result: null as any | null, // Usamos any temporalmente para aceptar la nueva estructura de memoria
    error: null as string | null
  });

  const [dataStreams, setDataStreams] = useState({
    history: [] as HistoryEntry[],
    hba1c: [] as Hba1cEntry[]
  });

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

  // Sincronización de Autenticación
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
        console.error("Auth sync error:", e);
      } finally {
        setIsInitializing(false);
      }
    });
    return () => unsub();
  }, [initializeSession]);

  // Sincronización de Datos Metabólicos (Streams)
  useEffect(() => {
    if (isLoggedIn && currentUser?.id) {
      const unsubH = apiService.subscribeToHistory(currentUser.id, (h) => 
        setDataStreams(prev => ({ ...prev, history: h })));
      const unsubHb = apiService.subscribeToHba1cHistory(currentUser.id, (hb) => 
        setDataStreams(prev => ({ ...prev, hba1c: hb })));
      return () => { unsubH(); unsubHb(); };
    }
  }, [isLoggedIn, currentUser?.id]);

  // --- LÓGICA DE ANÁLISIS CON MEMORIA ---
  const handleAnalyze = async () => {
    if (!analysis.input) return;
    
    setAnalysis(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Si hay usuario, verificamos límites. Si no, permitimos un análisis de prueba.
      if (currentUser) {
        await apiService.checkAnalysisLimit(currentUser.id);
      }

      // IMPORTANTE: Aquí pasamos el currentUser para activar la Memoria a Largo Plazo
      const result = await analyzeFoodText(analysis.input, currentUser);
      
      setAnalysis(prev => ({ ...prev, result }));

      if (currentUser) {
        await logClinicalEvent(currentUser.id, 'CARBS', result.totalCarbs, { source: 'MENTE_IA' });
      }
    } catch (err: any) {
      setAnalysis(prev => ({ ...prev, error: err.message }));
      notify(err.message);
    } finally {
      setAnalysis(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-900 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sincronizando Mente IA</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {isLoggedIn && currentUser && <WelcomeModal />}

      <Header 
        isLoggedIn={isLoggedIn} 
        onLoginClick={() => setModals(m => ({ ...m, login: true }))} 
        onLogoutClick={() => apiService.logout()} 
        currentUser={currentUser} 
      />
      
      <main className={`container mx-auto px-4 ${location.pathname === '/' ? 'pt-0' : 'pt-24'} pb-32`}>
        <Routes>
          <Route path="/" element={<HomeTab currentUser={currentUser} onStartClick={() => setModals(m => ({ ...m, login: true }))} history={dataStreams.history} />} />
          <Route path="/dashboard" element={isLoggedIn && currentUser ? <HomeTab currentUser={currentUser} history={dataStreams.history} onStartClick={() => navigate('/analyzer')} /> : <Navigate to="/" />} />
          
          <Route path="/analyzer" element={
            <div className="max-w-4xl mx-auto pt-10">
              <h2 className="text-4xl font-black text-slate-900 mb-2 text-center tracking-tighter italic">
                Bio-Scanner <span className="text-blue-600">IA</span>
              </h2>
              <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Análisis Metabólico de Precisión</p>
              
              {!analysis.result ? (
                <CarbInputForm 
                  foodInput={analysis.input} 
                  setFoodInput={(val) => setAnalysis(prev => ({ ...prev, input: val }))} 
                  onSubmit={handleAnalyze} 
                  isLoading={analysis.isLoading} 
                />
              ) : (
                <ResultDisplay 
                  result={analysis.result} 
                  currentUser={currentUser} 
                  onLogEntry={() => { 
                    notify("Registro clínico guardado."); 
                    setAnalysis(prev => ({ ...prev, result: null, input: '' })); 
                    navigate('/history');
                  }} 
                  onAdjust={() => setAnalysis(prev => ({ ...prev, result: null }))} 
                  onLoginRequest={() => setModals(m => ({ ...m, login: true }))}
                  verifiedFoods={[]} 
                  onFoodItemVerified={() => {}} 
                  onDeleteItem={() => {}} 
                />
              )}
            </div>
          } />
          
          <Route path="/history" element={isLoggedIn && currentUser ? <HistoryTab currentUser={currentUser} history={dataStreams.history} hba1cHistory={dataStreams.hba1c} onDelete={(id) => apiService.deleteHistoryEntry(id)} onUpdate={() => {}} onSaveHba1c={() => {}} onUpdateHba1c={() => {}} onDeleteHba1c={() => {}} onUpdateLayout={() => {}} onNavigateToAnalyzer={() => navigate('/analyzer')} /> : <Navigate to="/" />} />
          
          <Route path="/profile" element={isLoggedIn && currentUser ? <ProfileTab currentUser={currentUser} onUpdateUser={(u) => setCurrentUser(u as UserData)} /> : <Navigate to="/" />} />

          <Route path="/clinical-settings" element={
            isLoggedIn && currentUser ? (
              <div className="pt-10">
                <MedicalSettings currentUser={currentUser} onUpdate={(u) => setCurrentUser(u)} />
              </div>
            ) : <Navigate to="/" />
          } />

          <Route path="/plans" element={<PlansTab currentUser={currentUser} onUpdateUser={(u) => setCurrentUser(u as UserData)} />} />
          <Route path="/register" element={<RegisterTab onLoginSuccess={initializeSession} />} />
          <Route path="/institution" element={isLoggedIn && currentUser?.role === 'ADMIN_INSTITUCIONAL' ? <InstitutionalAdminTab currentUser={currentUser} /> : <Navigate to="/" />} />
          <Route path="/founder" element={isLoggedIn && currentUser?.email === 'admin@vitametra.com' ? <SuperAdminTab /> : <Navigate to="/" />} />
        </Routes>
      </main>

      {isLoggedIn && (
        <Navigation 
          activeTab={location.pathname.substring(1) || 'dashboard'} 
          onTabChange={(tab) => {
            const path = tab === 'dashboard' ? '/dashboard' : tab === 'settings' ? '/clinical-settings' : `/${tab}`;
            navigate(path);
          }} 
        />
      )}

      <ChatBot />
      <Snackbar message={snackbar.message} snackbarKey={snackbar.key} />
      {modals.login && <LoginModal isOpen={modals.login} onClose={() => setModals(m => ({ ...m, login: false }))} onLoginSuccess={initializeSession} />}
    </div>
  );
};

export default App;