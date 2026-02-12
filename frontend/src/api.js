import axios from "axios";

// ✅ Relative URLs + CRA proxy => no invalid URL errors
export const api = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" }
});
