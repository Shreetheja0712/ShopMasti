import bcrypt from "bcrypt";
import db from "../config/db";
import { Request, Response } from "express";


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
