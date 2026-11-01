import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Global_App from "./Global_App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Global_App />
  </StrictMode>
);