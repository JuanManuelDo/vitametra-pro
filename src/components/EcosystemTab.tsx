import React from 'react';
import Spinner from './Spinner';
import { SparklesIcon } from './Icons';

interface EcosystemTabProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const EcosystemTab: React.FC<EcosystemTabProps> = ({ imageUrl, isLoading, error }) => {
  
  const ecosystemPoints = [
    { 
      title: "Paciente (B2C)",
      description: "Escaneo con IA y registro personal a través de una simple aplicación móvil.",
      color: "blue"
    },
    { 
      title: "Doctor (B2B)",
      description: "Dashboard clínico con reportes detallados y visualización de tendencias para un seguimiento preciso.",
      color: "emerald"
    },
    { 
      title: "Institución (B2G)",
      description: "Análisis a gran escala para la reducción poblacional de A1c, generando ahorros significativos en salud pública.",
      color: "indigo"
    },
  ];

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4">
        Nuestro Ecosistema GlucoSense
      </h1>
      <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto">
        Una visión integral de cómo los datos fluyen desde el paciente para optimizar el tratamiento médico, resultando en un beneficio de salud pública a gran escala.
      </p>

      <div className="bg-brand-surface p-6 rounded-xl shadow-lg border border-gray-200 min-h-[400px] flex items-center justify-center">
        {isLoading && (
          <div className="flex flex-col items-center text-slate-500">
            <Spinner />
            <span className="mt-4 text-lg font-medium">Generando visualización del ecosistema...</span>
            <span className="text-sm mt-1">Esto puede tardar un momento.</span>
          </div>
        )}
        {error && <p className="text-red-600 text-center">{error}</p>}
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Diagrama del ecosistema GlucoSense"
            className="w-full h-auto rounded-lg shadow-md object-contain animate-fade-in"
          />
        )}
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {ecosystemPoints.map(point => (
            <div key={point.title} className={`bg-${point.color}-50 border-l-4 border-${point.color}-500 p-4 rounded-r-lg`}>
                <h3 className={`text-xl font-semibold text-${point.color}-800`}>{point.title}</h3>
                <p className={`mt-1 text-slate-600`}>{point.description}</p>
            </div>
        ))}
      </div>
    </div>
  );
};

export default EcosystemTab;