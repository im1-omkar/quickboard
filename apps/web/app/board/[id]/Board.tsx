'use client'

import React, { useEffect, useRef } from 'react';
import {
  BoardState
} from "@repo/types";
import { BoardStore, useBoardStore } from '@/lib/store';
import {
  Square,
  Circle,
  Minus,
  MoveUpRight,
  Type,
} from "lucide-react";

const Board = ({ initialBoardState }: { initialBoardState: BoardState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentElementId = useRef<string | null>(null);

  
  useEffect(() => {
    useBoardStore.getState().initializeBoard(initialBoardState);
  }, [initialBoardState]);

  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    
    
    useBoardStore.setState({ elements: [...useBoardStore.getState().elements] });

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      useBoardStore.setState({ elements: [...useBoardStore.getState().elements] });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const draw = (state:BoardStore)=>{
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;


    ctx.fillStyle = state.appState.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    state.elements.forEach((element) => {
      ctx.strokeStyle = element.color || "white";
      ctx.lineWidth = element.strokeWidth || 2;

      if (element.type === 'rectangle') {
        ctx.strokeRect(element.x, element.y, element.width, element.height);
      }
      else if (element.type === 'circle') {
        ctx.beginPath();
        ctx.ellipse(
          element.x + element.width / 2,
          element.y + element.height / 2,
          Math.abs(element.width / 2),
          Math.abs(element.height / 2),
          0, 0, 2 * Math.PI
        );
        ctx.stroke();
      }
      else if (element.type === 'line' || element.type === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.endX, element.endY);
        ctx.stroke();
      }
    });
  }

  //draw the initial state on frist render --
  useEffect(()=>{
    draw(useBoardStore.getState());
  },[initialBoardState])

  //subscribing funciton :)
  useEffect(() => {
    const unsubscribe = useBoardStore.subscribe((state) => {
      draw(state);
    });

    return () => unsubscribe();
  }, []);

  

  

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const store = useBoardStore.getState();
    const id = Date.now().toString();

    isDrawing.current = true;

    
    const startX = e.nativeEvent.offsetX;
    const startY = e.nativeEvent.offsetY;

    startPos.current = { x: startX, y: startY };
    currentElementId.current = id;

    store.setActionState('drawing');

    if (store.activeTool === 'rectangle' || store.activeTool === 'circle') {
      store.addElement({
        id,
        type: store.activeTool,
        x: startX,
        y: startY,
        width: 0,
        height: 0,
        color: "#606060", 
        strokeWidth: 2
      });
    } else if (store.activeTool === 'line' || store.activeTool === 'arrow') {
      store.addElement({
        id,
        type: store.activeTool,
        x: startX,
        y: startY,
        endX: startX,
        endY: startY,
        color: "#606060", 
        strokeWidth: 2
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentElementId.current) return;

    const store = useBoardStore.getState();
    const currentX = e.nativeEvent.offsetX;
    const currentY = e.nativeEvent.offsetY;

    if (store.activeTool === 'rectangle' || store.activeTool === 'circle') {
      store.updateElement(currentElementId.current, {
        width: currentX - startPos.current.x,
        height: currentY - startPos.current.y
      });
    } else if (store.activeTool === 'line' || store.activeTool === 'arrow') {
      store.updateElement(currentElementId.current, {
        endX: currentX,
        endY: currentY
      });
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    currentElementId.current = null;
    useBoardStore.getState().setActionState('idle');
  };

  return (
    <div className="relative w-screen h-screen">
      <canvas
        ref={canvasRef}
        className="w-screen h-screen touch-none border border-gray-200"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 rounded-2xl bg-zinc-900 p-2 shadow-xl border border-zinc-700">
        <button onClick={() => { useBoardStore.getState().setTool('rectangle') }} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-zinc-800 transition">
          <Square size={20} className="text-white" />
        </button>

        <button onClick={() => { useBoardStore.getState().setTool('circle') }} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-zinc-800 transition">
          <Circle size={20} className="text-white" />
        </button>

        <button onClick={() => { useBoardStore.getState().setTool('line') }} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-zinc-800 transition">
          <Minus size={20} className="text-white" />
        </button>

        <button onClick={() => { useBoardStore.getState().setTool('arrow') }} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-zinc-800 transition">
          <MoveUpRight size={20} className="text-white" />
        </button>

        <button onClick={() => { useBoardStore.getState().setTool('text') }} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-zinc-800 transition">
          <Type size={20} className="text-white" />
        </button>
      </div>
      <div className="absolute top-4 left-24 z-10 flex items-center gap-2 rounded-2xl bg-zinc-900 p-2 shadow-xl border border-zinc-700">
        <button
          className="h-8 w-8 rounded-full bg-white border border-zinc-500 hover:scale-110 transition"
          title="White"
        />
        <button
          className="h-8 w-8 rounded-full bg-red-500 hover:scale-110 transition"
          title="Red"
        />
        <button
          className="h-8 w-8 rounded-full bg-blue-500 hover:scale-110 transition"
          title="Blue"
        />
        <button
          className="h-8 w-8 rounded-full bg-green-500 hover:scale-110 transition"
          title="Green"
        />
        <button
          className="h-8 w-8 rounded-full bg-yellow-400 hover:scale-110 transition"
          title="Yellow"
        />
        <button
          className="h-8 w-8 rounded-full bg-violet-500 hover:scale-110 transition"
          title="Purple"
        />
      </div>
    </div>
  )
}

export default Board;