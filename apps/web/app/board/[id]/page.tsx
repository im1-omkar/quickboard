import { BoardState } from "@repo/types";
import Board from "./Board";

export default async function Page({
    params
}:{
    params:{id:number}
}) {

    //fetch the given board's JSON getBoard(id) -- "api/boards/:boardId"
    const initialBoard:BoardState = {
        "id": "board_123",
        "title": "Architecture Diagram",
        "elements": [
            
        ],
        "appState":{
            "zoom": 1.0,
            "scrollX": 0,
            "scrollY": 0,
            "backgroundColor": "#080807"
        }
    }

    return  <Board initialBoardState={initialBoard}></Board>

     
}
