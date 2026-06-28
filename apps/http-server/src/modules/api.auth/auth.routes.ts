import express from "express";
import { prisma } from "@repo/db";
import jwt from "jsonwebtoken";

const authRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET


authRouter.post('/signup', async (req: express.Request, res: express.Response) => {
    const { email, password, nickName } = req.body;

    
    if (!email || !password || !nickName) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        
        const user = await prisma.user.create({
            data: { email, password, nickName }
        });

        res.status(201).json({ message: "User created successfully", userId: user.id });
    } catch (e) {
        if(e instanceof Error){
            console.log("error is : " + e.message);
        }
        res.status(500).json({ message: "Internal server error during signup" });
    }
});


authRouter.post('/signin', async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    try {
        
        const user = await prisma.user.findUnique({
            where: { email }
        });

        
        
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, nickName: user.nickName } });
    } catch (e) {
        res.status(500).json({ message: "Internal server error during signin" });
    }
});

export default authRouter;
