
import React, { useState, useMemo } from 'react';
import type { UserData } from '../types';
import { 
    BuildingOfficeIcon, InformationCircleIcon, CheckCircleIcon, XMarkIcon, 
    UserCircleIcon, ChartPieIcon, ActivityIcon,
    SparklesIcon, PaperAirplaneIcon, DocumentTextIcon, TrashIcon, EyeIcon,
    PlusIcon
} from './Icons';
import Spinner from './Spinner';
import PatientClinicalSummaryModal from './PatientClinicalSummaryModal';
import TimeInRangeChart from './TimeInRangeChart';

interface InstitutionalAdminTabProps {
    currentUser: UserData;
}

const InstitutionalAdminTab: React.FC<InstitutionalAdminTabProps> = ({ currentUser }) => {
    const details = currentUser.institutional_details;
    if (!details) return null;

    const [usedSlots, setUsedSlots] = useState(details.usedSlots);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<{ id: string, name: string } | null>(null);

    const totalSlots = details.totalSlots;
    const currentYear = new Date().getFullYear();

    const populationTIR = {
        veryLow: 2,
        low: 6,
        target: 68,
        high: 15,
        veryHigh: 9
    };

    const demoPatients = useMemo(() => [
        { id: 'p005', name: 'Roberto Diaz', activatedAt: `${currentYear}-02-05`, eA1c: '8.5%', status: 'Crítico', tir: 42, lastLog: 'Hace 2h' },
        { id: 'p002', name: 'Maria García', activatedAt: `${currentYear}-01-12`, eA1c: '7.2%', status: 'Alerta', tir: 65, lastLog: 'Hace 5h' },
        { id: 'p003', name: 'Carlos Ruiz', activatedAt: `${currentYear}-01-20`, eA1c: '6.8%', status: 'Inactivo', tir: 71, lastLog: 'Ayer' },
        { id: 'p001', name: 'Juan Pérez', activatedAt: `${currentYear-1}-12-05`, eA1c: '6.5%', status: 'Estable', tir: 82, lastLog: 'Hace 1h' },
        { id: 'p004', name: 'Elena Soto', activatedAt: `${currentYear}-02-01`, eA1c: '6.1%', status: 'Estable', tir: 91, lastLog: 'Hace 10m' },
    ].sort((a, b) => a.tir - b.tir), [currentYear]);

    const handleActionDisabled = () => alert("⚠️ Función deshabilitada en modo Demo institucional.");

    const handleInviteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || usedSlots >= totalSlots) return;
        setIsInviting(true);
        setTimeout(() => {
            setIsInviting(false);
            setUsedSlots(prev => prev + 1);
            setInviteSuccess(`Invitación enviada a ${inviteEmail}.`);
            setInviteEmail('');
            setTimeout(() => setInviteSuccess(null), 4000);
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto pb-24 animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-brand-primary text-white rounded-[1.5rem] shadow-xl shadow-brand-primary/20">
                        <BuildingOfficeIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{currentUser.managedBy}</h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircleIcon className="w-3.5 h-3.5 text-brand-secondary" /> Convenio B2B VitaMetra Pro
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Licencias Activas</p>
                            <p className="text-lg font-black text-slate-800">{usedSlots} <span className="text-slate-400 text-sm font-bold">/ {totalSlots}</span></p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <ChartPieIcon className="w-5 h-5 text-brand-primary" />
                        </div>
                    </div>
                    <button 
                        onClick={handleActionDisabled}
                        className="bg-brand-primary text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg hover:bg-brand-dark transition-all flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" /> Asignar Licencia
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-6">
                    <ActivityIcon className="w-6 h-6 text-brand-secondary" />
                    <h3 className="text-lg font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Estatus Clínico Poblacional (TIR Promedio)</h3>
                </div>
                <TimeInRangeChart tirData={populationTIR} totalRecords={1250} isSimple={true} />
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <SparklesIcon className="w-5 h-5 text-brand-primary" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Tu población mantiene un <strong className="text-brand-secondary">TIR del 68%</strong>. El 11% de los pacientes requiere intervención inmediata debido a eventos críticos <span className="text-red-500 font-bold">&lt; 54 mg/dL</span>.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                    <h3 className="font-black text-slate-700 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                        <ActivityIcon className="w-5 h-5 text-brand-primary" /> Gestión de Riesgo por Paciente
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Ordenar por:</span>
                        <span className="text-[10px] font-black text-brand-primary uppercase bg-blue-50 px-2 py-1 rounded-md">Riesgo Clínico (TIR Asc)</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-8 py-5">Nombre Paciente</th>
                                <th className="px-6 py-5">Último Registro</th>
                                <th className="px-6 py-5 text-center">% TIR (7d)</th>
                                <th className="px-6 py-5 text-center">eHbA1c</th>
                                <th className="px-6 py-5">Estado</th>
                                <th className="px-8 py-5 text-right">Módulos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {demoPatients.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${p.tir < 70 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                                {p.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white text-sm">{p.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {p.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-slate-500 dark:text-slate-400 font-medium">{p.lastLog}</td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`text-sm font-black ${p.tir < 70 ? 'text-[#E74C3C]' : 'text-[#2ECC71]'}`}>{p.tir}%</span>
                                            <div className="w-16 bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                                                <div className={`h-full ${p.tir < 70 ? 'bg-[#E74C3C]' : 'bg-[#2ECC71]'}`} style={{ width: `${p.tir}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`text-sm font-black ${parseFloat(p.eA1c) > 7.5 ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>{p.eA1c}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${
                                            p.status === 'Crítico' ? 'bg-red-50 text-red-700 border-red-100' : 
                                            p.status === 'Alerta' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                            'bg-green-50 text-green-700 border-green-100'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => setSelectedPatient({ id: p.id, name: p.name })}
                                                className="px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary bg-blue-50 hover:bg-brand-primary hover:text-white rounded-xl transition-all" 
                                            >
                                                Resumen
                                            </button>
                                            <button onClick={handleActionDisabled} className="p-2.5 text-slate-200 hover:text-red-400 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5"><SparklesIcon className="w-64 h-64 text-brand-primary" /></div>
                <div className="max-w-xl relative z-10">
                    <h3 className="text-2xl font-black mb-2">Asignar Nueva Licencia</h3>
                    <p className="text-slate-400 text-sm mb-8 font-medium">Digitaliza la gestión de tus pacientes al instante. Solo necesitas su correo electrónico.</p>
                    <form onSubmit={handleInviteSubmit} className="flex gap-4">
                        <input 
                            type="email" 
                            value={inviteEmail} 
                            onChange={(e) => setInviteEmail(e.target.value)} 
                            placeholder="paciente@institucion.com" 
                            className="flex-grow p-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/30 transition-all font-bold text-sm" 
                            required 
                            disabled={isInviting}
                        />
                        <button type="submit" disabled={isInviting || !inviteEmail || usedSlots >= totalSlots} className="bg-brand-secondary hover:bg-green-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all transform active:scale-95 disabled:bg-slate-700">
                            {isInviting ? <Spinner /> : 'Vincular'}
                        </button>
                    </form>
                    {inviteSuccess && (
                        <div className="mt-6 flex items-center gap-2 text-green-400 text-sm font-bold animate-fade-in">
                            <CheckCircleIcon className="w-5 h-5" /> {inviteSuccess}
                        </div>
                    )}
                </div>
            </div>

            {selectedPatient && (
                <PatientClinicalSummaryModal 
                    patientId={selectedPatient.id} 
                    patientName={selectedPatient.name} 
                    onClose={() => setSelectedPatient(null)} 
                />
            )}
        </div>
    );
};

export default InstitutionalAdminTab;
