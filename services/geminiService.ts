import { GoogleGenAI, Type } from "@google/genai";
import { SearchCriteria, TripPlan, Travelers, RestaurantSuggestion } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Schemas remain the same as they define the expected JSON structure.
const activitySchema = { type: Type.OBJECT, properties: { description: { type: Type.STRING }, estimatedCost: { type: Type.NUMBER } }, required: ["description", "estimatedCost"] };
const accommodationSuggestionSchema = { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING, enum: ['Hotel', 'Airbnb', 'Hostel'] }, city: { type: Type.STRING }, location: { type: Type.STRING }, totalStayPrice: { type: Type.NUMBER }, amenities: { type: Type.OBJECT, properties: { hasBreakfast: { type: Type.BOOLEAN }, hasPool: { type: Type.BOOLEAN }, hasKitchen: { type: Type.BOOLEAN } }, required: ["hasBreakfast", "hasPool", "hasKitchen"] }, bookingSite: { type: Type.STRING } }, required: ["name", "type", "city", "location", "totalStayPrice", "amenities", "bookingSite"] };
const accommodationOptionsSchema = { type: Type.OBJECT, description: "Uma lista única com 7 a 10 sugestões de acomodação variadas.", properties: { suggestions: { type: Type.ARRAY, items: accommodationSuggestionSchema } }, required: ["suggestions"] };
const overnightStopSchema = { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, accommodationOptions: accommodationOptionsSchema, activities: { type: Type.ARRAY, items: activitySchema } }, required: ["name", "description", "accommodationOptions", "activities"] };
const transportationDetailsSchema = { type: Type.OBJECT, properties: { mode: { type: Type.STRING }, totalCost: { type: Type.NUMBER }, details: { type: Type.STRING }, suggestedDepartureTime: { type: Type.STRING }, totalDistanceKm: { type: Type.NUMBER }, tollPlazaBreakdown: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, cost: { type: Type.NUMBER } }, required: ["name", "cost"] } }, breakdown: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.STRING } }, required: ["label", "value"] } }, strategicStops: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "description"] } }, potentialOutboundStops: { type: Type.ARRAY, items: overnightStopSchema }, potentialReturnStops: { type: Type.ARRAY, items: overnightStopSchema }, originIataCode: { type: Type.STRING }, destinationIataCode: { type: Type.STRING } }, required: ["mode", "totalCost", "details", "suggestedDepartureTime"] };
const itinerarySchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.NUMBER }, title: { type: Type.STRING }, location: { type: Type.STRING }, estimatedDayCost: { type: Type.NUMBER }, activities: { type: Type.ARRAY, items: activitySchema }, foodSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["day", "title", "location", "estimatedDayCost", "activities", "foodSuggestions"] } };
const restaurantSuggestionSchema = { type: Type.OBJECT, properties: { name: { type: Type.STRING }, averageGroupCost: { type: Type.NUMBER }, cuisine: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "averageGroupCost", "cuisine", "description"] };
const tripPlanSchema = { type: Type.OBJECT, properties: { destinationName: { type: Type.STRING }, destinationCountry: { type: Type.STRING }, startDate: { type: Type.STRING }, endDate: { type: Type.STRING }, durationDays: { type: Type.NUMBER }, baseCost: { type: Type.NUMBER }, travelers: { type: Type.OBJECT, properties: { adults: { type: Type.NUMBER }, children: { type: Type.ARRAY, items: { type: Type.NUMBER } } }, required: ["adults", "children"] }, transportationDetails: transportationDetailsSchema, costBreakdown: { type: Type.OBJECT, properties: { transportation: { type: Type.NUMBER }, food: { type: Type.NUMBER }, activities: { type: Type.NUMBER }, shopping: { type: Type.NUMBER } }, required: ["transportation", "food", "activities", "shopping"] }, accommodationOptions: accommodationOptionsSchema, restaurantSuggestions: { type: Type.ARRAY, items: restaurantSuggestionSchema }, itinerary: itinerarySchema, shoppingTips: { type: Type.ARRAY, items: { type: Type.STRING } }, destinationTips: { type: Type.ARRAY, items: { type: Type.STRING } }, startLocation: { type: Type.STRING }, startLocationCoords: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lon: { type: Type.NUMBER } } } }, required: ["destinationName", "destinationCountry", "startDate", "endDate", "durationDays", "baseCost", "travelers", "transportationDetails", "costBreakdown", "accommodationOptions", "restaurantSuggestions", "itinerary", "shoppingTips", "destinationTips", "startLocation"] };
const fullSchema = { type: Type.ARRAY, description: "Uma lista de planos de viagem distintos.", items: tripPlanSchema };

