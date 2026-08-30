import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// The service worker only exists in a production build, and registering it
// after load keeps it off the critical path of the first paint.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, {scope: import.meta.env.BASE_URL})
      .catch(() => {
        // An unavailable worker costs offline support and nothing else, so a
        // failure here must never surface to the user.
      });
  });
}
