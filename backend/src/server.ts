import express, { Request, Response } from "express";
import cors from "cors";

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



app.listen(5000, () => {
  console.log(`Server running on port 5000`);
});