// --- Prompt Engineering Refactor ---

const GENERAL_RULES = `
**REGRAS DE VERIFICAÇÃO DE DADOS (OBRIGATÓRIO):**
1.  **ESTIMATIVAS HONESTAS:** Você NÃO tem acesso a buscadores de passagem, hotéis ou preços em tempo real. Todos os custos são ESTIMATIVAS baseadas no seu conhecimento de faixas de preço típicas. NUNCA afirme ter consultado um site, NUNCA cite um site como fonte de um preço e NUNCA gere links.
2.  **ESTIMATIVA CONSERVADORA:** Prefira o meio da faixa típica para a época do ano, não o menor preço já visto. É melhor o usuário encontrar um preço menor do que um maior.
3.  **PONTO DE PARTIDA:** Use o 'startLocation' do usuário. Se as coordenadas ('startLocationCoords') forem fornecidas, use-as para obter a máxima precisão nos cálculos.

**REGRAS CRÍTICAS DE GERAÇÃO (APLICAR A TODOS OS PLANOS):**
1.  **DATAS:** A data de hoje é ${new Date().toLocaleDateString('pt-br')}. **NUNCA sugira uma viagem que comece em uma data passada.** Se o usuário não especificar datas, sugira datas realistas começando pelo menos 15 dias a partir de hoje. A 'durationDays' DEVE contar a viagem completa.
2.  **ITINERÁRIO INTELIGENTE:** Os dias de viagem (primeiro e último dia) DEVEM ter atividades mais leves. Sugira um 'suggestedDepartureTime' realista. Se houver menores, as atividades devem ser adequadas para as idades fornecidas.
3.  **HOSPEDAGEM DETALHADA ('accommodationOptions'):** Gere uma lista consolidada com 7 a 10 sugestões de acomodação variadas. A lista deve ser um único array em 'suggestions' e misturar opções de Hotéis, Airbnbs e Hostels, fornecendo todos os detalhes solicitados no schema.
4.  **CUSTO BASE ('baseCost'):** Calcule este custo somando transporte, alimentação e atividades. **NÃO INCLUA HOSPEDAGEM AQUI.**
5.  **FALLBACK:** Se o pedido for inviável, primeiro mude o destino para um de perfil similar. Se não der, mude as datas.
6.  **INFORMAÇÕES DO USUÁRIO:** Retorne o objeto de viajantes, a string 'startLocation' e o objeto 'startLocationCoords' (se fornecido) exatamente como foram fornecidos.
`;

const FLIGHT_RULES = `
**REGRAS PARA VIAGENS DE AVIÃO (ESTIMATIVA, NÃO COTAÇÃO):**
- **Códigos IATA:** OBRIGATÓRIO fornecer os códigos IATA de origem e destino (\`originIataCode\`, \`destinationIataCode\`). O app monta os links de busca real a partir deles.
- **CUSTO ESTIMADO:** \`totalCost\` é uma ESTIMATIVA da faixa típica de ida e volta para todos os viajantes nas datas da viagem, incluindo uma bagagem despachada por adulto quando a duração passar de 3 dias. NÃO é cotação.
- **DETALHES:** No campo \`details\`, diga em uma frase o que a estimativa inclui (ex.: "estimativa ida e volta, 2 adultos, com 1 mala despachada cada") e cite aeroportos alternativos próximos que costumam ser mais baratos, se existirem.
`;

