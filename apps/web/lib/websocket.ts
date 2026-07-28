import { useBoardStore } from "./store"
import type { BoardState } from "@repo/types"

let socket : null | WebSocket= null

let lastSendTime : number = 0;
const THROTTLE_MS = 50;

interface Message {
    type:string,
    currentState:BoardState
}

export const makeWebSocketConnection = async()=>{

    socket = new WebSocket("ws://localhost:8080?boardId"+"="+useBoardStore.getState().id, localStorage.getItem("token")!)

    socket.addEventListener('message',(event)=>{
        const message:Message = JSON.parse(event.data);

        if(message.type == "sync"){
            useBoardStore.getState().initializeBoard(message.currentState)
        }

    })
}

export const sendCurrentState = async()=>{

    const now = Date.now()
    if(now - lastSendTime < THROTTLE_MS) return;
    
    if(useBoardStore.getState().id == null){
        return;
    }

    lastSendTime = now;

    const currentBoardState: BoardState = {
        id:  useBoardStore.getState().id || " " ,
        title: useBoardStore.getState().title,
        elements: useBoardStore.getState().elements,
        appState: useBoardStore.getState().appState
    }

    if(!socket)return;
    socket.send(JSON.stringify({
        "type":"sync",
        "currentState":currentBoardState
    }))

}