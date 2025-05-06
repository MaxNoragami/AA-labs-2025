// Define all shared types for the application
export type GraphType = 'complete' | 'dense' | 'sparse' | 'tree' | 'connected' | 'disconnected' | 'cyclic' | 'acyclic' | 'grid';
export type AlgorithmType = 'none' | 'bfs';

export type Node = {
    id: number;
    x: number;
    y: number;
    label: string;
    component?: number;
    gridX?: number;
    gridY?: number;
    status?: 'unvisited' | 'queued' | 'visited';
};

export type Edge = {
    source: number;
    target: number;
    weight?: number
};

export type Graph = {
    nodes: Node[];
    edges: Edge[]
};

// BFS algorithm state
export type BFSState = {
    queue: number[];
    visited: Set<number>;
    toVisit: Set<number>;
    history: { queue: number[], visited: Set<number>, toVisit: Set<number> }[];
    currentStep: number;
    isRunning: boolean;
    targetFound: boolean;
    pathFound: boolean;
    adjList: number[][];
};