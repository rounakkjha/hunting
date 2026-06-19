
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // Register Service Worker for PWA only in production
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      if (import.meta.env.PROD) {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      } else {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
          console.log('[PWA] Service Worker unregistered in dev mode');
        });
      }
    });
  }

  createRoot(document.getElementById("root")!).render(<App />);
  