
import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Added .tsx extension to App import to resolve module error.
import App from './App.tsx';

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