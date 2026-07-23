// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

import { registerServiceWorker } from './utils/serviceWorker';

import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { TitlesProvider } from './context/TitlesContext';
import { GameProvider } from './context/GameContext';
import { MissionsProvider } from './context/MissionsContext';

// ── REGISTRAR SERVICE WORKER ──
registerServiceWorker();

// ── SOLICITAR PERMISO DE NOTIFICACIONES ──
// ✅ CORREGIDO: Pedir permiso inmediatamente después de cargar la app
if ('Notification' in window) {
  // Si el permiso es 'default', pedirlo
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('📱 Permiso de notificaciones:', permission);
    });
  } else {
    console.log('📱 Estado actual de notificaciones:', Notification.permission);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <TitlesProvider>
            <GameProvider>
              <MissionsProvider>
                <App />
              </MissionsProvider>
            </GameProvider>
          </TitlesProvider>
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);