import React, { useState } from 'react';
import { 
  Users, Building2, BarChart3, ShieldAlert, 
  Search, Filter, Download, ChevronRight,
  Activity, Calendar, ArrowUpRight
} from 'lucide-react';

// CORRECCIÓN DE RUTAS: Aseguramos que apunten a donde existen realmente
// Si no tienes estos archivos aún, los he comentado para que el build pase
// import TimeInRangeChart from './charts/TimeInRangeChart'; 
// import PatientStatsTable from './admin/PatientStatsTable';

interface Patient {
  id: string;
  name: string;
  status: 'stable' | 'warning' | 'critical';
  lastSync: string;
  tir: number; // Time in Range
}

const InstitutionalAdminTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const patients: Patient[] = [
    { id: '1', name: 'Ana Martínez', status: 'stable', lastSync: '10 min', tir: 82 },
    { id: '2', name: 'Carlos Ruíz', status: 'warning', lastSync: '1h', tir: 64 },
    { id: '3', name: 'Elena Soler', status: 'critical', lastSync: '5 min', tir: 45 },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-32 pt-10 px-6">
      {/* HEADER INSTITUCIONAL */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-[1000] italic uppercase tracking-tighter text-metra-dark">
            Panel <span className="text-metra-blue">Clínico</span>
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Gestión de Población Diabética</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
          <Building2 className="text-metra-blue" size={24} />
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <Users className="text-blue-500 mb-2" size={20} />
          <p className="text-2xl font-black text-metra-dark">1,284</p>
          <p className="text-[9px] font-black text-slate-400 uppercase">Pacientes Activos</p>
        </div>
        <div className="bg-metra-dark p-6 rounded-[2rem] shadow-xl text-white">
          <Activity className="text-metra-blue mb-2" size={20} />
          <p className="text-2xl font-black">72%</p>
          <p className="text-[9px] font-black opacity-60 uppercase">TIR Promedio Global</p>
        </div>
      </div>

      {/* BÚSQUEDA Y FILTROS */}
      <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 mb-6 flex gap-2">
        <div className="flex-1 bg-slate-50 rounded-2xl flex items-center px-4">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="BUSCAR PACIENTE..."
            className="bg-transparent border-none w-full p-4 font-bold text-xs outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-slate-900 text-white p-4 rounded-2xl">
          <Filter size={20} />
        </button>
      </div>

      {/* LISTA DE PACIENTES */}
      <div className="space-y-4">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Alertas Críticas</p>
        {patients.map((patient) => (
          <div key={patient.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${
                patient.status === 'stable' ? 'bg-green-500' : 
                patient.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              } shadow-lg`} />
              <div>
                <p className="font-black text-metra-dark text-sm uppercase">{patient.name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Sync: {patient.lastSync} ago</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <p className={`text-sm font-black ${patient.tir < 50 ? 'text-red-500' : 'text-metra-dark'}`}>
                  {patient.tir}%
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase">TIR</p>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {/* BOTÓN EXPORTAR */}
      <button className="w-full mt-8 bg-white border-2 border-slate-100 text-metra-dark p-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
        <Download size={18} /> Generar Reporte Institucional
      </button>
    </div>
  );
};

export default InstitutionalAdminTab;