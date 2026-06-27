'use client'

import React, { useEffect, useRef } from 'react';
import {
  BoardState,
  CanvasElement,
  BoundingBoxElement,
  PointToPointElement
} from "@repo/types";
import { useBoardStore } from '@/lib/store';

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

  
  useEffect(() => {
    const unsubscribe = useBoardStore.subscribe((state) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      
      ctx.fillStyle = state.appState.backgroundColor || "#000000";
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
        color: "#000000", 
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
        color: "#000000", 
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
      store.updateElement<BoundingBoxElement>(currentElementId.current, {
        width: currentX - startPos.current.x,
        height: currentY - startPos.current.y
      });
    } else if (store.activeTool === 'line' || store.activeTool === 'arrow') {
      store.updateElement<PointToPointElement>(currentElementId.current, {
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
    <canvas
      ref={canvasRef}
      className="w-screen h-screen touch-none border border-gray-200"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  )
}

export default Board;