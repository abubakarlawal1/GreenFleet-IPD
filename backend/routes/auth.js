const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const ALLOWED_ROLES = ["Admin", "Manager", "Viewer"];

function countUsers(cb) {
  db.query("SELECT COUNT(*) AS total FROM users", (err, rows) => {
    if (err) return cb(err);
    cb(null, rows[0].total);
  });
}

// Create first Admin ONLY if no users exist yet
router.post("/bootstrap", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "username and password required" });

  countUsers(async (err, total) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.message });
    if (total > 0) return res.status(400).json({ message: "Bootstrap disabled: users already exist" });

    const hash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, 'Admin')",
      [username, hash],
      (err2, result) => {
        if (err2) {
          if (err2.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Username already exists" });
          return res.status(500).json({ message: "DB error", error: err2.message });
        }
        return res.status(201).json({ message: "Admin created", userId: result.insertId, role: "Admin" });
      }
    );
  });
});

// Admin creates users
router.post("/users", authenticateToken, authorizeRoles("Admin"), async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ message: "username, password, role required" });
  if (!ALLOWED_ROLES.includes(role)) return res.status(400).json({ message: "role must be Admin, Manager, or Viewer" });

  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hash, role],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Username already exists" });
        return res.status(500).json({ message: "DB error", error: err.message });
      }
      return res.status(201).json({ message: "User created", userId: result.insertId, username, role });
    }
  );
});

// Login -> token + role
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.message });
    if (!rows || rows.length === 0) return res.status(400).json({ message: "User not found" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Incorrect password" });

    const role = (user.role || "").trim();
    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, { expiresIn: "2h" });

    return res.json({ token, role });
  });
});

router.get("/me", authenticateToken, (req, res) => res.json({ id: req.user.id, role: req.user.role }));

module.exports = router;
