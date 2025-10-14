const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const axios = require('axios');

const app = express();
// NOTE: Use a port different from your frontend. 3001 is a common choice.
const port = process.env.PORT || 3001; 

// =================================================================
// CORS Middleware - CRITICAL for Frontend/Backend communication
// =================================================================
// This is the most likely cause of the "Failed to fetch" error.
// The `cors` middleware adds the necessary headers to the response
// to tell the browser that it's safe to allow the frontend (running on a different port)
// to access this backend.
app.use(cors());

// Middleware to parse JSON bodies from requests
app.use(express.json());

// A simple test route to check if the server is alive
app.get('/', (req, res) => {
  res.send('Backend do App Viagem está no ar!');
});

// Health check endpoint for the frontend to verify connection
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


// The main endpoint for trip suggestions
app.post('/api/trip-suggestions', async (req, res) => {
  const searchCriteria = req.body;
  
  console.log('Backend recebeu os critérios de busca:', searchCriteria);

  // Here you would normally call external APIs (Skyscanner, Google, etc.)
  // For now, to ensure the connection works, we'll return mock data.
  // This helps isolate the problem: if you see this data in the frontend,
  // the connection and CORS are working correctly.

  try {
    const mockTripPlans = [
      {
        id: "mock-backend-123",
        destinationName: "Rio de Janeiro (Dados do Backend!)",
        destinationCountry: "Brasil",
        startDate: "2024-12-20",
        endDate: "2024-12-27",
        durationDays: 8,
        baseCost: 2500,
        travelers: searchCriteria.travelers,
        startLocation: searchCriteria.startLocation,
        transportationDetails: {
          mode: "Avião",
          totalCost: 1200,
          details: "Voo direto de São Paulo para Rio de Janeiro.",
          suggestedDepartureTime: "09:00",
          priceSource: "Backend Mock Flights"
        },
        accommodationOptions: {
          suggestions: [
            { name: "Hotel Copacabana Palace", type: "Hotel", city: "Rio de Janeiro", location: "Copacabana", totalStayPrice: 5000, amenities: { hasBreakfast: true, hasPool: true, hasKitchen: false }, bookingSite: "Booking.com" }
          ]
        },
        itinerary: [{ day: 1, title: "Chegada e Check-in", location: "Rio de Janeiro", estimatedDayCost: 150, activities: [{ description: "Check-in no hotel e caminhada pela orla de Copacabana.", estimatedCost: 0 }], foodSuggestions: ["Quiosque na praia"] }],
        restaurantSuggestions: [{ name: "Garota de Ipanema", averageGroupCost: 250, cuisine: "Brasileira", description: "Famoso pela Bossa Nova." }],
        shoppingTips: ["Feira Hippie de Ipanema aos domingos."],
        destinationTips: ["Cuidado com seus pertences em locais movimentados."],
        costBreakdown: {
          transportation: 1200,
          food: 800,
          activities: 500,
          shopping: 0,
        }
      }
    ];

    res.json(mockTripPlans);

  } catch (error) {
    console.error('Erro no endpoint /api/trip-suggestions:', error);
    res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${port}`);
  console.log('Certifique-se de que o frontend está tentando se conectar a esta porta.');
});