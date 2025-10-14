import React from 'react';
import { MapPinIcon } from '../icons/MapPinIcon.tsx';
import { SparklesIcon } from '../icons/SparklesIcon.tsx';
import { ToolsIcon } from '../icons/ToolsIcon.tsx';

interface ChoiceStepProps {
  startLocation: string;
  onStartLocationChange: (value: string) => void;
  locationStatusMessage: string | null;
  onBack: () => void;
  onSurpriseMe: () => void;
  onBuildWizard: () => void;
  onDefineItinerary: () => void;
}

export const ChoiceStep: React.FC<ChoiceStepProps> = ({
  startLocation,
  onStartLocationChange,
  locationStatusMessage,
  onBack,
  onSurpriseMe,
  onBuildWizard,
  onDefineItinerary
}) => {
  const handleActionClick = (action: () => void) => {
    if (startLocation.trim() === '') {
        alert("Por favor, informe o local de partida.");
        return;
    }
    action();
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-center">
        <button onClick={onBack} className="text-sm text-teal-600 hover:text-teal-800 mb-4">&larr; Voltar para viajantes</button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2 font-poppins">De onde você vai sair?</h2>
        <p className="text-gray-600 mb-6">Confirme ou altere seu ponto de partida e depois escolha como quer planejar.</p>

        <div className="max-w-lg mx-auto mb-8">
          <div className="bg-gray-50 p-6 rounded-2xl border text-left">
              <label htmlFor="startLocation" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MapPinIcon className="w-4 h-4 mr-2" /> Ponto de Partida
              </label>
              <input 
                  type="text" 
                  id="startLocation" 
                  value={startLocation} 
                  onChange={(e) => onStartLocationChange(e.target.value)} 
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
              {locationStatusMessage && <p className="text-xs text-gray-500 mt-1">{locationStatusMessage}</p>}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-4 font-poppins">Como você quer planejar?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <button onClick={() => handleActionClick(onSurpriseMe)} className="p-6 border-2 border-teal-500 bg-white rounded-lg text-center hover:bg-teal-50 transition-colors group">
                  <SparklesIcon className="w-10 h-10 mx-auto text-teal-500 mb-3" />
                  <h3 className="text-lg font-bold font-poppins text-teal-700">Surpreenda-me!</h3>
                  <p className="text-sm text-teal-600 mt-1">Receba 3 roteiros incríveis e inesperados.</p>
              </button>
               <button onClick={() => handleActionClick(onBuildWizard)} className="p-6 border-2 border-indigo-500 bg-white rounded-lg text-center hover:bg-indigo-50 transition-colors group">
                  <ToolsIcon className="w-10 h-10 mx-auto text-indigo-500 mb-3" />
                  <h3 className="text-lg font-bold font-poppins text-indigo-700">Construa sua Viagem</h3>
                  <p className="text-sm text-indigo-600 mt-1">Escolha os detalhes passo a passo.</p>
              </button>
               <button onClick={() => handleActionClick(onDefineItinerary)} className="p-6 border-2 border-gray-300 bg-white rounded-lg text-center hover:border-teal-400 hover:bg-gray-50 transition-colors group">
                  <MapPinIcon className="w-10 h-10 mx-auto text-gray-500 group-hover:text-teal-500 mb-3" />
                  <h3 className="text-lg font-bold font-poppins text-gray-700 group-hover:text-teal-700">Definir Roteiro</h3>
                  <p className="text-sm text-gray-500 mt-1">Informe os detalhes para um plano sob medida.</p>
              </button>
        </div>
    </div>
  );
};
