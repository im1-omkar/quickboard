import express from "express";
import { prisma } from "@repo/db";

const boardsRouter = express.Router();


boardsRouter.post("/", async (req: any, res: any) => {
    const { title } = req.body;
    const { userId } = req.user; 

    const board = await prisma.board.create({
        data: {
            title: title || "Untitled Board",
            ownerId: userId
        }
    });
    res.status(201).json(board);
});


boardsRouter.get("/", async (req: any, res: any) => {
    const { userId } = req.user;

    const boards = await prisma.board.findMany();
    res.json(boards);
});


boardsRouter.get("/:boardId", async (req: any, res: any) => {
    const { boardId } = req.params;
    const { userId } = req.user;

    const board = await prisma.board.findFirst({
        where: {
            id: boardId,
            ownerId: userId
        }
    });

    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json(board);
});


boardsRouter.post("/:boardId/sync", async (req: any, res: any) => {
    const { boardId } = req.params;
    const { userId } = req.user;
    const { elements, zoom, scrollX, scrollY, backgroundColor } = req.body;

    try {
        const updatedBoard = await prisma.board.updateMany({
            where: {
                id: boardId,
                ownerId: userId
            },
            data: {
                elements,
                zoom,
                scrollX,
                scrollY,
                backgroundColor
            }
        });

        if (updatedBoard.count === 0) {
            return res.status(404).json({ message: "Board not found or unauthorized" });
        }
        res.json({ message: "Sync successful" });
    } catch (e) {
        res.status(500).json({ message: "Sync failed" });
    }
});

export default boardsRouter;