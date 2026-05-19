import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerServiceWorker } from './utils/pwaSetup.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// ลงทะเบียน Service Worker สำหรับ PWA
registerServiceWorker().catch(err => console.log('SW registration failed', err));
