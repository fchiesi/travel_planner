import React from 'react';
import { GoogleIcon } from './icons/GoogleIcon.tsx';
import { useAuth } from '../hooks/useAuth.ts';

interface HeaderAuthProps {
  isLoading: boolean;
}

export const HeaderAuth: React.FC<HeaderAuthProps> = ({ isLoading }) => {
  const { user, login, logout } = useAuth();

  if (isLoading) {
    return <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            {user.photoURL && <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />}
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.displayName}</span>
        </div>
        <button onClick={logout} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-sm">
          Sair
        </button>
      </div>
    );
  }

  return (
     <button onClick={login} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
        <GoogleIcon />
        Login com Google
    </button>
  );
};
