import express, { Request, Response } from "express";
import cors from "cors";

import * as dotenv from "dotenv";
import db from "./config/db";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);



app.listen(5000, () => {
  console.log(`Server running on port 5000`);
});
