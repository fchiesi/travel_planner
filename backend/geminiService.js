const { GoogleGenAI, Type } = require("@google/genai");

// A chave de API agora é lida de forma segura das variáveis de ambiente no backend
const GEMINI_API_KEY = process.env.API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("A variável de ambiente API_KEY da Gemini não está definida no backend!");
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Os schemas são os mesmos, pois definem a estrutura que o frontend espera
const activitySchema = { type: Type.OBJECT, properties: { description: { type: Type.STRING }, estimatedCost: { type: Type.NUMBER } }, required: ["description", "estimatedCost"] };
const accommodationSuggestionSchema = { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING, enum: ['Hotel', 'Airbnb', 'Hostel'] }, city: { type: Type.STRING }, location: { type: Type.STRING }, totalStayPrice: { type: Type.NUMBER }, amenities: { type: Type.OBJECT, properties: { hasBreakfast: { type: Type.BOOLEAN }, hasPool: { type: Type.BOOLEAN }, hasKitchen: { type: Type.BOOLEAN } }, required: ["hasBreakfast", "hasPool", "hasKitchen"] }, bookingSite: { type: Type.STRING } }, required: ["name", "type", "city", "location", "totalStayPrice", "amenities", "bookingSite"] };
const accommodationOptionsSchema = { type: Type.OBJECT, description: "Uma lista única com 7 a 10 sugestões de acomodação variadas.", properties: { suggestions: { type: Type.ARRAY, items: accommodationSuggestionSchema } }, required: ["suggestions"] };
const overnightStopSchema = { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, accommodationOptions: accommodationOptionsSchema, activities: { type: Type.ARRAY, items: activitySchema } }, required: ["name", "description", "accommodationOptions", "activities"] };
const transportationDetailsSchema = { type: Type.OBJECT, properties: { mode: { type: Type.STRING }, totalCost: { type: Type.NUMBER }, details: { type: Type.STRING }, suggestedDepartureTime: { type: Type.STRING }, totalDistanceKm: { type: Type.NUMBER }, tollPlazaBreakdown: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, cost: { type: Type.NUMBER } }, required: ["name", "cost"] } }, breakdown: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.STRING } }, required: ["label", "value"] } }, strategicStops: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "description"] } }, potentialOutboundStops: { type: Type.ARRAY, items: overnightStopSchema }, potentialReturnStops: { type: Type.ARRAY, items: overnightStopSchema }, originIataCode: { type: Type.STRING }, destinationIataCode: { type: Type.STRING }, priceSource: { type: Type.STRING }, bookingUrl: { type: Type.STRING } }, required: ["mode", "totalCost", "details", "suggestedDepartureTime"] };
const itinerarySchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.NUMBER }, title: { type: Type.STRING }, location: { type: Type.STRING }, estimatedDayCost: { type: Type.NUMBER }, activities: { type: Type.ARRAY, items: activitySchema }, foodSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["day", "title", "location", "estimatedDayCost", "activities", "foodSuggestions"] } };
const restaurantSuggestionSchema = { type: Type.OBJECT, properties: { name: { type: Type.STRING }, averageGroupCost: { type: Type.NUMBER }, cuisine: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "averageGroupCost", "cuisine", "description"] };
const tripPlanSchema = { type: Type.OBJECT, properties: { destinationName: { type: Type.STRING }, destinationCountry: { type: Type.STRING }, startDate: { type: Type.STRING }, endDate: { type: Type.STRING }, durationDays: { type: Type.NUMBER }, baseCost: { type: Type.NUMBER }, travelers: { type: Type.OBJECT, properties: { adults: { type: Type.NUMBER }, children: { type: Type.ARRAY, items: { type: Type.NUMBER } } }, required: ["adults", "children"] }, transportationDetails: transportationDetailsSchema, costBreakdown: { type: Type.OBJECT, properties: { transportation: { type: Type.NUMBER }, food: { type: Type.NUMBER }, activities: { type: Type.NUMBER }, shopping: { type: Type.NUMBER } }, required: ["transportation", "food", "activities", "shopping"] }, accommodationOptions: accommodationOptionsSchema, restaurantSuggestions: { type: Type.ARRAY, items: restaurantSuggestionSchema }, itinerary: itinerarySchema, shoppingTips: { type: Type.ARRAY, items: { type: Type.STRING } }, destinationTips: { type: Type.ARRAY, items: { type: Type.STRING } }, startLocation: { type: Type.STRING }, startLocationCoords: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lon: { type: Type.NUMBER } } } }, required: ["destinationName", "destinationCountry", "startDate", "endDate", "durationDays", "baseCost", "travelers", "transportationDetails", "costBreakdown", "accommodationOptions", "restaurantSuggestions", "itinerary", "shoppingTips", "destinationTips", "startLocation"] };
const fullSchema = { type: Type.ARRAY, description: "Uma lista de planos de viagem distintos.", items: tripPlanSchema };

