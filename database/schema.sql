CREATE DATABASE IF NOT EXISTS greenfleet CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE greenfleet;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin','Manager','Viewer') NOT NULL DEFAULT 'Viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vessels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  imo_number VARCHAR(20) NOT NULL UNIQUE,
  fuel_type VARCHAR(30),
  engine_type VARCHAR(60),
  fuel_capacity DECIMAL(10,2),
  avg_speed DECIMAL(10,2),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vessel_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS voyages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vessel_id INT NOT NULL,
  departure_port VARCHAR(80),
  arrival_port VARCHAR(80),
  distance_nm DECIMAL(10,2) NOT NULL,
  duration_hours DECIMAL(10,2),
  fuel_type VARCHAR(30),
  fuel_tons DECIMAL(10,3) NOT NULL,
  co2_tons DECIMAL(10,3) NOT NULL DEFAULT 0,
  nox_tons DECIMAL(10,3) NOT NULL DEFAULT 0,
  sox_tons DECIMAL(10,3) NOT NULL DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_voyage_vessel FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE,
  CONSTRAINT fk_voyage_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
