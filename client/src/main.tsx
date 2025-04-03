import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";
import "./lib/custom-styles.css";

// Global error handler for ResizeObserver errors
// These errors don't actually affect functionality but show up in the console
const originalError = window.console.error;
window.console.error = (...args) => {
  if (
    args[0]?.includes?.('ResizeObserver loop') || 
    args[0]?.message?.includes?.('ResizeObserver loop')
  ) {
    // Ignore ResizeObserver errors
    return;
  }
  originalError(...args);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
