import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { listen } from "@tauri-apps/api/event";

listen("screenshot_taken", (event) => {
  console.log("📸 Screenshot saved at:", event.payload);
  // You can show notification, update UI, etc.
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
