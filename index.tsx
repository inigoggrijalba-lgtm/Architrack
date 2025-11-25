import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Manually define ImportMetaEnv to fix TS errors when vite/client is missing
declare global {
  interface ImportMetaEnv {
    readonly BASE_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Vite reemplaza import.meta.env.BASE_URL automáticamente en el build
    const baseUrl = import.meta.env.BASE_URL;
    const swUrl = `${baseUrl}sw.js`;
    
    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('SW registrado con éxito en:', registration.scope);
      })
      .catch((err) => {
        console.error('Fallo en registro de SW:', err);
      });
  });
}