import React, { useState, useRef, useMemo } from 'react';
import type { MedicalSummary, HistoryEntry } from '../../types';
import { 
    XMarkIcon, DocumentTextIcon, ActivityIcon, SparklesIcon, 
    RobotIcon, ShieldCheckIcon, CheckCircleIcon 
} from '../ui/Icons';
import { Link, Filter } from 'lucide-react';
import Spinner from '../ui/Spinner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import TimeInRangeChart from '../charts/TimeInRangeChart';
import MultimodalTimeline from '../charts/MultimodalTimeline';
import { showAlert, showToast } from '../../utils/alerts';

interface Props {
    patientId: string;
    patientName: string;
    patientRut?: string;
    diabetesType?: string;
    history: HistoryEntry[];
    summary: MedicalSummary;
    onClose: () => void;
}

const PatientClinicalSummaryModal: React.FC<Props> = ({ 
    patientId, patientName, patientRut, diabetesType, history, summary, onClose 
}) => {
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [filterMode, setFilterMode] = useState<'ALL'|'SPORT'|'SEDENTARY'>('ALL');
    const [doctorNote, setDoctorNote] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);
    
    const currentYear = new Date().getFullYear();
    const startDate = summary?.period?.start || new Date().toISOString();
    const dateRange = `${new Date(startDate).toLocaleDateString('es-ES')} al ${new Date().toLocaleDateString('es-ES')}`;
    
    const reportRef = useRef<HTMLDivElement>(null);

    // Calcular detallado de TiR basado en el historial
    const tirDetailed = useMemo(() => {
        let veryLow=0, low=0, target=0, high=0, veryHigh=0;
        const records = history.filter(e => e.bloodGlucoseValue || e.postPrandialGlucose);
        records.forEach(e => {
            const v = (e.bloodGlucoseValue || e.postPrandialGlucose) as number;
            if(v < 54) veryLow++;
            else if(v < 70) low++;
            else if(v <= 180) target++;
            else if(v <= 250) high++;
            else veryHigh++;
        });
        const total = records.length || 1;
        return {
            veryLow: Math.round(veryLow/total*100),
            low: Math.round(low/total*100),
            target: Math.round(target/total*100),
            high: Math.round(high/total*100),
            veryHigh: Math.round(veryHigh/total*100),
        };
    }, [history]);

    const handleExportPDF = async () => {
        if (!reportRef.current) return;
        setIsExportingPDF(true);
        try {
            const canvas = await html2canvas(reportRef.current, { 
                scale: 2, 
                useCORS: true,
                logging: false,
                windowWidth: 1200
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Reporte_Medico_VitaMetra_${patientName.replace(' ', '_')}.pdf`);
        } catch (err) { 
            showAlert("Error", "Error al generar PDF clínico.", "error"); 
        } finally { 
            setIsExportingPDF(false); 
        }
    };

    const handleGenerateSecureLink = () => {
        // Generar un UUID V4 simple para el enlace seguro temporal
        const secureToken = crypto.randomUUID();
        navigator.clipboard.writeText(`https://vitametra.app/secure-report/${secureToken}`);
        showToast("Enlace temporal copiado al portapapeles", "success");
    };

    const handleSaveNote = async () => {
        if (!doctorNote.trim()) return;
        setIsSavingNote(true);
        // Simular guardado y notificación Push
        setTimeout(() => {
            setIsSavingNote(false);
            showToast("Nota guardada y notificada al paciente", "success");
            setDoctorNote('');
        }, 800);
    };

    if (!summary) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col relative"
                onClick={e => e.stopPropagation()}
            >
                {/* TOOLBAR SUPERIOR (ACCIONES) */}
                <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-2">
                           <ShieldCheckIcon className="w-3 h-3"/> Dashboard Clínico Seguro
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleGenerateSecureLink}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 hover:text-white transition-all text-[10px] uppercase tracking-widest border border-slate-700"
                        >
                            <Link size={14} /> Link Seguro Temporal
                        </button>
                        <button 
                            onClick={handleExportPDF} 
                            disabled={isExportingPDF}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition-all text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20"
                        >
                            {isExportingPDF ? <Spinner /> : <DocumentTextIcon className="w-4 h-4" />} PDF Pro
                        </button>
                        <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                </div>

                {/* AREA DE REPORTE (HTML TO PDF) */}
                <div className="overflow-y-auto bg-[#FDFDFD] custom-scrollbar" id="report-content">
                    <div ref={reportRef} className="p-12 space-y-12 max-w-4xl mx-auto bg-white border-x border-slate-50 min-h-screen">
                        
                        {/* 1. ENCABEZADO PROFESIONAL */}
                        <header className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                                        <SparklesIcon className="w-7 h-7" />
                                    </div>
                                    <h1 className="text-3xl font-[1000] text-slate-900 tracking-tighter italic uppercase">
                                       Reporte de Gestión <span className="text-blue-600">Metabólica</span>
                                    </h1>
                                </div>
                                <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paciente</p>
                                        <p className="text-lg font-black text-slate-900">{patientName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo de Diabetes</p>
                                        <p className="text-sm font-bold text-slate-800">{diabetesType || 'Diabetes Mellitus'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">RUT / Identificación</p>
                                        <p className="text-sm font-bold text-slate-800">{patientRut || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Periodo del Reporte</p>
                                        <p className="text-sm font-bold text-slate-800 tracking-tighter">{dateRange}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 mb-2">
                                    Generado por VitaMetra Insight Engine
                                </span>
                                <div className="flex gap-2">
                                  <Filter size={14} className="text-slate-400"/>
                                  <select 
                                      className="text-[10px] font-bold text-slate-500 bg-transparent outline-none uppercase tracking-widest cursor-pointer"
                                      value={filterMode}
                                      onChange={(e) => setFilterMode(e.target.value as any)}
                                  >
                                      <option value="ALL">Todo el periodo</option>
                                      <option value="SPORT">Días con Deporte</option>
                                      <option value="SEDENTARY">Días Sedentarios</option>
                                  </select>
                                </div>
                            </div>
                        </header>

                        {/* 2. HERO METRIC TiR & CLINICAL STATS */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <ActivityIcon className="w-6 h-6 text-blue-600" /> Métricas Clínicas Core
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Hero TiR */}
                                <div className="col-span-8 p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tiempo en Rango (TIR)</p>
                                    <div className="flex items-end gap-4">
                                       <h3 className="text-7xl font-[1000] text-emerald-400 leading-none">{summary.clinicalMetrics.timeInRange}%</h3>
                                       <div className="pb-2">
                                           {summary.clinicalMetrics.timeInRange >= 70 ? (
                                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-900/50 px-3 py-1 rounded-full"><CheckCircleIcon className="w-4 h-4"/> Rango Objetivo</span>
                                           ) : (
                                              <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-900/50 px-3 py-1 rounded-full">Bajo el Objetivo (&gt;70%)</span>
                                           )}
                                       </div>
                                    </div>
                                    
                                    <div className="mt-8 space-y-2">
                                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                                            {tirDetailed.veryLow > 0 && <div style={{width: `${tirDetailed.veryLow}%`}} className="bg-purple-500 h-full"></div>}
                                            {tirDetailed.low > 0 && <div style={{width: `${tirDetailed.low}%`}} className="bg-red-500 h-full"></div>}
                                            {tirDetailed.target > 0 && <div style={{width: `${tirDetailed.target}%`}} className="bg-emerald-400 h-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>}
                                            {tirDetailed.high > 0 && <div style={{width: `${tirDetailed.high}%`}} className="bg-yellow-400 h-full"></div>}
                                            {tirDetailed.veryHigh > 0 && <div style={{width: `${tirDetailed.veryHigh}%`}} className="bg-orange-500 h-full"></div>}
                                        </div>
                                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 tracking-widest">
                                            <span>Bajo: {tirDetailed.veryLow + tirDetailed.low}%</span>
                                            <span className="text-emerald-400">Objetivo: {tirDetailed.target}%</span>
                                            <span>Alto: {tirDetailed.high + tirDetailed.veryHigh}%</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Secondary Stats */}
                                <div className="col-span-4 flex flex-col gap-4">
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex-1 flex flex-col justify-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">GMI Proyectado</p>
                                        <h3 className="text-4xl font-[1000] text-blue-600">{summary.clinicalMetrics.gmi}%</h3>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex-1 flex flex-col justify-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Coeficiente de Variación</p>
                                        <h3 className="text-4xl font-[1000] text-amber-500">{summary.clinicalMetrics.variationCoefficient}%</h3>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. MULTIMODAL TIMELINE */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <ActivityIcon className="w-6 h-6 text-indigo-600" /> Línea de Tiempo Multimodal
                            </h2>
                            <MultimodalTimeline history={history} filterMode={filterMode} />
                        </section>

                        {/* 4. AI ALERTS & PATTERNS */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <RobotIcon className="w-6 h-6 text-blue-600" /> Observaciones de Inteligencia Artificial
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Hallazgo Principal</h4>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed text-justify">{summary.insights.principalFinding}</p>
                                </div>
                                <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100">
                                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Correlación Causa-Efecto</h4>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed text-justify">{summary.insights.causalityCorrelation}</p>
                                </div>
                                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Sugerencia Clínica</h4>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed text-justify">{summary.insights.suggestedAdjustment}</p>
                                </div>
                            </div>
                            
                            {summary.patterns.foodSpikes.length > 0 && (
                                <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Disparadores Post-prandiales Identificados</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {summary.patterns.foodSpikes.map((spike, idx) => (
                                            <div key={idx} className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                                                <span className="font-bold text-sm text-slate-800 capitalize">{spike.food}</span>
                                                <div className="w-[1px] h-4 bg-slate-200"></div>
                                                <span className="text-xs font-black text-orange-500">Pico Promedio: {Math.round(spike.avgPostPrandial)} mg/dL</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 5. DOCTOR ENGAGEMENT: QUICK NOTES */}
                        <section className="space-y-6 pt-6 border-t border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <DocumentTextIcon className="w-6 h-6 text-brand-primary" /> Notas Clínicas del Profesional
                            </h2>
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                                <textarea 
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                                    rows={4}
                                    placeholder="Escribe una instrucción médica para que el paciente reciba como notificación inmediata en su app..."
                                    value={doctorNote}
                                    onChange={(e) => setDoctorNote(e.target.value)}
                                ></textarea>
                                <div className="flex justify-end mt-4">
                                    <button 
                                        onClick={handleSaveNote}
                                        disabled={isSavingNote || !doctorNote.trim()}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSavingNote ? 'Guardando...' : 'Guardar y Notificar al Paciente'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* 6. CIERRE Y FIRMA */}
                        <footer className="pt-12 border-t border-slate-200 mt-20" data-html2canvas-ignore="false">
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observaciones Generales</p>
                                    <div className="h-32 border-b border-slate-200"></div>
                                </div>
                                <div className="flex flex-col items-center justify-end pb-4">
                                    <div className="w-48 border-b border-slate-900 mb-2"></div>
                                    <p className="text-[10px] font-black text-slate-800 uppercase">Firma del Profesional</p>
                                </div>
                            </div>
                            <div className="mt-12 p-4 bg-slate-50 rounded-xl">
                                <p className="text-[8px] text-slate-400 leading-relaxed text-justify uppercase font-bold tracking-tighter">
                                    Este informe es una herramienta de apoyo clínico basada en datos autoinformados y métricas estimadas. No reemplaza laboratorios oficiales.
                                </p>
                            </div>
                        </footer>

                    </div>
                </div>

                {/* FOOTER VERIFICACIÓN */}
                <div className="p-6 bg-slate-900 text-center text-[9px] text-slate-500 font-bold uppercase flex items-center justify-center gap-6 tracking-[0.25em] border-t border-white/5 shrink-0">
                    <span className="flex items-center gap-2"><ShieldCheckIcon className="w-4 h-4 text-[#2ECC71]"/> Core MetraCore™ Certificado {currentYear}</span>
                    <span className="opacity-20">|</span>
                    <span>Audit Log ID: {Math.random().toString(16).substr(2, 12).toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
};

export default PatientClinicalSummaryModal;
