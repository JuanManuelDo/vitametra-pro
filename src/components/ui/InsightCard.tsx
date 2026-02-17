import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, Lightbulb, ArrowRight, BrainCircuit } from 'lucide-react';
import type { MetabolicInsight } from '../../services/ai/metraCore';

interface InsightCardProps {
    insight: MetabolicInsight;
    onAction?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onAction }) => {
    // Configuración dinámica según el tipo de Insight
    const config = {
        WARNING: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: <AlertTriangle className="text-red-500" size={20} />,
            accent: 'text-red-600',
            label: 'Alerta de Patrón'
        },
        TIP: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: <Lightbulb className="text-blue-500" size={20} />,
            accent: 'text-blue-600',
            label: 'Sugerencia Bio'
        },
        SUCCESS: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            icon: <Sparkles className="text-emerald-500" size={20} />,
            accent: 'text-emerald-600',
            label: 'Logro Detectado'
        }
    }[insight.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className={`${config.bg} ${config.border} border-2 p-6 rounded-[2.5rem] relative overflow-hidden shadow-sm`}
        >
            {/* Decoración de fondo estilo IA */}
            <div className="absolute -right-4 -top-4 opacity-5 text-slate-900">
                <BrainCircuit size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                        {config.icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.accent}`}>
                        {config.label}
                    </span>
                </div>

                <h4 className="text-lg font-[1000] text-slate-900 leading-tight tracking-tighter mb-2 italic uppercase">
                    {insight.message}
                </h4>

                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                    {insight.suggestion}
                </p>

                {onAction && (
                    <button 
                        onClick={onAction}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        Explorar en detalle <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default InsightCard;