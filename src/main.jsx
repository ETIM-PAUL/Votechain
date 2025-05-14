import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { Providers } from "./Providers";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Providers>
      <Router>
        <App />
      </Router>
    </Providers>
  </StrictMode>,
);
