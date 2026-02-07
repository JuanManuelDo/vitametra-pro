
import React, { useState, useEffect } from 'react';
import { BluetoothIcon, XMarkIcon, CheckCircleIcon, SmartphoneIcon, LockClosedIcon } from '../ui/Icons';
import { apiService } from '../../services/apiService';
import type { ImportedGlucoseEntry } from '../../types';

interface DeviceSyncModalProps {
    onClose: () => void;
    onSyncComplete: (entries: ImportedGlucoseEntry[]) => void;
}

type Step = 'INSTRUCTIONS' | 'SCANNING' | 'PIN_INPUT' | 'SYNCING' | 'SUCCESS';

const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({ onClose, onSyncComplete }) => {
    const [step, setStep] = useState<Step>('INSTRUCTIONS');
    const [progress, setProgress] = useState(0);
    const [pin, setPin] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);

    // Step 2: Simulate Scanning
    useEffect(() => {
        if (step === 'SCANNING') {
            const timer = setTimeout(() => {
                // Device found logic could go here, but UI handles the state transition manually for this mock
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Step 4: Simulate Sync Progress
    useEffect(() => {
        if (step === 'SYNCING') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 2; // Increment progress
                });
            }, 30); // Fast simulation

            // Trigger actual data fetch
            apiService.simulateGlucometerSync().then((data) => {
                setTotalRecords(data.length);
                setTimeout(() => {
                    setStep('SUCCESS');
                    onSyncComplete(data);
                }, 2000); // Wait for progress bar visual completion
            });

            return () => clearInterval(interval);
        }
    }, [step]);

    const handlePinSubmit = () => {
        if (pin.length >= 4) {
            setStep('SYNCING');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-brand-surface dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <BluetoothIcon className="w-5 h-5 text-brand-primary" />
                        Sincronización
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* STEP 1: INSTRUCTIONS */}
                    {step === 'INSTRUCTIONS' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-center">
                                <img 
                                    src="https://images.unsplash.com/photo-1576091160550-217358c7e618?auto=format&fit=crop&q=80&w=200&h=200" 
                                    alt="Accu-Chek Guide" 
                                    className="w-32 h-32 object-contain rounded-lg shadow-sm bg-white"
                                />
                            </div>
                            
                            <ol className="list-decimal pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-3">
                                <li>Enciende tu medidor.</li>
                                <li>En tu medidor, selecciona <strong>Ajustes</strong>, después <strong>Inalámbrico</strong>, y, a continuación, <strong>Sincronización</strong>.</li>
                                <li>A continuación, selecciona <strong>“Sincronizar disp.”</strong> y sigue las instrucciones que aparecen en la pantalla.</li>
                            </ol>

                            <button 
                                onClick={() => setStep('SCANNING')}
                                className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-brand-dark transition-all"
                            >
                                Buscar Dispositivo
                            </button>
                        </div>
                    )}

                    {/* STEP 2: SCANNING / DEVICE FOUND */}
                    {step === 'SCANNING' && (
                        <div className="animate-fade-in text-center space-y-6">
                            <h4 className="text-slate-600 dark:text-slate-300 font-semibold mb-2">Selecciona tu Accu-Chek Guide</h4>
                            
                            {/* Device Card */}
                            <div 
                                onClick={() => setStep('PIN_INPUT')}
                                className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-brand-primary">
                                        <SmartphoneIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-800 dark:text-white">Accu-Chek Guide</p>
                                        <p className="text-xs text-slate-500 font-mono">SN ***34721373</p>
                                    </div>
                                </div>
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>

                            <p className="text-xs text-slate-400 mt-4">Asegúrate que el Bluetooth esté activo en ambos dispositivos.</p>
                        </div>
                    )}

                    {/* STEP 3: PIN INPUT (POPUP STYLE) */}
                    {step === 'PIN_INPUT' && (
                        <div className="animate-fade-in text-center space-y-6">
                            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                                <LockClosedIcon className="w-8 h-8 text-brand-primary" />
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Vincula tu dispositivo</h3>
                                <p className="text-sm text-slate-500">Ingresa el código PIN que aparece en la pantalla de tu glucómetro.</p>
                            </div>

                            <input 
                                type="number" 
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="000000"
                                className="w-full text-center text-3xl tracking-widest font-mono p-3 border-b-2 border-brand-primary bg-transparent focus:outline-none"
                                autoFocus
                            />

                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => setStep('SCANNING')}
                                    className="flex-1 py-3 text-slate-500 font-semibold hover:bg-slate-100 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handlePinSubmit}
                                    disabled={pin.length < 4}
                                    className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-md disabled:bg-slate-300 transition-colors"
                                >
                                    Vincular
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: SYNCING (PROGRESS BAR) */}
                    {step === 'SYNCING' && (
                        <div className="text-center py-8 animate-fade-in">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Descargando registros...</h3>
                            
                            {/* Progress Bar Container */}
                            <div className="w-full bg-slate-200 rounded-full h-4 mb-4 overflow-hidden relative">
                                <div 
                                    className="bg-brand-primary h-4 rounded-full transition-all duration-100 ease-out relative overflow-hidden" 
                                    style={{ width: `${progress}%` }}
                                >
                                    {/* Shimmer Effect */}
                                    <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-500 font-mono">{progress}% Completado</p>
                            
                            <div className="mt-8 flex justify-center">
                                <SmartphoneIcon className="w-12 h-12 text-slate-300 animate-pulse" />
                            </div>
                        </div>
                    )}

                    {/* STEP 5: SUCCESS */}
                    {step === 'SUCCESS' && (
                        <div className="text-center py-6 animate-fade-in-up">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircleIcon className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">¡Sincronización Exitosa!</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-8">
                                Se descargaron <strong className="text-brand-secondary">{totalRecords} registros</strong> de glucemia automáticamente.
                            </p>
                            <button 
                                onClick={onClose}
                                className="w-full py-4 bg-brand-secondary text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition-transform transform hover:scale-[1.02]"
                            >
                                Ver Dashboard Actualizado
                            </button>
                        </div>
                    )}

                </div>
            </div>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </div>
    );
};

export default DeviceSyncModal;
