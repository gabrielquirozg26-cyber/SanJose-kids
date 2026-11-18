// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

import { registerServiceWorker } from './utils/serviceWorker';

// ── REGISTRAR SERVICE WORKER ──
registerServiceWorker({ development: import.meta.env.DEV });

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
      {/* App contiene el único árbol de providers compartido por las rutas. */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
