import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request so downstream controllers can access req.user
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        roleId: string;
    };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Not authorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            email: string;
            roleId: string;
        };
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Not authorized. Token is invalid or expired." });
    }
};

// Use this on admin-only routes
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: "Not authorized." });
    }
    // Adjust the role name check to match your DB — "ADMIN" by default
    if (req.user.roleId !== "ADMIN") {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
};