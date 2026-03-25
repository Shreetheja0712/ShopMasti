import express from "express";
import { loginUser, registerUser } from "../controllers/authController";
import { ro } from "@faker-js/faker";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

export default router;