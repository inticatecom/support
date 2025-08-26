import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Chat } from "./components/Chat";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Chat auth="development-1234" />
  </StrictMode>
);
