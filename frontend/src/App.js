import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import SetupAdmin from "./components/SetupAdmin";
import Dashboard from "./components/Dashboard";
import VesselForm from "./components/VesselForm";
import VoyageForm from "./components/VoyageForm";
import CreateUser from "./components/CreateUser";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  const onLogin = (t, r) => {
    const cleanRole = (r || "").trim();
    setToken(t);
    setRole(cleanRole);
    localStorage.setItem("token", t);
    localStorage.setItem("role", cleanRole);
  };

  const onLogout = () => {
    setToken("");
    setRole("");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  useEffect(() => {
    // keep state synced
    const t = localStorage.getItem("token") || "";
    const r = localStorage.getItem("role") || "";
    if (t !== token) setToken(t);
    if (r !== role) setRole(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      {token && <Navbar role={role} onLogout={onLogout} />}

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/setup" element={<SetupAdmin />} />

        <Route path="/dashboard" element={
          <ProtectedRoute token={token}>
            <Dashboard token={token} />
          </ProtectedRoute>
        } />

        <Route path="/vessels/new" element={
          <ProtectedRoute token={token}>
            <VesselForm token={token} />
          </ProtectedRoute>
        } />

        <Route path="/voyages/new" element={
          <ProtectedRoute token={token}>
            <VoyageForm token={token} />
          </ProtectedRoute>
        } />

        <Route path="/users/new" element={
          <ProtectedRoute token={token}>
            <CreateUser token={token} role={role} />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
