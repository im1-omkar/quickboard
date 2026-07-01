import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";

//add pint pong heartbeats :)

const wss = new WebSocketServer({ port: 8080 });

interface UserInterface {
    userId: string;
    roomId: string;
    ws: WebSocket;
}

interface RoomInterface {
    roomId: string;
    sockets: WebSocket[];
}

const rooms: RoomInterface[] = [];
const users: UserInterface[] = [];

wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, "http://localhost:");

    const token = req.headers["sec-websocket-protocol"];
    const boardId = url.searchParams.get("boardId");
    const JWT_SECRET = process.env.JWT_SECRET;

    

    if (!JWT_SECRET) {
        ws.send(JSON.stringify({ type: 'error', message: 'Server configuration error: JWT_SECRET is missing.' }));
        ws.close(1011, 'Server Error'); 
        return;
    }

    if (!token) {
        ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed: No token provided in Authorization header.' }));
        ws.close(1008, 'Policy Violation: Missing Token'); 
        return;
    }

    if (!boardId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Connection failed: Missing boardId in connection URL.' }));
        ws.close(1008, 'Policy Violation: Missing BoardId');
        return;
    }

    let userId: string;

    try {
        
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
            iat: number;
            exp: number;
        };
        userId = decoded.userId;

        
        const existingUser = users.find((user) => user.userId === userId);
        if (existingUser) {
            existingUser.roomId = boardId;
            existingUser.ws = ws;
        } else {
            users.push({
                userId: userId,
                roomId: boardId,
                ws: ws
            });
        }

        
        const existingRoom = rooms.find((room) => room.roomId === boardId);
        if (existingRoom) {
            existingRoom.sockets.push(ws);
        } else {
            rooms.push({
                roomId: boardId,
                sockets: [ws]
            });
        }

    } catch (err) {
        
        let errorMessage = "Authentication failed: Invalid or expired token.";

        if (err instanceof Error) {
            errorMessage = `Authentication failed: ${err.message}`;
            console.log("JWT Error:", err.message);
        }

        ws.send(JSON.stringify({ type: 'error', message: errorMessage }));
        ws.close(1008, 'Policy Violation: Invalid Token');
        return;
    }

    
    ws.on('message', (data) => {
        try {
            const mssg = JSON.parse(data.toString());

            if (mssg.type === 'sync') {
                const room = rooms.find((r) => r.roomId === boardId);

                if (room) {
                    room.sockets.forEach((clientWs) => {
                        if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
                            clientWs.send(JSON.stringify(mssg));
                        }
                    });
                }
            }
        } catch (error) {
            console.log("Failed to parse message:", error);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON message format.' }));
        }
    });

    
    ws.on('close', () => {
        const roomIndex = rooms.findIndex((r) => r.roomId === boardId);

        if (roomIndex !== -1) {
            if (!rooms[roomIndex]) return;

            rooms[roomIndex].sockets = rooms[roomIndex].sockets.filter((s) => s !== ws);

            if (rooms[roomIndex].sockets.length === 0) {
                rooms.splice(roomIndex, 1);
            }
        }

        const userIndex = users.findIndex((u) => u.ws === ws);
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
        }
    });

    
    ws.send(JSON.stringify({ type: 'success', message: `Client connected to server successfully ${boardId}` }));
});