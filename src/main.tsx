import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Google Maps Platform quota and auth failure listener
(window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};

// Suppress unhandled cross-origin "Script error." events
window.addEventListener('error', (event) => {
  if (event.message === 'Script error.') {
    event.preventDefault();
  }
});

const origError = console.error;
console.error = (...args: unknown[]) => {
  origError.apply(console, args);
  const msg = args.map((a) => String(a)).join(' ');
  if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
};

createRoot(document.getElementById('root')!).render(<App />);

// Register Service Worker for offline access in DisasterLens AI command center
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Successfully registered service worker
        console.log('[DisasterLens SW] Registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('[DisasterLens SW] Registration failed:', error);
      });
  });
}

