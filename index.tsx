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
// Usamos import.meta.env.BASE_URL para que funcione tanto en localhost como en /Architrack/
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Vite reemplaza import.meta.env.BASE_URL con '/Architrack/' en producción
    const swUrl = `${(import.meta as any).env.BASE_URL}sw.js`;
    
    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('SW registrado con éxito:', registration.scope);
      })
      .catch((err) => {
        console.log('Fallo en registro de SW:', err);
      });
  });
}