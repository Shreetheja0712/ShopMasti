const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, mobile_number } =
      req.body;
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !mobile_number
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address" });
    }
    if (!/^\d{7,15}$/.test(mobile_number)) {
      return res
        .status(400)
        .json({ error: "Phone number must be 7-15 digits" });
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(password)
    ) {
      return res.status(400).json({
        error:
          "Password must be at least 6 characters and include uppercase, lowercase, number, and special symbol",
      });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Email or username already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        mobile_number,
        role_id: 1,
      },
    });
    const token = jwt.sign(
      { userId: user.id, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );
    res.status(201).json({
      message: "User registered successfully",
      token,
      userId: user.id,
      username: user.username,
      role_id: user.role_id,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Error registering user" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.is_active)
      return res.status(403).json({ error: "Account is deactivated" });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid password" });
    const token = jwt.sign(
      { userId: user.id, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );
    res.status(200).json({
      message: "Login successful",
      token,
      userId: user.id,
      username: user.username,
      role_id: user.role_id,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
};

module.exports = { register, login };
