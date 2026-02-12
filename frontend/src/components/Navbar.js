import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ role, onLogout }) {
  const navigate = useNavigate();
  const logout = () => { onLogout(); navigate("/login"); };

  return (
    <div className="nav">
      <div className="nav-inner">
        <div className="brand">
          <span className="dot" />
          GreenFleet
          <span className="pill">{role || "Guest"}</span>
        </div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/vessels/new">Add Vessel</Link>
          <Link to="/voyages/new">Add Voyage</Link>
          <Link to="/users/new">Create User</Link>
          <button className="btn btn-ghost" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
