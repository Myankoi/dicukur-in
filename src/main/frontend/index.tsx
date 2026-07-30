import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';

const root = createRoot(document.getElementById('outlet')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
