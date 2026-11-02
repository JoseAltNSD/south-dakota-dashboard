import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
// Carlito is a free, metric-compatible stand-in for the brand font Calibri, for devices without Calibri.
import '@fontsource/carlito/400.css';
import '@fontsource/carlito/700.css';
import './styles.css';

// HashRouter keeps routing working on any static host (no server rewrites needed).
// Switch to BrowserRouter if the hosting environment supports SPA fallbacks.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
