import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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
    // import.meta.env.BASE_URL es inyectado por Vite
    const baseUrl = (import.meta as any).env.BASE_URL;
    // Asegurar que no haya doble barra si baseUrl termina en /
    const swUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}sw.js`;
    
    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('SW registrado con éxito:', registration.scope);
      })
      .catch((err) => {
        console.error('Fallo en registro de SW:', err);
      });
  });
}