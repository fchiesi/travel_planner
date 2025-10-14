import React, { useState, useEffect } from 'react';
import { TripPlan } from './types.ts';
import TripDetailsModal from './components/TripDetailsModal.tsx';
import TripEditorModal from './components/TripEditorModal.tsx';
import Spinner from './components/Spinner.tsx';
import { HeaderAuth } from './components/HeaderAuth.tsx';
import { useAuth } from './hooks/useAuth.ts';
import { useTrips } from './hooks/useTrips.ts';
import { HomePage } from './pages/HomePage.tsx';
import { ResultsPage } from './pages/ResultsPage.tsx';
import * as userProfileService from './services/userProfileService.ts';
import { checkBackendStatus } from './services/apiService.ts';
import { AlertTriangleIcon } from './components/icons/AlertTriangleIcon.tsx';

const App: React.FC = () => {
  const { user, isAuthLoading } = useAuth();
  const { 
    tripPlans, 
    isLoading, 
    error, 
    showResults,
    saveTripChoiceAndUpdateProfile
  } = useTrips();

  const [selectedTrip, setSelectedTrip] = useState<TripPlan | null>(null);
  const [editingTrip, setEditingTrip] = useState<TripPlan | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);

  useEffect(() => {
    const verifyConnection = async () => {
      const isOnline = await checkBackendStatus();
      setIsBackendOnline(isOnline);
    };
    verifyConnection();
  }, []);

  const handleSelectAndSaveTrip = (trip: TripPlan) => {
    saveTripChoiceAndUpdateProfile(trip);
    setSelectedTrip(trip);
  };
  
  const handleOpenEditor = (trip: TripPlan) => {
    setSelectedTrip(null);
    setEditingTrip(trip);
  };

  const handleSaveEditedTrip = (originalTrip: TripPlan, newTrip: TripPlan) => {
    if (user) {
      userProfileService.saveTripChoice(user.uid, newTrip);
    }
    setEditingTrip(null);
    setSelectedTrip(newTrip);
  };
  
  const renderContent = () => {
    if (isLoading && tripPlans.length === 0) {
      return <Spinner />;
    }
    
    if (error) {
       return (
         <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Oops! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      );
    }
    
    if (showResults) {
      return <ResultsPage onSelectTrip={handleSelectAndSaveTrip} />;
    }
    
    return <HomePage onSelectTrip={handleSelectAndSaveTrip} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isBackendOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangleIcon className="h-6 w-6 text-yellow-500 mr-4" /></div>
            <div>
              <p className="font-bold">Atenção: Conexão com o servidor falhou</p>
              <p className="text-sm">Para usar o app, o servidor backend precisa estar rodando. Abra um novo terminal, navegue até a pasta <strong>backend</strong> e execute o comando: <code>node index.js</code></p>
            </div>
          </div>
        </div>
      )}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold font-poppins text-teal-600">
            App Viagem
          </h1>
          <HeaderAuth isLoading={isAuthLoading} />
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {selectedTrip && (
        <TripDetailsModal 
          trip={selectedTrip} 
          onClose={() => setSelectedTrip(null)}
          onEdit={handleOpenEditor}
        />
      )}

      {editingTrip && (
        <TripEditorModal 
          trip={editingTrip}
          onClose={() => setEditingTrip(null)}
          onSave={handleSaveEditedTrip}
        />
      )}

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} App Viagem. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;