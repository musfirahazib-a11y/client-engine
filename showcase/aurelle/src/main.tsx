import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/globals.css";
import "./styles/nav.css";
import "./styles/hero.css";
import "./styles/product-scene.css";
import "./styles/sections.css";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
