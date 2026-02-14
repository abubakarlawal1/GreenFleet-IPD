
---

## Prerequisites
Install the following:
- **Node.js (LTS recommended)** + npm  
- **XAMPP** (Apache + MySQL)  
- A browser (Chrome/Edge)

---

## Local Setup 

### 1) Database Setup (phpMyAdmin / XAMPP)
1. Open **XAMPP Control Panel**
2. Start **Apache** and **MySQL**
3. Go to: `http://localhost/phpmyadmin`
4. Create a database called: **greenfleet**
5. Import the schema:
   - Click the **greenfleet** database
   - Go to **Import**
   - Choose file: `database/schema.sql`
   - Click **Go**
6. (Optional) Import demo data:
   - Import `database/seed.sql`

✅ After this, the DB tables should exist (e.g., `users`, `vessels`, `voyages`).

---

### 2) Backend Setup (Node/Express)
Open a terminal in the **backend** folder:

```bash
cd backend
node server.js

### 3) Frontend Setup
Open a terminal in the **frontend** folder:
cd frontend
npm install

The username and password for the Admin are
admin
admin123
