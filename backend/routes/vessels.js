const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", authenticateToken, authorizeRoles("Admin", "Manager"), (req, res) => {
  const { name, imo_number, fuel_type, engine_type, fuel_capacity, avg_speed } = req.body;
  if (!name || !imo_number) return res.status(400).json({ message: "name and imo_number are required" });

  const created_by = req.user.id;

  db.query(
    `INSERT INTO vessels (name, imo_number, fuel_type, engine_type, fuel_capacity, avg_speed, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, imo_number, fuel_type || null, engine_type || null, fuel_capacity || null, avg_speed || null, created_by],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Vessel with this IMO already exists" });
        return res.status(500).json({ message: "DB error", error: err.message });
      }
      return res.status(201).json({ message: "Vessel created", vesselId: result.insertId });
    }
  );
});

router.get("/", authenticateToken, (req, res) => {
  db.query("SELECT * FROM vessels ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.message });
    return res.json(rows);
  });
});

module.exports = router;
