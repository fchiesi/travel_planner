
import React, { useState } from 'react';
import { TripPlan } from '../types.ts';
import { getRefinedTripPlan } from '../services/geminiService.ts';
import { SparklesIcon } from './icons/SparklesIcon.tsx';

interface TripEditorModalProps {
  trip: TripPlan;
  onClose: () => void;
  onSave: (originalTrip: TripPlan, newTrip: TripPlan) => void;
}

const TripEditorModal: React.FC<TripEditorModalProps> = ({ trip, onClose, onSave }) => {
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!instruction.trim()) {
      setError('Por favor, descreva a alteração que você deseja.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const newTrip = await getRefinedTripPlan(trip, instruction);
      onSave(trip, newTrip);
    } catch (e) {
      console.error(e);
      setError('Não foi possível atualizar o roteiro. Tente novamente com uma instrução diferente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold font-poppins text-gray-800">Editar Roteiro</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent border-solid rounded-full animate-spin"></div>
              <p className="mt-4 text-lg text-gray-600">Ajustando os planos para você...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="edit-instruction" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6 text-teal-500" />
                  O que você gostaria de mudar?
                </label>
                <p className="text-gray-500 mt-1 mb-3">Descreva sua alteração e a IA irá gerar um novo roteiro com base no seu pedido.</p>
                <textarea
                  id="edit-instruction"
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  placeholder="Ex: Troque os restaurantes por opções mais baratas, adicione um dia de parque, ou mude o hotel para um com piscina."
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                />
              </div>
              {error && <p className="text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-end items-center gap-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !instruction.trim()}
            className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Atualizando...' : 'Atualizar Roteiro'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripEditorModal;