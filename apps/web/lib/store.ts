import { ActionState, CanvasElement, ElementType } from "@repo/types";
import { create } from "zustand";

interface BoardState {
    
    elements: CanvasElement[];
    activeTool: ElementType;
    actionState: ActionState;
    selectedElementId: string | null;

    
    setTool: (tool: ElementType) => void;
    setActionState: (state: ActionState) => void;
    setSelectedElement: (id: string | null) => void;

    addElement: (element: CanvasElement) => void;
    updateElement: <T extends CanvasElement>(
        id: string,
        updates: Partial<T>
    ) => void; }

export const useBoardStore = create<BoardState>((set) => ({
    
    elements: [],
    activeTool: 'rectangle', 
    actionState: 'idle',
    selectedElementId: null,

    
    setTool: (tool) => set({ activeTool: tool }),
    
    setActionState: (state) => set({ actionState: state }),
    
    setSelectedElement: (id) => set({ selectedElementId: id }),

    addElement: (element) =>
        set((state) => ({
            elements: [...state.elements, element]
        })),

    
    updateElement: (id, updates) =>
        set((state) => ({
            elements: state.elements.map((el) =>
                el.id === id
                    ? { ...el, ...updates } as CanvasElement
                    : el
            ),
        })),
}));