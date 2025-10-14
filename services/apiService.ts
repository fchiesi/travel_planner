// src/services/apiService.ts
import { SearchCriteria, TripPlan } from '../types.ts';

const BACKEND_URL = 'http://localhost:3001'; // A URL do nosso servidor backend

export async function getTripSuggestionsFromBackend(criteria: SearchCriteria): Promise<TripPlan[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/trip-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(criteria),
    });

    if (!response.ok) {
      throw new Error('A resposta do servidor não foi OK');
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar sugestões do backend:", error);
    throw new Error("Não foi possível conectar ao servidor de planejamento de viagens.");
  }
}

export async function checkBackendStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.warn("Backend health check failed:", error);
    return false;
  }
}