const CAR_TRAVEL_RULES = `
**REGRAS PARA VIAGENS DE CARRO (SE APLICA A 'Carro próprio' e 'Carro Alugado'):**
1.  **DURAÇÃO POR DISTÂNCIA (Regra OBRIGATÓRIA):**
    - Até 500 km: 3-4 dias; Até 700 km: 5-7 dias; Até 1000 km: 7-8 dias; Até 2000 km: 9-12 dias; Até 3000 km: 15 dias.
    - **Acima de 3500 km: NÃO SUGIRA viagem de carro. É inviável.**
2.  **PARADA COM PERNOITE OBRIGATÓRIA:** Se a distância TOTAL (ida e volta) for > 1200 km, é OBRIGATÓRIO incluir 2-3 cidades candidatas para parada com pernoite na IDA em \`potentialOutboundStops\`, com opções de hospedagem e atividades. Se a viagem tiver mais de 8 dias, faça o mesmo para a VOLTA em \`potentialReturnStops\`.
3.  **CÁLCULO DETALHADO (ESTIMATIVA):**
    - Use seu conhecimento das rodovias; distâncias e pedágios são estimativas.
    - **Distância Total:** Estime a distância (ida e volta) e preencha \`totalDistanceKm\`.
    - **Custo de Combustível:** Use o preço médio recente do combustível que você conhece (não afirme ter pesquisado). Assuma 10 km/litro.
    - **Custo de Pedágios (DETALHADO):** É OBRIGATÓRIO identificar CADA praça de pedágio em \`tollPlazaBreakdown\`.
    - **Custo Total:** \`totalCost\` DEVE ser a SOMA PRECISA de combustível, pedágios e aluguel (se aplicável).
`;

function getUserInfoText(criteria: SearchCriteria): string {
    let travelerText = `${criteria.travelers.adults} adulto(s)`;
    if (criteria.travelers.children.length > 0) {
        travelerText += `, ${criteria.travelers.children.length} menor(es) (idades: ${criteria.travelers.children.join(', ')})`;
    }
    let startLocationText = criteria.startLocation;
    if (criteria.startLocationCoords) {
        startLocationText += ` (Coordenadas: ${criteria.startLocationCoords.lat}, ${criteria.startLocationCoords.lon})`;
    }
    const userProfileContext = criteria.userProfile ? `\n- **PERFIL DO USUÁRIO:** ${criteria.userProfile}` : '';

    return `
**Informações do Usuário:**
- **Local de Partida:** ${startLocationText}
- **Viajantes:** ${travelerText}${userProfileContext}`;
}

function buildBuilderPrompt(criteria: SearchCriteria): string {
    const userInfo = getUserInfoText(criteria);
    const destinationsPrompt = criteria.destinationsOrder && criteria.destinationsOrder.length > 1
        ? `- **Destinos e Ordem:** Siga OBRIGATORIAMENTE esta ordem: **${criteria.destinationsOrder.join(' -> ')}**.`
        : `- **Destinos Desejados:** ${criteria.multipleDestinations || criteria.destination}.`;
    const attractionsPrompt = criteria.selectedAttractions && criteria.selectedAttractions.length > 0
        ? `- **Atrações Selecionadas:** Inclua OBRIGATORIAMENTE visitas a: ${criteria.selectedAttractions.join(', ')}.`
        : '';

    return `Aja como um especialista em viagens para um usuário construindo uma viagem passo a passo.
${userInfo}
- **Transporte Preferencial:** ${criteria.preferredTransport}. Esta é uma escolha OBRIGATÓRIA.
${destinationsPrompt}
- **Preferências de Hospedagem:** ${criteria.accommodationPreferences?.join(', ') || 'Nenhuma preferência.'}
${attractionsPrompt}
- **Período:** De ${criteria.startDate || "Não especificado"} a ${criteria.endDate || "Não especificado"}.

**Sua Tarefa:**
- Crie **EXATAMENTE 3 planos de viagem distintos** que atendam a todas as preferências. As variações podem ser na duração da estadia em cada local ou no foco das atividades.
- Para roteiros multi-destinos, o 'destinationName' deve ser um nome geral para a viagem (ex: 'Road Trip pela Serra da Mantiqueira'). O campo 'location' dentro de cada dia do itinerário DEVE especificar a cidade daquele dia.
${GENERAL_RULES}${FLIGHT_RULES}${CAR_TRAVEL_RULES}
Gere as 3 sugestões estritamente no formato JSON solicitado.`;
}

function buildBudgetPrompt(criteria: SearchCriteria): string {
    const userInfo = getUserInfoText(criteria);
    return `Aja como um especialista em viagens focado em orçamento.
${userInfo}
- **Orçamento Total MÁXIMO:** ${criteria.budget}. Os roteiros gerados NÃO DEVEM exceder este valor.
- **Período:** De ${criteria.startDate || "Não especificado"} a ${criteria.endDate || "Não especificado"}.
- **Transporte:** ${criteria.preferredTransport || "Sugira o mais lógico"}.

**Sua Tarefa:**
1. **PRIORIDADE MÁXIMA:** O orçamento é o fator mais importante. Ignore qualquer destino que o usuário tenha inserido.
2. **GERAÇÃO:** Crie **EXATAMENTE 4 planos de viagem para 4 DESTINOS DIFERENTES**.
3. **DIVERSIDADE:** As sugestões devem ser diversas (praia, montanha, cidade, etc.) e viáveis a partir do local de partida.
${GENERAL_RULES}${FLIGHT_RULES}${CAR_TRAVEL_RULES}
Gere as 4 sugestões estritamente no formato JSON solicitado.`;
}

