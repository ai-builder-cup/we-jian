import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './view/App.jsx';
import './view/styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
