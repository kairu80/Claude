import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HomeView } from './views/HomeView';
import { KidView } from './views/KidView';
import { ParentView } from './views/ParentView';

function AppContent() {
  const { state } = useApp();

  switch (state.currentView) {
    case 'kid':    return <KidView />;
    case 'parent': return <ParentView />;
    default:       return <HomeView />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
