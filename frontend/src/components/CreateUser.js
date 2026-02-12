import React, { useState } from "react";
import { api } from "../api";

export default function CreateUser({ token, role }) {
  const [form, setForm] = useState({ username: "", password: "", role: "Manager" });
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post("/api/auth/users", form, { headers: { Authorization: `Bearer ${token}` } });
      setMsg({ type: "ok", text: "User created." });
      setForm({ username: "", password: "", role: "Manager" });
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || err.message || "Failed" });
    }
  };

  if (role !== "Admin") {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 720, margin: "24px auto" }}>
          <h1 className="h1">Create User</h1>
          <div className="alert">Only Admin can create users.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 720, margin: "24px auto" }}>
        <h1 className="h1">Create User</h1>
        <p className="muted">Admin-only: create Manager or Viewer accounts.</p>

        {msg?.type === "err" && <div className="alert">{msg.text}</div>}
        {msg?.type === "ok" && <div className="notice">{msg.text}</div>}

        <form onSubmit={submit} className="grid-2">
          <div><label>Username</label><input value={form.username} onChange={(e)=>setForm({...form,username:e.target.value})} required/></div>
          <div><label>Password</label><input type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} required/></div>
          <div>
            <label>Role</label>
            <select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}>
              <option>Manager</option><option>Viewer</option><option>Admin</option>
            </select>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end" }}>
            <button className="btn" type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