// Funções de construção de prompt (exatamente como no frontend)
const GENERAL_RULES = `
**REGRAS DE VERIFICAÇÃO DE DADOS (OBRIGATÓRIO):**
1.  **DADOS REAIS E VERIFICADOS:** Todos os dados, especialmente custos, DEVEM ser realistas e baseados em buscas simuladas em sites reais e atuais. NUNCA invente valores.
2.  **CONFRONTAÇÃO DE FONTES:** Para custos críticos (passagens aéreas, aluguel de carro), SIMULE uma busca em pelo menos DUAS fontes diferentes (ex: Skyscanner e Kayak). Use o valor mais consistente e razoável. Sempre informe a fonte no campo 'priceSource'.
3.  **PONTO DE PARTIDA:** Use o 'startLocation' do usuário. Se as coordenadas ('startLocationCoords') forem fornecidas, use-as para obter a máxima precisão nos cálculos.

**REGRAS CRÍTICAS DE GERAÇÃO (APLICAR A TODOS OS PLANOS):**
1.  **DATAS:** A data de hoje é ${new Date().toLocaleDateString('pt-br')}. **NUNCA sugira uma viagem que comece em uma data passada.** Se o usuário não especificar datas, sugira datas realistas começando pelo menos 15 dias a partir de hoje. A 'durationDays' DEVE contar a viagem completa.
2.  **ITINERÁRIO INTELIGENTE:** Os dias de viagem (primeiro e último dia) DEVEM ter atividades mais leves. Sugira um 'suggestedDepartureTime' realista. Se houver menores, as atividades devem ser adequadas para as idades fornecidas.
3.  **HOSPEDAGEM DETALHADA ('accommodationOptions'):** Gere uma lista consolidada com 7 a 10 sugestões de acomodação variadas. A lista deve ser um único array em 'suggestions' e misturar opções de Hotéis, Airbnbs e Hostels, fornecendo todos os detalhes solicitados no schema.
4.  **CUSTO BASE ('baseCost'):** Calcule este custo somando transporte, alimentação e atividades. **NÃO INCLUA HOSPEDAGEM AQUI.**
5.  **FALLBACK:** Se o pedido for inviável, primeiro mude o destino para um de perfil similar. Se não der, mude as datas.
6.  **INFORMAÇÕES DO USUÁRIO:** Retorne o objeto de viajantes, a string 'startLocation' e o objeto 'startLocationCoords' (se fornecido) exatamente como foram fornecidos.
`;
const FLIGHT_RULES = `**REGRAS PARA VIAGENS DE AVIÃO (PREÇO REAL, FONTE, DATAS E LINK):**
- **Códigos IATA:** OBRIGATÓRIO fornecer os códigos IATA de origem e destino.
- **PREÇOS REAIS E DATADOS:** NÃO INVENTE VALORES. AJA COMO SE estivesse fazendo uma busca real por passagens nos sites Skyscanner ou Kayak para as datas EXATAS da viagem (\`startDate\` e \`endDate\`) e para o número correto de viajantes.
- **FONTE DO PREÇO:** É OBRIGATÓRIO preencher o campo \`priceSource\`.
- **LINK DIRETO:** É OBRIGATÓRIO preencher o campo \`bookingUrl\` com o link EXATO da sua busca simulada.
- **Detalhes da Estimativa:** No campo \`details\`, seja explícito sobre o que o custo representa.
`;
const CAR_TRAVEL_RULES = `**REGRAS PARA VIAGENS DE CARRO (SE APLICA A 'Carro próprio' e 'Carro Alugado'):**
1.  **DURAÇÃO POR DISTÂNCIA (Regra OBRIGATÓRIA):**m
    - Até 500 km: 3-4 dias; Até 700 km: 5-7 dias; Até 1000 km: 7-8 dias; Até 2000 km: 9-12 dias; Até 3000 km: 15 dias.
    - **Acima de 3500 km: NÃO SUGIRA viagem de carro. É inviável.**
2.  **PARADA COM PERNOITE OBRIGATÓRIA:** Se a distância TOTAL (ida e volta) for > 1200 km, é OBRIGATÓRIO incluir 2-3 cidades candidatas para parada com pernoite na IDA em \`potentialOutboundStops\`, com opções de hospedagem e atividades. Se a viagem tiver mais de 8 dias, faça o mesmo para a VOLTA em \`potentialReturnStops\`.
3.  **CÁLCULO PRECISO E OBRIGATÓRIO (SIMULAÇÃO 'WebRouter'):**
    - AJA COMO SE estivesse usando uma ferramenta de roteirização profissional.
    - **Distância Total:** Calcule a distância EXATA (ida e volta) e preencha \`totalDistanceKm\`.
    - **Custo de Combustível:** Pesquise o preço ATUAL do combustível. Assuma 10 km/litro.
    - **Custo de Pedágios (DETALHADO):** É OBRIGATÓRIO identificar CADA praça de pedágio em \`tollPlazaBreakdown\`.
    - **Custo Total:** \`totalCost\` DEVE ser a SOMA PRECISA de combustível, pedágios e aluguel (se aplicável).
`; // Copie todo o conteúdo de CAR_TRAVEL_RULES aqui

