const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const axios = require('axios');
const { generateTripPlans } = require('./geminiService.js');

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

  try {
    // O seu service já lida com o processamento do prompt e a chamada da API
    const tripPlans = await generateTripPlans(searchCriteria); 
    res.json(tripPlans);
  } catch (error) {
    console.error('Erro ao gerar sugestões de viagem:', error);
    // Retorna um erro mais genérico para o frontend, mas o detalhe está no console do backend
    if (error instanceof Error) {
        res.status(500).json({ message: error.message });
    } else {
        res.status(500).json({ message: "Ocorreu um erro interno no servidor ao gerar sugestões." });
    }
  }
});
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
