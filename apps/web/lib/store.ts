import { create } from 'zustand';
import {
    ActionState,
    ElementType,
    CanvasElement,
    BoardState,
    AppState,
    BoundingBoxElement,
    PointToPointElement
} from "@repo/types";

interface BoardStore {
    
    id: string | null;
    title: string;
    elements: CanvasElement[];
    appState: AppState;

    
    activeTool: ElementType;
    actionState: ActionState;
    selectedElementId: string | null;

    
    initializeBoard: (initialData: BoardState) => void;
    setTool: (tool: ElementType) => void;
    setActionState: (state: ActionState) => void;
    setSelectedElement: (id: string | null) => void;

    addElement: (element: CanvasElement) => void;
    
    updateElement: (id: string, updates: Partial<BoundingBoxElement & PointToPointElement>) => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
    
    id: null,
    title: "",
    elements: [],
    appState: { zoom: 1, scrollX: 0, scrollY: 0, backgroundColor: "#ffffff" },

    activeTool: 'rectangle',
    actionState: 'idle',
    selectedElementId: null,

    
    initializeBoard: (initialData) => set({
        id: initialData.id,
        title: initialData.title,
        elements: initialData.elements,
        appState: initialData.appState
    }),

    setTool: (tool) => set({ activeTool: tool }),
    setActionState: (state) => set({ actionState: state }),
    setSelectedElement: (id) => set({ selectedElementId: id }),

    addElement: (element) =>
        set((state) => ({ elements: [...state.elements, element] })),

    updateElement: (id, updates) =>
        set((state) => ({
            elements: state.elements.map((el) =>
                el.id === id ? { ...el, ...updates } as CanvasElement : el
            ),
        })),
}));