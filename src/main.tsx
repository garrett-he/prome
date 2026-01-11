import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/i18n";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("app") as HTMLElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
