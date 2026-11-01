import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { BankProvider } from "./context/BankContext";

// CSS files (alag folder: src/css)
import "./css/global.css";
import "./css/layout.css";
import "./css/auth.css";
import "./css/dashboard.css";
import "./css/transactions.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <BankProvider>
        <App />
      </BankProvider>
    </BrowserRouter>
  </React.StrictMode>
);
