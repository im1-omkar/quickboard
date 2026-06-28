import { create } from 'zustand';


export type ElementType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'select';


export type ActionState = 'idle' | 'drawing' | 'moving';



export interface BaseElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    color: string;
    strokeWidth: number;
}


export interface BoundingBoxElement extends BaseElement {
    type: 'rectangle' | 'circle';
    width: number;
    height: number;
}

export interface PointToPointElement extends BaseElement {
    type: 'line' | 'arrow';
    endX: number;
    endY: number;
}

export interface TextElement extends BaseElement {
    type: 'text';
    text: string;
    fontSize: number;
}


export type CanvasElement = BoundingBoxElement | PointToPointElement | TextElement;


export interface AppState {
    zoom: number;            
    scrollX: number;         
    scrollY: number;         
    backgroundColor: string; 
}


export interface BoardState {
    id:string,
    title:string,
    elements: CanvasElement[];
    appState: AppState;
}
