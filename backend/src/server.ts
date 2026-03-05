import express, { Request, Response } from "express";
import cors from "cors";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import db from "./config/db";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);

const pool = new Pool({
  connectionString: process.env.DB_URL,
  database: "shopmasti",
});



interface LoginRequest {
  email: string;
  password: string;
}

interface UserRow {
  id: string;
  password: string;
  [key: string]: any;
}

app.post("/", async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  const { email, password } = req.body;
  try {
    console.log(await db.user.findFirst({
        where: {
            email: email
        }
    }));
    const result = await pool.query(`SELECT * FROM "User" WHERE email = $1`, [
      email,
    ]);
    if (result.rows.length === 0) {
      console.error("Login failed: User not found");
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const r: UserRow = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, r.password);
    if (!isPasswordValid) {
      console.error("Login failed: Invalid password");
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({ message: "Login successful", userId: r.id });
  } catch (err) {
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
