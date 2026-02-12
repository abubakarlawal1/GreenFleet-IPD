import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function VoyageForm({ token }) {
  const navigate = useNavigate();
  const [vessels, setVessels] = useState([]);
  const [form, setForm] = useState({
    vessel_id:"", departure_port:"", arrival_port:"",
    distance_nm:"", duration_hours:"",
    fuel_type:"HFO", fuel_tons:""
  });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get("/api/vessels", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setVessels(r.data))
      .catch(console.log);
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post("/api/voyages", form, { headers: { Authorization: `Bearer ${token}` } });
      setMsg({ type: "ok", text: "Voyage saved (emissions calculated)." });
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || err.message || "Failed" });
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 760, margin: "24px auto" }}>
        <h1 className="h1">Add Voyage</h1>
        <p className="muted">Record voyage inputs; emissions are calculated automatically.</p>

        {msg?.type === "err" && <div className="alert">{msg.text}</div>}
        {msg?.type === "ok" && <div className="notice">{msg.text}</div>}

        <form onSubmit={submit} className="grid-2">
          <div>
            <label>Vessel</label>
            <select value={form.vessel_id} onChange={(e)=>setForm({...form,vessel_id:e.target.value})} required>
              <option value="">Select vessel</option>
              {vessels.map((v)=> <option key={v.id} value={v.id}>{v.name} (IMO {v.imo_number})</option>)}
            </select>
          </div>
          <div>
            <label>Fuel Type</label>
            <select value={form.fuel_type} onChange={(e)=>setForm({...form,fuel_type:e.target.value})}>
              <option>HFO</option><option>MDO</option><option>MGO</option><option>LNG</option>
            </select>
          </div>

          <div><label>Departure Port</label><input value={form.departure_port} onChange={(e)=>setForm({...form,departure_port:e.target.value})}/></div>
          <div><label>Arrival Port</label><input value={form.arrival_port} onChange={(e)=>setForm({...form,arrival_port:e.target.value})}/></div>

          <div><label>Distance (nm)</label><input value={form.distance_nm} onChange={(e)=>setForm({...form,distance_nm:e.target.value})} required/></div>
          <div><label>Duration (hours)</label><input value={form.duration_hours} onChange={(e)=>setForm({...form,duration_hours:e.target.value})}/></div>

          <div style={{ gridColumn:"1 / -1" }}>
            <label>Fuel Used (tons)</label>
            <input value={form.fuel_tons} onChange={(e)=>setForm({...form,fuel_tons:e.target.value})} required/>
          </div>

          <div style={{ gridColumn:"1 / -1" }}>
            <button className="btn" type="submit">Save Voyage</button>
          </div>
        </form>
      </div>
    </div>
  );
}
