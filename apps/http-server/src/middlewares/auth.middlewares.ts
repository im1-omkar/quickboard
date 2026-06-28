import express from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Extending the existing Express Request interface
declare global {
    namespace Express {
        interface Request {
            user: {
                userId: string;
                email: string;
            };
        }
    }
}


const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // 1. Get the token from the Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // 2. Verify the token
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
            userId: string;
            email: string;
        };

        // 3. Attach the decoded payload to the request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        };

        // 4. Proceed to the route
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token." });
    }
};

export default authMiddleware;