function getUserInfoText(criteria) {
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

// Copie as funções buildBuilderPrompt, buildBudgetPrompt, buildSurpriseMePrompt, e buildDefaultPrompt aqui...

function buildPrompt(criteria) {
    if (criteria.multipleDestinations) {
        // return buildBuilderPrompt(criteria); // Supondo que você copiou
    }
    if (criteria.budget) {
        // return buildBudgetPrompt(criteria); // Supondo que você copiou
    }
    if (criteria.destination === 'SURPRISE_ME') {
        // return buildSurpriseMePrompt(criteria); // Supondo que você copiou
    }
    // return buildDefaultPrompt(criteria); // Supondo que você copiou
    // Por simplicidade, vamos usar o default por enquanto:
    const userInfo = getUserInfoText(criteria);
    return `Aja como um especialista em viagens. ${userInfo}. Gere 3 sugestões de viagem. ${GENERAL_RULES}${FLIGHT_RULES}${CAR_TRAVEL_RULES}`;
}


async function generateTripPlans(criteria) {
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

        const rawPlans = JSON.parse(response.text);
        return rawPlans.map(plan => ({
            ...plan,
            id: `backend-${crypto.randomUUID()}` // Adiciona um ID único gerado no backend
        }));

    } catch (error) {
        console.error("Erro na chamada da API Gemini no backend:", error);
        if (error.message && error.message.includes('SAFETY')) {
            throw new Error("A resposta foi bloqueada devido a políticas de segurança. Tente uma busca diferente.");
        }
        throw new Error("Falha ao se comunicar com a IA para gerar sugestões.");
    }
}

// Exporta a função para que nosso index.js possa usá-la
module.exports = { generateTripPlans };