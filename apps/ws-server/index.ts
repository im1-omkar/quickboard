import {WebSocketServer} from "ws";
import jwt from "jsonwebtoken"

const wss = new WebSocketServer({port:8080});

interface UserInterface {
    userId: string,
    roomId : string,
    ws : WebSocket
}


interface RoomInterface {
    roomId : string,
    sockets : WebSocket[]
}

const rooms : RoomInterface[] =[]
const users : UserInterface[] = []


wss.on('connection', (ws,req)=>{
    const url = new URL(req.url!, "http://localhost");

    const authHeader = req.headers["authorization"];
    const boardId = url.searchParams.get("boardId");
    
    
    const token = authHeader?.split(' ')[1]
    const JWT_SECRET = process.env.JWT_SECRET
    
    
    if(!token || !JWT_SECRET) {
        ws.close();
        return;
    };

    try{
        const decoded:{
            userId:string,
            email:string,
            iat:number,
            exp:number
        } = jwt.verify(token, JWT_SECRET);

        users.forEach((user:UserInterface)=>{
            if(user.userId == decoded.userId){
                
            }
        })
    }
    catch(err){
        if(err instanceof Error){
            console.log(err.message)
        }
        console.log("error")
    }


    ws.on('message',(data)=>{
        const mssg = JSON.parse(data.toString());

        if(mssg.type == 'sync'){
            //broadcast to all the user of that BoardId
        }
    })

    ws.send('client connected to server')
})