function buildSurpriseMePrompt(criteria: SearchCriteria): string {
    const userInfo = getUserInfoText(criteria);
    return `Aja como um especialista em viagens criativo. O usuário quer ser surpreendido.
${userInfo}

**Sua Tarefa:**
Crie **EXATAMENTE 3 planos de viagem distintos**, um para cada cenário abaixo:
1. **Viagem Curta (Fim de Semana):** O meio de transporte DEVE ser **'Carro próprio'**.
2. **Viagem Média (Semana):** O meio de transporte DEVE ser **'Ônibus'**.
3. **Viagem Longa (Férias):** O meio de transporte DEVE ser **'Avião'**.
${GENERAL_RULES}${FLIGHT_RULES}${CAR_TRAVEL_RULES}
Gere as 3 sugestões estritamente no formato JSON solicitado.`;
}

function buildDefaultPrompt(criteria: SearchCriteria): string {
    const userInfo = getUserInfoText(criteria);
    const isAnyTransport = !criteria.preferredTransport || criteria.preferredTransport === 'Qualquer';

    const generationRules = isAnyTransport
        ? `Se o usuário não especificou um destino, gere **4 planos para 4 destinos diferentes**, mesclando os modos de transporte mais lógicos.
           Se o usuário especificou um destino, crie **3 planos para esse mesmo destino**, cada um com o modo de transporte mais lógico e econômico: ('Carro próprio'/'Carro Alugado', 'Ônibus', 'Avião').`
        : `**Transporte Preferencial:** ${criteria.preferredTransport}. Esta é uma escolha OBRIGATÓRIA.
           **Se o destino NÃO for especificado:** Gere **4 SUGESTÕES para 4 DESTINOS DIFERENTES** adequados para o transporte.
           **Se o destino FOR especificado:** Gere **3 SUGESTÕES para o destino informado**, variando perfil ou datas.`;

    return `Aja como um especialista em viagens.
${userInfo}
- **Destino Desejado:** ${criteria.destination || "Não especificado"}
- **Orçamento Total:** ${criteria.budget || "Não especificado"}
- **Período:** De ${criteria.startDate || "Não especificado"} a ${criteria.endDate || "Não especificado"}.

**Sua Tarefa:**
${generationRules}
${GENERAL_RULES}${FLIGHT_RULES}${CAR_TRAVEL_RULES}
Gere as sugestões estritamente no formato JSON solicitado.`;
}

function buildPrompt(criteria: SearchCriteria): string {
    if (criteria.multipleDestinations) {
        return buildBuilderPrompt(criteria);
    }
    if (criteria.budget) {
        return buildBudgetPrompt(criteria);
    }
    if (criteria.destination === 'SURPRISE_ME') {
        return buildSurpriseMePrompt(criteria);
    }
    return buildDefaultPrompt(criteria);
}

export async function getTripSuggestions(criteria: SearchCriteria): Promise<TripPlan[]> {
  const prompt = buildPrompt(criteria);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: fullSchema,
      },
    });

    const rawPlans = JSON.parse(response.text) as Omit<TripPlan, 'id'>[];
    return rawPlans.map(plan => ({
      ...plan,
      id: crypto.randomUUID()
    }));

  } catch (error) {
    console.error("Error calling Gemini API for trip suggestions:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("A resposta foi bloqueada devido a políticas de segurança. Tente uma busca diferente.");
    }
    throw new Error("Falha ao se comunicar com a API de sugestões.");
  }
}

// Other service functions (getMoreRestaurants, getRefinedTripPlan, etc.) remain largely the same.
const moreRestaurantsSchema = { type: Type.ARRAY, items: restaurantSuggestionSchema };

