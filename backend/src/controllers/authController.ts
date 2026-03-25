import bcrypt from "bcrypt";
import db from "../config/db";
import e, { Request, Response } from "express";


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
            }
        });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        res.status(200).json({ message: "Login successful", userId: user.id });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Internal server error" });
    } 
}
        

