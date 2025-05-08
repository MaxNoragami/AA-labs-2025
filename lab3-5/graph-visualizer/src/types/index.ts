// Define all shared types for the application
export type GraphType = 'complete' | 'dense' | 'sparse' | 'tree' | 'connected' | 'disconnected' | 'cyclic' | 'acyclic' | 'grid';
// Update the AlgorithmType
export type AlgorithmType = 'none' | 'bfs' | 'dfs' | 'dijkstra';


export type Node = {
    id: number;
    x: number;
    y: number;
    label: string;
    component?: number;
    gridX?: number;
    gridY?: number;
    status?: 'unvisited' | 'queued' | 'visited';
    distance?: number; // Add this line to include the distance property
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

// DFS algorithm state
export type DFSState = {
    stack: number[];
    visited: Set<number>;
    toVisit: Set<number>;
    history: { stack: number[], visited: Set<number>, toVisit: Set<number> }[];
    currentStep: number;
    isRunning: boolean;
    targetFound: boolean;
    pathFound: boolean;
    adjList: number[][];
};

export type DijkstraState = {
    distances: number[];
    previous: (number | null)[];
    visited: Set<number>;
    toVisit: Set<number>;
    priorityQueue: [number, number][]; // [distance, nodeId]
    history: {
        distances: number[],
        previous: (number | null)[],
        visited: Set<number>,
        toVisit: Set<number>,
        priorityQueue: [number, number][]
    }[];
    currentStep: number;
    isRunning: boolean;
    targetFound: boolean;
    pathFound: boolean;
    adjList: [number, number][][];
};