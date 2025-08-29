import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LiveChat } from "./components/Chat";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <LiveChat auth="development-1234" />
  </StrictMode>
);
