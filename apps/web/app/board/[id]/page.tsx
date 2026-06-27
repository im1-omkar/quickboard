import { BoardState } from "@repo/types";
import Board from "./Board";

export default async function Page({
    params
}:{
    params:{id:number}
}) {
    const { id } = await params;

    

    //fetch the given board's JSON getBoard(id) -- "api/boards/:boardId"
    const initialBoard:BoardState = {
        "id": "board_123",
        "title": "Architecture Diagram",
        "elements": [
            { "id": "el_1", "type": "rectangle", "x": 100, "y": 100, "width": 50, "height": 50, "color": "#000", "strokeWidth": 1 }
        ],
        "appState":{
            "zoom": 1.0,
            "scrollX": 0,
            "scrollY": 0,
            "backgroundColor": "#ffffff"
        }
    }

    return  <Board initialBoardState={initialBoard}></Board>

     
}
