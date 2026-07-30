import express from "express";
import cors from "cors";
import authRouter from "./src/modules/api.auth/auth.routes";
import boardsRouter from "./src/modules/api.boards/boards.routes";
import authMiddleware from "./src/middlewares/auth.middlewares";
import "dotenv/config";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
}

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
}

if (!process.env.FRONTEND_URL) {
    throw new Error("FRONTEND_URL is missing");
}

const app = express();
const PORT= Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials:true,
}))

app.use("/api/auth",authRouter)
app.use("/api/boards",authMiddleware,boardsRouter)

app.get("/health",(_,res)=>{
    res.status(200).json({status:"ok"});
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);

    res.status(500).json({
        message: "Internal Server Error"
    });
})

app.listen(PORT,()=>{
    console.log(`server is running on PORT : ${PORT} `) 
})
