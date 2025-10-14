import { GoogleGenAI, Type } from "@google/genai";
import { TripPlan, AccommodationSuggestion } from "../types.ts";
import { getTotalTravelers } from "../utils/tripUtils.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const availabilitySchema = {
    type: Type.OBJECT,
    properties: {
        availableHotels: {
            type: Type.ARRAY,
            description: "Uma lista contendo APENAS OS NOMES dos hotéis que estão disponíveis.",
            items: { type: Type.STRING }
        }
    },
    required: ["availableHotels"]
};

/**
 * Checks the availability of hotels for a given trip.
 * @param accommodations The list of accommodation suggestions.
 * @param trip The trip plan containing dates and travelers info.
 * @returns A promise that resolves to an array of names of available hotels.
 */
export const checkHotelAvailability = async (accommodations: AccommodationSuggestion[], trip: TripPlan): Promise<string[]> => {
    if (!accommodations || accommodations.length === 0) {
        return [];
    }

    const totalTravelers = getTotalTravelers(trip.travelers);
    const hotelNames = accommodations.map(h => h.name).join('", "');

    const prompt = `
        Aja como um sistema de verificação de disponibilidade de hotéis.
        
        **INFORMAÇÕES DA VIAGEM:**
        - **Datas:** De ${trip.startDate} até ${trip.endDate}.
        - **Hóspedes:** ${totalTravelers} pessoa(s).
        
        **TAREFA:**
        Verifique a disponibilidade para a lista de hotéis abaixo. Considere que alguns podem ser fictícios; para esses, assuma que estão indisponíveis. Para os reais, simule uma verificação para as datas e número de hóspedes. Retorne APENAS os hotéis que possuem vagas.
        
        **LISTA DE HOTÉIS PARA VERIFICAR:**
        ["${hotelNames}"]
        
        Sua resposta DEVE ser um objeto JSON que corresponda ao schema, contendo uma lista com os nomes dos hotéis disponíveis.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: availabilitySchema,
            },
        });
        
        const result = JSON.parse(response.text) as { availableHotels: string[] };
        return result.availableHotels || [];

    } catch (error) {
        console.error("Error calling Gemini API for hotel availability:", error);
        // Fallback: return an empty array if the check fails.
        // The UI can decide how to handle this (e.g., show an error, assume all are available).
        return [];
    }
};
