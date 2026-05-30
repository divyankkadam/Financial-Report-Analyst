import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Home    from "./pages/Home";
import Analyst from "./pages/Analyst";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/analyst" element={<Analyst />} />
          <Route path="*"        element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
