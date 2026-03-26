import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db";
import  { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";


interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export const registerUser = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    try {
    const {username,email, password,confirmPassword } = req.body;

    if(!username || !email || !password || !confirmPassword){
        return res.status(400).json({error: "All fields are required"});
    }
    if(password !== confirmPassword){
        return res.status(400).json({error: "Passwords do not match"});
    }
    const existingUser = await db.user.findFirst({
        where: {
            email: email
        }    });
    
    if(existingUser){
        return res.status(400).json({error: "User already exists"});
    }
    const customerRole = await db.role.findUniqueOrThrow({
    where: { name: "CUSTOMER" },
    });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
            role_id: customerRole.id
        }    });
    res.status(201).json({message: "User registered successfully", userId: newUser.id});

}catch(error){
    console.error("Error registering user:", error);
    res.status(500).json({error: "Internal server error"});
}

}

interface LoginRequest {
  email: string;
  password: string;
}

export const loginUser = async (req :Request<{},{},LoginRequest>, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }   
        const user = await db.user.findFirst({
            where: {
                email: email
            },
            include: { role: true }
        });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role_id, roleName: user.role.name }, process.env.JWT_SECRET!, { expiresIn: "7d" });
        res.status(200).json({ 
            message: "Login successful", 
            userId: user.id, 
            username: user.username,
            role: user.role.name,
            token });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Internal server error" });
    } 
}
export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await db.user.findUnique({
            where: { id: Number(req.user!.userId) },
            select: {
                id: true,
                username: true,
                email: true,
                mobile_number: true,
                country: true,
                created_at: true,
                role: { select: { name: true } }
            }
        });
 
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
 
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
    
