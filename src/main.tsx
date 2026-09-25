import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
// Order matters: design-system.css declares the @layer order, Tailwind adds utilities on top.
import "./styles/design-system.css";
import "./styles/tailwind.css";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
