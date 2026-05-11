import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/**
 * Root Element Safety Check
 * Prevents the app from crashing silently if the 'root' div is missing
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    "Zambia Z: Critical Failure. The root element was not found in the DOM. " +
    "Ensure your index.html contains <div id='root'></div>"
  );
}

// Create the concurrent React root
const root = ReactDOM.createRoot(rootElement);

/**
 * Global Rendering
 * We use StrictMode in development to catch unsafe lifecycles and 
 * legacy API usage, ensuring the app is future-proof.
 */
root.render(
  <React.StrictMode>
    {/* 
      Note: Global Contexts (Auth/Loan) are handled inside App.jsx 
      to keep the entry point clean and focused.
    */}
    <App />
  </React.StrictMode>
);

/**
 * Optional: Professional Analytics & Error Reporting
 * In a production Fintech app, you would initialize Sentry or 
 * LogRocket here to monitor crashes in real-time.
 */
// import * as Sentry from "@sentry/react";
// Sentry.init({ dsn: "YOUR_DSN_HERE" });
