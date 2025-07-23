import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import Layout from "./bg"
import { BgProvider } from "./BgContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <BgProvider>
        <Layout>
          <App />
        </Layout>
      </BgProvider>
    </BrowserRouter>
  </React.StrictMode>
);