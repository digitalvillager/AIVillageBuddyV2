import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/custom-styles.css";

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // We could send this to a logging service if needed
});

// Prevent the runtime error modal from showing up for ResizeObserver errors
const originalConsoleError = console.error;
console.error = function(message, ...args) {
  if (
    (typeof message === 'string' && message.includes('ResizeObserver loop')) ||
    (message && message.message && message.message.includes('ResizeObserver loop')) ||
    (args[0] && typeof args[0] === 'object' && args[0].message && args[0].message.includes('ResizeObserver loop'))
  ) {
    // Ignore ResizeObserver errors
    return;
  }
  originalConsoleError.apply(console, [message, ...args]);
};

// Create a safer ResizeObserver that handles errors
const SafeResizeObserver = class extends ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    super((entries, observer) => {
      try {
        callback(entries, observer);
      } catch (e) {
        console.warn('ResizeObserver callback error:', e);
      }
    });
  }
};

// Replace the global ResizeObserver with our safer version
window.ResizeObserver = SafeResizeObserver;

createRoot(document.getElementById("root")!).render(<App />);
