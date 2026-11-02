import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Log_In from "./Log_In/Log_In";
import Sign_Up from "./Sign_Up/Sign_Up";

function Global_App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Log_In />} />
        <Route path="/signup" element={<Sign_Up />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Global_App;