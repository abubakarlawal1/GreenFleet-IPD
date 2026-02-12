const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { Parser } = require("json2csv");

const CO2_FACTOR = { HFO: 3.114, MDO: 3.206, MGO: 3.206, LNG: 2.750 };

function computeEmissions(fuel_type, fuel_tons) {
  const ft = Number(fuel_tons || 0);
  const factor = CO2_FACTOR[(fuel_type || "").toUpperCase()] || 3.114;
  const co2 = ft * factor;
  const nox = ft * 0.07;
  const sox = ft * 0.02;
  return {
    co2_tons: Number(co2.toFixed(3)),
    nox_tons: Number(nox.toFixed(3)),
    sox_tons: Number(sox.toFixed(3)),
  };
}

router.post("/", authenticateToken, authorizeRoles("Admin", "Manager"), (req, res) => {
  const { vessel_id, departure_port, arrival_port, distance_nm, duration_hours, fuel_type, fuel_tons } = req.body;
  if (!vessel_id || !distance_nm || !fuel_tons) {
    return res.status(400).json({ message: "vessel_id, distance_nm and fuel_tons are required" });
  }

  const created_by = req.user.id;
  const e = computeEmissions(fuel_type, fuel_tons);

  db.query(
    `INSERT INTO voyages
      (vessel_id, departure_port, arrival_port, distance_nm, duration_hours, fuel_type, fuel_tons,
       co2_tons, nox_tons, sox_tons, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      vessel_id,
      departure_port || null,
      arrival_port || null,
      distance_nm,
      duration_hours || null,
      fuel_type || null,
      fuel_tons,
      e.co2_tons,
      e.nox_tons,
      e.sox_tons,
      created_by,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });
      return res.status(201).json({ message: "Voyage created", voyageId: result.insertId, emissions: e });
    }
  );
});

router.get("/", authenticateToken, (req, res) => {
  db.query(
    `SELECT v.*, s.name AS vessel_name, s.imo_number
     FROM voyages v JOIN vessels s ON s.id = v.vessel_id
     ORDER BY v.id DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });
      return res.json(rows);
    }
  );
});

router.get("/summary", authenticateToken, (req, res) => {
  db.query(
    `SELECT 
        COUNT(*) AS voyages_count,
        COALESCE(SUM(co2_tons),0) AS total_co2,
        COALESCE(SUM(nox_tons),0) AS total_nox,
        COALESCE(SUM(sox_tons),0) AS total_sox
     FROM voyages`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });
      return res.json(rows[0]);
    }
  );
});

router.get("/export/csv", authenticateToken, authorizeRoles("Admin", "Manager"), (req, res) => {
  db.query(
    `SELECT v.id, s.name AS vessel_name, s.imo_number, v.departure_port, v.arrival_port,
            v.distance_nm, v.duration_hours, v.fuel_type, v.fuel_tons, v.co2_tons, v.nox_tons, v.sox_tons, v.created_at
     FROM voyages v JOIN vessels s ON s.id = v.vessel_id
     ORDER BY v.id DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });

      const fields = Object.keys(rows[0] || { id: 0 });
      const parser = new Parser({ fields });
      const csv = parser.parse(rows);

      res.header("Content-Type", "text/csv");
      res.attachment("voyages.csv");
      return res.send(csv);
    }
  );
});

module.exports = router;
