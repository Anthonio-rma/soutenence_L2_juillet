import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Importations CSS
import './index.css';
import 'leaflet/dist/leaflet.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const root = ReactDOM.createRoot(document.getElementById('root'));

// ⚠️ StrictMode retiré — il montait chaque composant 2x en dev,
// ce qui déclenchait GoogleOAuthProvider deux fois → initialize() multiple
root.render(
  <GoogleOAuthProvider clientId="1005774354778-1ofhfhmdnioritmako50ktfnadaq0sgd.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);

reportWebVitals();