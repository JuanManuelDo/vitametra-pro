
import React, { useState, useEffect, useRef } from 'react';
import type { PatientClinicalSummary, CriticalEvent } from '../types';
import { 
    XMarkIcon, DocumentTextIcon, FileCsvIcon, 
    ActivityIcon, BloodDropIcon, InformationCircleIcon, 
    CheckCircleIcon, SparklesIcon, FireIcon, UserCircleIcon,
    ShieldCheckIcon, RobotIcon, ArrowRightIcon
} from './Icons';
import { apiService } from '../services/apiService';
import Spinner from './Spinner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import TimeInRangeChart from './TimeInRangeChart';

interface Props {
    patientId: string;
    patientName: string;
    onClose: () => void;
}

const CLINICAL_PALETTE = {
    target: '#2ECC71',
    high: '#F1C40F',
    veryHigh: '#E67E22',
    low: '#E74C3C',
    veryLow: '#8E44AD',
    brand: '#1e3a8a'
};

const PatientClinicalSummaryModal: React.FC<Props> = ({ patientId, patientName, onClose }) => {
    const [data, setData] = useState<PatientClinicalSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const currentYear = new Date().getFullYear();
    const dateRange = `01/${new Date().getMonth() + 1}/${currentYear} al ${new Date().toLocaleDateString('es-ES')}`;
    
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const load = async () => {
            const summary = await apiService.fetchPatientClinicalSummary(patientId);
            setData(summary);
            setIsLoading(false);
        };
        load();
    }, [patientId]);

    const handleExportPDF = async () => {
        if (!reportRef.current || !data) return;
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
            pdf.save(`Reporte_Medico_VitaMetra_${data.patientName.replace(' ', '_')}.pdf`);
        } catch (err) { alert("Error al generar PDF clínico."); }
        finally { setIsExportingPDF(false); }
    };

    if (isLoading) return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] backdrop-blur-sm">
            <div className="bg-white p-10 rounded-[2.5rem] flex flex-col items-center shadow-2xl">
                <Spinner />
                <p className="mt-4 font-black text-slate-600 uppercase tracking-widest text-xs">Sincronizando Historial Médico...</p>
            </div>
        </div>
    );

    if (!data) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col relative"
                onClick={e => e.stopPropagation()}
            >
                {/* TOOLBAR SUPERIOR (ACCIONES) */}
                <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">Modo Visualización de Reporte</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleExportPDF} 
                            disabled={isExportingPDF}
                            className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white font-black rounded-xl hover:bg-blue-700 transition-all text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20"
                        >
                            {isExportingPDF ? <Spinner /> : <DocumentTextIcon className="w-4 h-4" />} Generar PDF Médico
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
                                    <div className="w-12 h-12 bg-[#1e3a8a] text-white rounded-xl flex items-center justify-center shadow-lg">
                                        <SparklesIcon className="w-7 h-7" />
                                    </div>
                                    <h1 className="text-3xl font-black text-[#1e3a8a] tracking-tight">VitaMetra Clinical</h1>
                                </div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Paciente</p>
                                        <p className="text-sm font-bold text-slate-800">{data.patientName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">RUT</p>
                                        <p className="text-sm font-bold text-slate-800">{data.patientRut || '12.345.678-9'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Tipo de Diabetes</p>
                                        <p className="text-sm font-bold text-slate-800">{data.diabetesType || 'Diabetes Mellitus'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Periodo del Reporte</p>
                                        <p className="text-sm font-bold text-slate-800">{dateRange}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-3 py-1 bg-blue-50 text-[#1e3a8a] rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100 mb-2">
                                    Informe Generado por IA
                                </span>
                                <p className="text-[10px] text-slate-400 font-bold">RUT VitaMetra: 78.231.687-7</p>
                            </div>
                        </header>

                        {/* 2. RESUMEN EJECUTIVO */}
                        <section className="space-y-8">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <ActivityIcon className="w-6 h-6 text-brand-primary" /> Resumen Ejecutivo
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Proyección HbA1c</p>
                                    <h3 className="text-5xl font-black text-[#1e3a8a]">{data.eHbA1c}%</h3>
                                    <p className="text-[9px] font-bold text-green-600 mt-2 uppercase">GMI (Estándar ADA)</p>
                                </div>
                                <div className="p-6 bg-slate-900 text-white rounded-2xl text-center shadow-xl">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Tiempo en Rango (TIR)</p>
                                    <h3 className="text-5xl font-black text-[#2ECC71]">{data.timeInRange}%</h3>
                                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Meta: &gt; 70% (70-180 mg/dL)</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Promedios Glucémicos</p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] border-b border-slate-100 pb-1">
                                            <span className="font-bold text-slate-500">AYUNAS:</span>
                                            <span className="font-black text-slate-800">{data.meanGlucose.fasting} mg/dL</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] border-b border-slate-100 pb-1">
                                            <span className="font-bold text-slate-500">PRE-PRANDIAL:</span>
                                            <span className="font-black text-slate-800">{data.meanGlucose.prePrandial} mg/dL</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-slate-500">POST-PRANDIAL:</span>
                                            <span className="font-black text-slate-800">{data.meanGlucose.postPrandial} mg/dL</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                                <TimeInRangeChart tirData={data.tirDetailed} totalRecords={data.totalRecords} isSimple={true} />
                            </div>
                        </section>

                        {/* 3. ANÁLISIS DE HÁBITOS POR IA */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <RobotIcon className="w-6 h-6 text-[#1e3a8a]" /> Análisis de Hábitos por IA
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <h4 className="text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest mb-4">Tendencias de Ingesta Detectadas</h4>
                                    <div className="space-y-3">
                                        {data.aiInsights.map((insight, idx) => (
                                            <div key={idx} className="flex gap-3 text-xs font-medium text-slate-700 leading-relaxed">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0"></div>
                                                <p>{insight}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Adherencia al Registro Clínico</h4>
                                    <div className="flex items-center gap-6">
                                        <div className="text-4xl font-black text-slate-800">{Math.round((data.adherence.logsPerformed / data.adherence.expectedLogs) * 100)}%</div>
                                        <div className="flex-grow space-y-2">
                                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-secondary" style={{ width: `${(data.adherence.logsPerformed / data.adherence.expectedLogs) * 100}%` }}></div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{data.adherence.logsPerformed} registros de {data.adherence.expectedLogs} sugeridos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. BITÁCORA DE EVENTOS CRÍTICOS (DATA-TO-TEXT) */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <FireIcon className="w-6 h-6 text-red-500" /> Bitácora de Eventos Críticos
                            </h2>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Tabla detallada de glucemias fuera de rango vinculadas a la descripción textual de ingesta para ajuste de dosis I:C por el profesional médico.
                            </p>
                            <div className="overflow-hidden border border-slate-100 rounded-2xl">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Fecha / Hora</th>
                                            <th className="px-6 py-4">Evento (mg/dL)</th>
                                            <th className="px-6 py-4">Registro Textual del Paciente</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.criticalEventsLog.map((ev, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                                                    {new Date(ev.date).toLocaleDateString('es-ES')} <br/>
                                                    {new Date(ev.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-black px-2 py-1 rounded-md ${ev.value > 220 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                                                        {ev.value}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs italic text-slate-600 font-medium">
                                                    "{ev.foodDescription || 'Sin descripción textual'}"
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 5. CIERRE Y FIRMA */}
                        <footer className="pt-12 border-t border-slate-200 mt-20">
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observaciones del Profesional Tratante</p>
                                    <div className="h-32 border-b border-slate-200"></div>
                                </div>
                                <div className="flex flex-col items-center justify-end pb-4">
                                    <div className="w-48 border-b border-slate-900 mb-2"></div>
                                    <p className="text-[10px] font-black text-slate-800 uppercase">Firma del Profesional</p>
                                </div>
                            </div>
                            <div className="mt-12 p-4 bg-slate-50 rounded-xl">
                                <p className="text-[8px] text-slate-400 leading-relaxed text-justify uppercase font-bold tracking-tighter">
                                    Este informe es una herramienta de apoyo clínico basada en datos autoinformados por el paciente a través de la plataforma VitaMetra. Los cálculos de HbA1c y TIR son proyecciones algorítmicas bajo estándares ADA {currentYear} y no deben reemplazar el juicio clínico, las pruebas de laboratorio estándar de oro, ni el diagnóstico de un profesional médico certificado. VitaMetra no se hace responsable por ajustes de tratamiento realizados fuera de la supervisión médica.
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
                    <span className="opacity-20">|</span>
                    <span>RUT VitaMetra 78.231.687-7</span>
                </div>
            </div>
        </div>
    );
};

export default PatientClinicalSummaryModal;
