import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './services/firebase.ts'; // Initialize Firebase
import { AuthProvider } from './contexts/AuthContext.tsx';
import { FavoritesProvider } from './contexts/FavoritesContext.tsx';
import { TripProvider } from './contexts/TripContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <TripProvider>
          <App />
        </TripProvider>
      </FavoritesProvider>
    </AuthProvider>
  </React.StrictMode>
);
