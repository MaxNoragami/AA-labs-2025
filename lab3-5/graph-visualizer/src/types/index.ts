// Define all shared types for the application
export type GraphType = 'complete' | 'dense' | 'sparse' | 'tree' | 'connected' | 'disconnected' | 'cyclic' | 'acyclic' | 'grid';
// Update the AlgorithmType
export type AlgorithmType = 'none' | 'bfs' | 'dfs' | 'dijkstra' | 'floydWarshall';


export type Node = {
    id: number;
    x: number;
    y: number;
    label: string;
    component?: number;
    gridX?: number;
    gridY?: number;
    status?: 'unvisited' | 'queued' | 'visited';
    distance?: number;
    // Add a new property for Dijkstra-specific state
    dijkstraStatus?: 'unprocessed' | 'inQueue' | 'processed';
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
        priorityQueue: [number, number][],
        processedNode?: number,
        newlyQueuedNodes?: number[],
        nodeToDistanceMap?: { [key: number]: number }
    }[];
    currentStep: number;
    isRunning: boolean;
    targetFound: boolean;
    pathFound: boolean;
    adjList: [number, number][][];
    processedNode?: number; // Track the most recently processed node
    newlyQueuedNodes?: number[]; // Track nodes just added to queue
    nodeToDistanceMap: { [key: number]: number }; // Map of node IDs to their finalized distances
};

export type FloydWarshallState = {
    dist: number[][];           // Distance matrix
    next: number[][];           // Next node matrix for path reconstruction
    currentK: number;           // Current k in iteration
    currentI: number;           // Current i in iteration
    currentJ: number;           // Current j in iteration
    nodeCount: number;          // Number of nodes in the graph
    history: {                  // History of states for visualization
        dist: number[][],
        next: number[][],
        currentK: number,
        currentI: number,
        currentJ: number,
        lastUpdated?: boolean   // Flag indicating if this step updated a value
    }[];
    currentStep: number;        // Current step in the algorithm
    isRunning: boolean;         // Whether the algorithm is running
    completed: boolean;         // Whether the algorithm has completed
    pathFound: boolean;         // Whether a path was found
    startNode: number | null;   // The starting node for path visualization
    lastUpdated?: boolean;      // Flag indicating if the last step updated a value
};