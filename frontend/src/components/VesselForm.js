import React, { useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function VesselForm({ token }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", imo_number:"", fuel_type:"HFO", engine_type:"", fuel_capacity:"", avg_speed:"" });
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post("/api/vessels", form, { headers: { Authorization: `Bearer ${token}` } });
      setMsg({ type: "ok", text: "Vessel saved." });
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || err.message || "Failed" });
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 760, margin: "24px auto" }}>
        <h1 className="h1">Add Vessel</h1>
        <p className="muted">Register a vessel profile.</p>

        {msg?.type === "err" && <div className="alert">{msg.text}</div>}
        {msg?.type === "ok" && <div className="notice">{msg.text}</div>}

        <form onSubmit={submit} className="grid-2">
          <div><label>Name</label><input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required/></div>
          <div><label>IMO Number</label><input value={form.imo_number} onChange={(e)=>setForm({...form,imo_number:e.target.value})} required/></div>

          <div>
            <label>Fuel Type</label>
            <select value={form.fuel_type} onChange={(e)=>setForm({...form,fuel_type:e.target.value})}>
              <option>HFO</option><option>MDO</option><option>MGO</option><option>LNG</option>
            </select>
          </div>
          <div><label>Engine Type</label><input value={form.engine_type} onChange={(e)=>setForm({...form,engine_type:e.target.value})}/></div>

          <div><label>Fuel Capacity (t)</label><input value={form.fuel_capacity} onChange={(e)=>setForm({...form,fuel_capacity:e.target.value})}/></div>
          <div><label>Average Speed (knots)</label><input value={form.avg_speed} onChange={(e)=>setForm({...form,avg_speed:e.target.value})}/></div>

          <div style={{ gridColumn:"1 / -1" }}>
            <button className="btn" type="submit">Save Vessel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
