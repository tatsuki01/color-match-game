import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";  // 必要に応じてスタイルを適用

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
