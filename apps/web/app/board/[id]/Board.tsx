import React, { useEffect, useRef } from 'react'
import {BoardState} from "@repo/types"
import { useBoardStore } from '@/lib/store';

const Board = ({initialBoardState }: {initialBoardState:BoardState}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // Subscribe to Zustand store changes directly to draw to canvas
    // WITHOUT triggering React re-renders!
    const unsubscribe = useBoardStore.subscribe((state) => {
      if (!canvasRef.current || !state.board) return;
      const ctx = canvasRef.current.getContext("2d");
      // ... roughjs drawing logic here ...
    });

    return () => {
      unsubscribe();
    }
  }, []);

  return (
    <div>this is the board : {JSON.stringify(initialBoardState)}</div>
  )
}

export default Board;