import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import { useAuth } from './context/AuthContext';
import LoginModal from './components/LoginModal';

import HistoryPage from './pages/HistoryPage';

import SavedPage from './pages/SavedPage';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/" />;
}

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results/:searchId" element={<ResultsPage />} />
        <Route path="/history" element={
          <PrivateRoute>
            <HistoryPage />
          </PrivateRoute>
        } />
        <Route path="/saved" element={
          <PrivateRoute>
             <SavedPage />
          </PrivateRoute>
        } />
      </Routes>

      {/* Global Auth Overlay */}
      <div className="fixed top-6 right-6 z-50">
        {isAuthenticated ? (
          <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md border border-slate-700 p-1.5 pr-4 rounded-full shadow-xl">
             <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                {user.email[0].toUpperCase()}
             </div>
             <span className="text-xs font-medium text-slate-300">{user.email}</span>
             <button onClick={logout} className="text-[10px] uppercase font-black text-slate-500 hover:text-rose-400 transition-colors">Logout</button>
          </div>
        ) : (
          <button 
            onClick={() => setShowLogin(true)}
            className="bg-slate-800/80 backdrop-blur-md border border-slate-700 px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-700 transition-all shadow-xl"
          >
            SIGN IN
          </button>
        )}
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
