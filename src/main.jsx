import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Orden crítico: cada provider solo puede usar hooks de providers que lo wrapen
import { AuthProvider }     from './context/AuthContext';
import { ShopProvider }     from './context/ShopContext';
import { TitlesProvider }   from './context/TitlesContext';
import { GameProvider }     from './context/GameContext';
import { MissionsProvider } from './context/MissionsContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/*
        Orden del árbol (exterior → interior):
        1. AuthProvider     — auth, userDoc, vidas, racha (sin dependencias)
        2. ShopProvider     — cofres, santos, inventario  (necesita AuthContext)
        3. TitlesProvider   — logros, títulos             (necesita AuthContext)
        4. GameProvider     — lógica de juego             (necesita Auth + Shop + Titles)
        5. MissionsProvider — misiones                    (necesita GameContext → usuarioId)
        6. App              — rutas y vistas
      */}
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
