"use client"; 

import React, { useEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import {  CanvasElement } from "@repo/types";
import { BoardStore, useBoardStore } from '@/lib/store';
import {
  Square,
  Circle,
  Minus,
  MoveUpRight,
  MousePointer2,
  CloudSync
} from "lucide-react";
import axios from 'axios';
import { useParams } from 'next/navigation';
import { handleSync } from '@/lib/api';

const isPointInElement = (x: number, y: number, element: CanvasElement) => {
  if (element.type === 'rectangle' || element.type === 'circle') {
    const minX = Math.min(element.x, element.x + element.width);
    const maxX = Math.max(element.x, element.x + element.width);
    const minY = Math.min(element.y, element.y + element.height);
    const maxY = Math.max(element.y, element.y + element.height);
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  }

  if (element.type === 'line' || element.type === 'arrow') {
    const minX = Math.min(element.x, element.endX);
    const maxX = Math.max(element.x, element.endX);
    const minY = Math.min(element.y, element.endY);
    const maxY = Math.max(element.y, element.endY);
    return x >= minX - 5 && x <= maxX + 5 && y >= minY - 5 && y <= maxY + 5;
  }

  return false;
};

const isPointOnHandle = (x: number, y: number, element: CanvasElement) => {
  if (element.type === 'rectangle' || element.type === 'circle') {
    const handleX = element.x + element.width;
    const handleY = element.y + element.height;

    return Math.abs(x - handleX) <= 10 && Math.abs(y - handleY) <= 10;
  }
  return false;
};

const Board = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isResizing = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentElementId = useRef<string | null>(null);

  const selectedIdRef = useRef<string | null>(null);
  const params = useParams();
  const initializeBoard = useBoardStore((state) => state.initializeBoard)


  useEffect(() => {
    const fetchIntiialBoard = async () => {
      const response = await axios.get(`http://localhost:3000/api/boards/${params.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      const initialBoard = response.data;


      initializeBoard({
        id: initialBoard.id,
        title: initialBoard.title,
        elements: initialBoard.elements,
        appState: {
          zoom: initialBoard.zoom,
          scrollX: initialBoard.scrollX,
          scrollY: initialBoard.scrollY,
          backgroundColor: initialBoard.backgroundColor
        }
      })

    }

    fetchIntiialBoard()
  }, []);

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

  const draw = (state: BoardStore, currentSelectedId: string | null) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rc = rough.canvas(canvas);

    ctx.fillStyle = state.appState?.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    state.elements.forEach((element) => {
      const roughOptions = {
        stroke: element.color || "black",
        strokeWidth: element.strokeWidth || 2,
        roughness: 1.5,
        bowing: 1,
        seed: Number(element.id.slice(-6)) || 1,
      };

      if (element.type === 'rectangle') {
        rc.rectangle(element.x, element.y, element.width, element.height, roughOptions);
      } else if (element.type === 'circle') {
        rc.ellipse(
          element.x + element.width / 2,
          element.y + element.height / 2,
          Math.abs(element.width),
          Math.abs(element.height),
          roughOptions
        );
      } else if (element.type === "line") {
        rc.line(element.x, element.y, element.endX, element.endY, roughOptions);
      } else if (element.type === "arrow") {
        const headLength = 12;
        const dx = element.endX - element.x;
        const dy = element.endY - element.y;
        const angle = Math.atan2(dy, dx);

        rc.line(element.x, element.y, element.endX, element.endY, roughOptions);
        rc.line(
          element.endX,
          element.endY,
          element.endX - headLength * Math.cos(angle - Math.PI / 6),
          element.endY - headLength * Math.sin(angle - Math.PI / 6),
          roughOptions
        );
        rc.line(
          element.endX,
          element.endY,
          element.endX - headLength * Math.cos(angle + Math.PI / 6),
          element.endY - headLength * Math.sin(angle + Math.PI / 6),
          roughOptions
        );
      }

      if (element.id === currentSelectedId) {
        ctx.strokeStyle = "#0b99ff";
        ctx.lineWidth = 1;

        if (element.type === 'rectangle' || element.type === 'circle') {
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(element.x - 4, element.y - 4, element.width + 8, element.height + 8);
          ctx.setLineDash([]);

          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#0b99ff";
          ctx.lineWidth = 2;
          const handleSize = 8;
          ctx.fillRect(element.x + element.width - handleSize / 2, element.y + element.height - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(element.x + element.width - handleSize / 2, element.y + element.height - handleSize / 2, handleSize, handleSize);
        }
      }
    });
  };
  
  


  useEffect(() => {
    selectedIdRef.current = selectedId;
    draw(useBoardStore.getState(), selectedId);
  }, [selectedId]);

  useEffect(() => {
    const unsubscribe = useBoardStore.subscribe((state) => {
      draw(state, selectedIdRef.current);
    });

    return () => unsubscribe();
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const currentX = e.nativeEvent.offsetX;
    const currentY = e.nativeEvent.offsetY;

    if (useBoardStore.getState().activeTool === 'select') {
      const elements = useBoardStore.getState().elements;
      let clickedOnElement = false;

      if (selectedId) {
        const selectedEl = elements.find(el => el.id === selectedId);
        if (selectedEl && isPointOnHandle(currentX, currentY, selectedEl)) {
          isResizing.current = true;
          currentElementId.current = selectedId;
          startPos.current = { x: currentX, y: currentY };
          return;
        }
      }

      for (let i = elements.length - 1; i >= 0; i--) {
        if (isPointInElement(currentX, currentY, elements[i])) {
          setSelectedId(elements[i].id);
          clickedOnElement = true;
          break;
        }
      }

      if (!clickedOnElement) setSelectedId(null);
      return;
    }

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
        color: store.color,
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
        color: store.color,
        strokeWidth: 2
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const currentX = e.nativeEvent.offsetX;
    const currentY = e.nativeEvent.offsetY;
    const canvas = canvasRef.current;
    const store = useBoardStore.getState();

    if (canvas) {
      if (store.activeTool === 'select') {
        const selectedEl = selectedId ? store.elements.find(el => el.id === selectedId) : null;

        if (isResizing.current) {
          canvas.style.cursor = 'nwse-resize';
        } else if (selectedEl && isPointOnHandle(currentX, currentY, selectedEl)) {
          canvas.style.cursor = 'nwse-resize';
        } else {
          let isHoveringShape = false;
          for (let i = store.elements.length - 1; i >= 0; i--) {
            if (isPointInElement(currentX, currentY, store.elements[i])) {
              isHoveringShape = true;
              break;
            }
          }
          canvas.style.cursor = isHoveringShape ? 'move' : 'default';
        }
      } else {
        canvas.style.cursor = 'crosshair';
      }
    }

    if (isResizing.current && currentElementId.current && store.activeTool === 'select') {
      const element = store.elements.find(el => el.id === currentElementId.current);
      if (element && (element.type === 'rectangle' || element.type === 'circle')) {
        store.updateElement(currentElementId.current, {
          width: currentX - element.x,
          height: currentY - element.y
        });
      }
      return;
    }

    if (!isDrawing.current || !currentElementId.current) return;

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
    isResizing.current = false;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-screen h-screen touch-none border"
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
        <button onClick={() => { useBoardStore.getState().setTool('select') }} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-zinc-800 transition">
          <MousePointer2 size={20} className="text-white" />
        </button>
      </div>

      <div className="absolute top-4 left-24 z-10 flex items-center gap-2 rounded-2xl bg-zinc-900 p-2 shadow-xl border border-zinc-700">
        <button onClick={() => { useBoardStore.getState().setColor('#d9d9d9') }} className="h-8 w-8 rounded-full bg-white border border-zinc-500 hover:scale-110 transition" title="White" />
        <button onClick={() => { useBoardStore.getState().setColor('#e83a3a') }} className="h-8 w-8 rounded-full bg-red-500 hover:scale-110 transition" title="Red" />
        <button onClick={() => { useBoardStore.getState().setColor('#4655b8') }} className="h-8 w-8 rounded-full bg-blue-500 hover:scale-110 transition" title="Blue" />
        <button onClick={() => { useBoardStore.getState().setColor('#48bf3b') }} className="h-8 w-8 rounded-full bg-green-500 hover:scale-110 transition" title="Green" />
        <button onClick={() => { useBoardStore.getState().setColor('#c9b726') }} className="h-8 w-8 rounded-full bg-yellow-400 hover:scale-110 transition" title="Yellow" />
        <button onClick={() => { useBoardStore.getState().setColor('#8a3b83') }} className="h-8 w-8 rounded-full bg-violet-500 hover:scale-110 transition" title="Purple" />
      </div>
      <div onClick={handleSync} className="absolute top-4 right-24 z-10 flex items-center gap-2 rounded-2xl bg-zinc-100 p-2 shadow-xl border border-zinc-700">
        <CloudSync/>syncmore
      </div>
    </div>
  )
}

export default Board;