export const getMoreRestaurants = async (destination: string, travelers: Travelers): Promise<RestaurantSuggestion[]> => {
    let travelerText = `${travelers.adults} adulto(s)`;
    if (travelers.children.length > 0) {
        travelerText += `, ${travelers.children.length} menor(es) (idades: ${travelers.children.join(', ')})`;
    }
    const prompt = `Sugira mais 5 opções de restaurantes em ${destination} para um grupo de ${travelerText}. Para cada, forneça nome, custo médio para o grupo (averageGroupCost), tipo de culinária e uma breve descrição. Gere apenas o JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: moreRestaurantsSchema },
        });
        return JSON.parse(response.text) as RestaurantSuggestion[];
    } catch (error) {
        console.error("Error calling Gemini API for more restaurants:", error);
        throw new Error("Falha ao buscar mais restaurantes.");
    }
};

export const getRefinedTripPlan = async (originalTrip: TripPlan, instruction: string): Promise<TripPlan> => {
    const prompt = `Aja como um assistente de viagens. O usuário forneceu um plano de viagem existente e uma instrução para modificá-lo.

**PLANO DE VIAGEM ATUAL (em formato JSON):**
${JSON.stringify({ ...originalTrip, id: undefined })}

**INSTRUÇÃO DO USUÁRIO PARA MUDANÇA:**
"${instruction}"

**SUA TAREFA:**
Gere um NOVO plano de viagem completo que incorpore a mudança solicitada. Mantenha o máximo possível do plano original. A resposta DEVE ser um único objeto JSON que corresponda ao schema. Preserve o 'startLocation', 'startLocationCoords' e 'travelers' originais.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: tripPlanSchema },
        });
        
        const newPlan = JSON.parse(response.text) as Omit<TripPlan, 'id'>;
        return { ...newPlan, id: crypto.randomUUID() };
    } catch (error) {
        console.error("Error calling Gemini API for refining trip plan:", error);
        throw new Error("Falha ao refinar o roteiro.");
    }
}

const suggestionsSchema = { type: Type.OBJECT, properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["suggestions"] };
type GeoSuggestionRequest = | { type: 'CITIES_IN_BRAZIL_REGION', region: string } | { type: 'CONTINENTS' } | { type: 'COUNTRIES_IN_CONTINENT', continent: string } | { type: 'REGIONS_IN_COUNTRY', country: string } | { type: 'CITIES_IN_COUNTRY_REGION', country: string, region: string };

export const getGeoSuggestions = async (request: GeoSuggestionRequest): Promise<string[]> => {
    let prompt = '';
    switch (request.type) {
        case 'CITIES_IN_BRAZIL_REGION': prompt = `Liste cidades turísticas populares na região '${request.region}' do Brasil. Retorne um JSON com a chave "suggestions" e um array de strings (ex: 'Gramado, RS').`; break;
        case 'CONTINENTS': prompt = `Liste os continentes do mundo. Retorne um JSON com a chave "suggestions" e um array de strings.`; break;
        case 'COUNTRIES_IN_CONTINENT': prompt = `Liste os principais países turísticos do continente '${request.continent}'. Retorne um JSON com a chave "suggestions" e um array de strings.`; break;
        case 'REGIONS_IN_COUNTRY': prompt = `Liste as principais regiões turísticas (estados, províncias) do país '${request.country}'. Retorne um JSON com a chave "suggestions" e um array de strings.`; break;
        case 'CITIES_IN_COUNTRY_REGION': prompt = `Liste cidades turísticas populares em '${request.region}', '${request.country}'. Retorne um JSON com a chave "suggestions" e um array de strings.`; break;
    }
    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: suggestionsSchema } });
        const result = JSON.parse(response.text) as { suggestions: string[] };
        return result.suggestions;
    } catch (error) {
        console.error(`Error calling Gemini API for geo suggestions (${request.type}):`, error);
        throw new Error(`Falha ao buscar sugestões geográficas.`);
    }
};

export const getAttractionSuggestions = async (cities: string[]): Promise<string[]> => {
    const prompt = `Liste até 20 atrações turísticas populares (pontos turísticos, museus, parques) localizadas em: ${cities.join(', ')}. Formate cada atração como 'Nome da Atração (Cidade)'. Retorne um JSON com a chave "suggestions" e um array de strings.`;
    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: suggestionsSchema } });
        const result = JSON.parse(response.text) as { suggestions: string[] };
        return result.suggestions;
    } catch (error) {
        console.error(`Error calling Gemini API for attraction suggestions:`, error);
        throw new Error(`Falha ao buscar sugestões de atrações.`);
    }
};
