import React, { useState, useEffect, useRef } from 'react';
import { 
    XMarkIcon, CheckCircleIcon, SmartphoneIcon, 
    DocumentTextIcon, ActivityIcon, ShieldCheckIcon 
} from '../ui/Icons';
import { UploadCloud, ChevronRight, FileJson, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/infrastructure/apiService';
import type { HistoryEntry } from '../../types';
import { showToast } from '../../utils/alerts';

import { auth } from '../../services/infrastructure/firebaseService';

interface DeviceSyncModalProps {
    onClose: () => void;
    onSyncComplete: (entries: HistoryEntry[]) => void;
}

type Step = 'DEVICE_SELECTION' | 'EXPORT_GUIDE' | 'DROP_ZONE' | 'ANALYSING' | 'VALIDATING' | 'SUCCESS';

interface DeviceOption {
    id: string;
    name: string;
    type: 'CGM' | 'Bomba' | 'Glucómetro';
    brandBrand: string;
    guide: string[];
    bgClass: string;
}

const DEVICES: DeviceOption[] = [
    { 
        id: 'libre', name: 'FreeStyle Libre', type: 'CGM', brandBrand: 'Abbott', 
        bgClass: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
        guide: [
            "1. Ingresa a LibreView.com desde tu computadora.",
            "2. Ve a 'Historial de Glucosa' o 'Reportes'.",
            "3. Haz clic en 'Descargar datos de glucosa' (botón arriba a la derecha).",
            "4. Guarda el archivo CSV en tu computadora."
        ]
    },
    { 
        id: 'dexcom', name: 'Dexcom G6/G7', type: 'CGM', brandBrand: 'Dexcom', 
        bgClass: 'bg-green-50 hover:bg-green-100 border-green-200',
        guide: [
            "1. Abre Dexcom Clarity en tu clínica o cuenta personal.",
            "2. Selecciona el rango de fechas deseado (ej. últimos 14 días).",
            "3. Haz clic en 'Exportar' en la esquina superior derecha.",
            "4. Descarga el reporte en formato CSV."
        ]
    },
    { 
        id: 'medtronic', name: 'CareLink', type: 'Bomba', brandBrand: 'Medtronic', 
        bgClass: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
        guide: [
            "1. Inicia sesión en CareLink Personal.",
            "2. Ve a la pestaña de 'Informes'.",
            "3. Selecciona 'Exportación de Datos' u obtén el PDF de evaluación.",
            "4. Selecciona el rango de tiempo y descarga tu archivo."
        ]
    },
];

const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({ onClose, onSyncComplete }) => {
    const [step, setStep] = useState<Step>('DEVICE_SELECTION');
    const [selectedDevice, setSelectedDevice] = useState<DeviceOption | null>(null);
    const [progress, setProgress] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [fileId, setFileId] = useState<string | null>(null);
    const [statusText, setStatusText] = useState('Analizando estructura del archivo...');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Simulated text animation during analysis
    useEffect(() => {
        if (step === 'ANALYSING') {
            const texts = [
                'Verificando encriptación...',
                'Extrayendo series temporales...',
                'Correlacionando con IA de Nutria...',
                'Calculando Tiempo en Rango...'
            ];
            
            let textIndex = 0;
            const textInterval = setInterval(() => {
                textIndex = (textIndex + 1) % texts.length;
                setStatusText(texts[textIndex]);
            }, 800);

            return () => {
                clearInterval(textInterval);
            };
        }
    }, [step]);

    // Firestore listener for AI completion
    useEffect(() => {
        if (step === 'ANALYSING' && fileId && auth.currentUser) {
            const unsub = apiService.subscribeToPendingReport(auth.currentUser.uid, fileId, (data) => {
                if (data.status === 'ANALYZED') {
                    setExtractedData(data);
                    setStep('VALIDATING');
                } else if (data.status === 'ERROR') {
                    showToast(data.error || 'No se pudo leer el archivo', 'error');
                    setStep('DROP_ZONE');
                }
            });
            return () => unsub();
        }
    }, [step, fileId]);

    const handleDeviceSelect = (device: DeviceOption) => {
        setSelectedDevice(device);
        setStep('EXPORT_GUIDE');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        e.preventDefault();
        
        let file: File | null = null;
        if ('dataTransfer' in e && e.dataTransfer.files.length > 0) {
            file = e.dataTransfer.files[0];
        } else if ('target' in e) {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files.length > 0) file = target.files[0];
        }

        if (!file || !auth.currentUser) return;
        
        setStep('ANALYSING');
        setProgress(0);
        
        try {
            const uploadedFileId = await apiService.uploadMedicalReport(auth.currentUser.uid, file, (pct) => {
                setProgress(Math.round(pct)); // Track real upload progress
            });
            setFileId(uploadedFileId);
        } catch (error) {
            showToast('No se pudo cargar el archivo seguro.', 'error');
            setStep('DROP_ZONE');
        }
    };

    const handleConfirmValidation = async () => {
        if (!auth.currentUser || !fileId || !extractedData) return;
        setStep('ANALYSING'); // Use as a quick loading state
        setStatusText("Guardando historial clínico...");
        try {
            await apiService.confirmAndSaveMedicalData(auth.currentUser.uid, fileId, extractedData);
            setTotalRecords(extractedData.detectedGlucoseReadings || 0);
            setStep('SUCCESS');
            onSyncComplete(extractedData.glucose || []);
        } catch (error) {
            showToast('Error guardando los datos finales', 'error');
            setStep('VALIDATING');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110] p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header Profesional */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ActivityIcon className="w-5 h-5 text-blue-600" />
                            <h3 className="font-black text-xl text-slate-800 tracking-tight uppercase italic">VitaFlow <span className="text-blue-600">Onboarding</span></h3>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {step === 'DEVICE_SELECTION' && 'Paso 1: Selecciona tu Fuente de Datos'}
                            {step === 'EXPORT_GUIDE' && `Paso 2: Descarga desde ${selectedDevice?.name}`}
                            {step === 'DROP_ZONE' && 'Paso 3: Carga Segura de Archivos'}
                            {step === 'ANALYSING' && 'Procesando con IA Clínica'}
                            {step === 'VALIDATING' && 'Paso 4: Auditoría de Datos'}
                            {step === 'SUCCESS' && 'Integración Exitosa'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    
                    {/* STEP 1: CAROUSEL / GRID DE DISPOSITIVOS */}
                    {step === 'DEVICE_SELECTION' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="text-center mb-8">
                                <h4 className="text-slate-800 font-[1000] text-2xl mb-2">Conecta tu Dispositivo Médico</h4>
                                <p className="text-slate-500 font-medium text-sm">Selecciona el fabricante de tu Monitor Continuo (CGM) o Bomba de Insulina para ver las instrucciones.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {DEVICES.map(device => (
                                    <button 
                                        key={device.id}
                                        onClick={() => handleDeviceSelect(device)}
                                        className={`flex flex-col items-start p-5 rounded-2xl border transition-all text-left shadow-sm hover:-translate-y-1 ${device.bgClass}`}
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                                            <SmartphoneIcon className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{device.brandBrand}</span>
                                        <span className="font-bold text-slate-800 text-lg leading-tight">{device.name}</span>
                                        <span className="mt-2 text-[10px] bg-white/50 px-2 py-1 rounded-md font-bold text-slate-600 border border-black/5">{device.type}</span>
                                    </button>
                                ))}
                            </div>
                            
                            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                                <FileJson className="w-6 h-6 text-slate-400" />
                                <div>
                                   <p className="text-sm font-bold text-slate-700">¿Tienes un archivo genérico?</p>
                                   <p className="text-xs text-slate-500">Nuestra IA puede procesar CSVs y PDFs estándar de otros fabricantes.</p>
                                </div>
                                <button 
                                    onClick={() => setStep('DROP_ZONE')}
                                    className="ml-auto px-4 py-2 bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Ir directo a subir
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: EXPORT GUIDE */}
                    {step === 'EXPORT_GUIDE' && selectedDevice && (
                        <div className="animate-fade-in space-y-8">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                    <ActivityIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-[1000] text-xl text-slate-800">Exportar desde {selectedDevice.name}</h4>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instrucciones Oficiales</p>
                                </div>
                            </div>

                            <ol className="space-y-4">
                                {selectedDevice.guide.map((instruction, idx) => (
                                    <li key={idx} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm items-center">
                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xs shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700">{instruction.substring(3)}</p>
                                    </li>
                                ))}
                            </ol>

                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button 
                                    onClick={() => setStep('DEVICE_SELECTION')}
                                    className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                                >
                                    Volver
                                </button>
                                <button 
                                    onClick={() => setStep('DROP_ZONE')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-[10px]"
                                >
                                    Ya tengo mi archivo <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: MULTIMODAL DROP ZONE */}
                    {step === 'DROP_ZONE' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="text-center mb-6">
                                <h4 className="text-2xl font-[1000] text-slate-800">Carga tu Reporte Médico</h4>
                                <p className="text-sm font-medium text-slate-500">Admitimos archivos PDF, hojas de cálculo CSV o imágenes de pantallas.</p>
                            </div>

                            <div 
                                className="border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 rounded-[2rem] p-12 text-center transition-all cursor-pointer group"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleFileUpload}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    accept=".csv, .pdf, image/png, image/jpeg"
                                    onChange={handleFileUpload}
                                />
                                <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:-translate-y-2 transition-transform">
                                    <UploadCloud className="w-10 h-10 text-blue-500" />
                                </div>
                                <h5 className="text-lg font-bold text-slate-800 mb-2">Arrastra tu archivo aquí</h5>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">o haz clic para explorar tus carpetas</p>
                                
                                <div className="mt-6 flex justify-center gap-3">
                                   <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase text-slate-500 border border-slate-200 shadow-sm">PDF</span>
                                   <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase text-slate-500 border border-slate-200 shadow-sm">CSV</span>
                                   <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase text-slate-500 border border-slate-200 shadow-sm">PNG / JPG</span>
                                </div>
                            </div>

                            {/* Trust Message */}
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-4 items-start">
                                <ShieldCheckIcon className="w-6 h-6 text-emerald-500 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-800">Privacidad Clínica Garantizada</p>
                                    <p className="text-xs font-medium text-emerald-600/80">Tus datos de salud están encriptados y protegidos bajo estándares médicos. Solo tú y tu profesional tratante pueden verlos.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: ANALYSING MICRO-INTERACTION */}
                    {step === 'ANALYSING' && (
                        <div className="text-center py-16 animate-fade-in flex flex-col items-center">
                            <div className="w-24 h-24 mb-8 relative">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div 
                                    className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
                                ></div>
                                <ActivityIcon className="w-10 h-10 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            
                            <h3 className="text-2xl font-[1000] text-slate-800 mb-2">{progress}%</h3>
                            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-6 min-h-[20px]">{statusText}</p>
                            
                            <div className="w-full max-w-sm bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                                <div 
                                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all duration-75 ease-linear" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-8 flex items-center justify-center gap-2">
                                <ShieldCheckIcon className="w-4 h-4" /> Encriptación Activa
                            </p>
                        </div>
                    )}

                    {/* STEP 5: VALIDATING DATA */}
                    {step === 'VALIDATING' && extractedData && (
                        <div className="text-center py-6 animate-fade-in flex flex-col items-center max-w-lg mx-auto">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                                <ActivityIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-[1000] text-slate-800 mb-2">Auditoría de Datos</h3>
                            <p className="text-slate-500 font-medium mb-6">Hemos procesado tu documento exitosamente. Por favor verifica que el resumen sea consistente con tu dispositivo.</p>
                            
                            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-left space-y-4">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resumen Clínico (IA)</span>
                                    <p className="text-sm font-bold text-slate-700 mt-1">{extractedData.summary}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Glucemias Detectadas</span>
                                        <p className="text-xl font-black text-blue-600">{extractedData.detectedGlucoseReadings}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dosis de Insulina</span>
                                        <p className="text-xl font-black text-blue-600">{extractedData.detectedInsulinDoses}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full gap-4">
                                <button 
                                    onClick={() => setStep('DROP_ZONE')}
                                    className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all text-[10px]"
                                >
                                    Rechazar / Re-subir
                                </button>
                                <button 
                                    onClick={handleConfirmValidation}
                                    className="flex-1 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-blue-700 transition-all text-[10px] flex items-center justify-center gap-2"
                                >
                                    <CheckCircleIcon className="w-4 h-4" /> Sí, es Correcto
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: SUCCESS */}
                    {step === 'SUCCESS' && (
                        <div className="text-center py-12 animate-fade-in flex flex-col items-center">
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                                <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
                            </div>
                            <h3 className="text-3xl font-[1000] text-slate-800 uppercase italic tracking-tighter mb-2">¡Datos Procesados!</h3>
                            <p className="text-slate-500 font-medium mb-8 max-w-sm">
                                Se descargaron y analizaron <strong className="text-emerald-600">{totalRecords} registros clínicos</strong> exitosamente.
                            </p>
                            <button 
                                onClick={onClose}
                                className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl shadow-2xl hover:bg-slate-800 hover:-translate-y-1 transition-all text-xs"
                            >
                                Calcular Insights con IA
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default DeviceSyncModal; DeviceSyncModal;
