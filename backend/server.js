const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}
));
app.use(express.json());
const pool = new Pool({
  connectionString: process.env.DB_URL,
  database: "neondb",
});


pool.query('SET search_path TO shopmasti_app;').then(() => {
  console.log('Search path set to shopmasti_app');
}).catch(err => {
  console.error('Error setting search path:', err);
});

app.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      console.error("Login failed: User not found");
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const r = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, r.password);
    if (!isPasswordValid) {
      console.error("Login failed: Invalid password");
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({ message: "Login successful", userId: r.id });
  }
  catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// app.get("/", (req, res) => {
//   res.send("Backend running successfully 🚀");
// });

// const PORT = process.env.PORT || 5000;

app.listen(5000, () => {
  console.log(`Server running on port 5000`);
});
