import express from "express";
import cors from "cors";
import authRouter from "./src/modules/api.auth/auth.routes";
import boardsRouter from "./src/modules/api.boards/boards.routes";
import authMiddleware from "./src/middlewares/auth.middlewares";


const app = express();

app.use(express.json());
app.use(cors())

app.use("/api/auth",authRouter)
app.use("/api/boards",authMiddleware,boardsRouter)

app.listen(3000,()=>{
    console.log("server is running on PORT : 3000" )
})

