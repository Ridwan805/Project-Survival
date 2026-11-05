import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home_Page from "./Home_Page/App";
import Log_In from "./Log_In/Log_In";
import Sign_Up from "./Sign_Up/Sign_Up";

function Global_App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home_Page />} />
        <Route path="/login" element={<Log_In />} />
        <Route path="/signup" element={<Sign_Up />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Global_App;