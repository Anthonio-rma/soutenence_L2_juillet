import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Importations des pages
import LandingPage from './pages/Landing_Page';
import LoginRegisterPage from './pages/login_et_registe_page';
import MainLayout from './layouts/MainLayout';
import PageUtilisateur from './pages/Administrateur/dashboard_admin';
import PageAlert from './pages/alerte_trafic';
import Pageconfig from './pages/configuration';
import SuiviGps from './pages/suivi_gps';
import G_utilisateur from './pages/Administrateur/G_utilisaeur';
import LigneTransportPage from './pages/Administrateur/ligne_transport';
import DonnerGPS from './pages/Administrateur/donner_gps';
import Dashboard_o from './pages/operateur/Dashboard_o';
import FlotteVehicule from './pages/operateur/flotte_hehicule';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Routes Publiques */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginRegisterPage />} />

        {/* 2. Routes Protégées / Dashboard (Imbriquées dans MainLayout) */}
        {/* Note : Toutes les routes ici auront une URL de type /dashboard/... */}
        <Route path="/dashboard" element={<MainLayout />}>
          
          {/* Index : correspond à /dashboard */}
          <Route index element={<PageUtilisateur />} />

          {/* Sous-pages */}
          <Route path="carte-temps-reel" element={<SuiviGps />} />
          <Route path="alert_trafic" element={<PageAlert />} />
          <Route path="configuration" element={<Pageconfig />} />
          <Route path="gestion_utilisataeur" element={<G_utilisateur />} />
          <Route path="lignes_transport" element={<LigneTransportPage />} />
          <Route path="donneGPS" element={<DonnerGPS />} />
          <Route path="Dashboard_operateur" element={<Dashboard_o />} />
          <Route path="flotte_vehicule" element={<FlotteVehicule />} />

          {/* Redirection si un utilisateur va sur un chemin inexistant sous /dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Catch-all : si l'URL ne correspond à rien du tout */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;