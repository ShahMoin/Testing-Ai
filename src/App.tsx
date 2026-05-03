/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import DashboardView from './views/DashboardView';
import AppliancesView from './views/AppliancesView';
import BookingsView from './views/BookingsView';
import ChatView from './views/ChatView';
import AdminView from './views/AdminView';
import LoginView from './views/LoginView';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const { user, loading, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-slate-950">
         <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="w-12 h-12 bg-white rounded-2xl"
         />
       </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView setView={setCurrentView} />;
      case 'appliances': return <AppliancesView />;
      case 'bookings': return <BookingsView />;
      case 'chat': return <ChatView />;
      case 'admin': return isAdmin ? <AdminView /> : <DashboardView setView={setCurrentView} />;
      default: return <DashboardView setView={setCurrentView} />;
    }
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-[#f5f5f5] relative">
      <main className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Navigation currentView={currentView} setView={setCurrentView} isAdmin={isAdmin} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
