
export type GraphType = 'complete' | 'dense' | 'sparse' | 'tree' | 'connected' | 'disconnected' | 'cyclic' | 'acyclic' | 'grid';
export type AlgorithmType = 'none' | 'bfs' | 'dfs' | 'dijkstra' | 'floydWarshall' | 'kruskal' | 'prim';

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
    priorityQueue: [number, number][]; 
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
    processedNode?: number; 
    newlyQueuedNodes?: number[]; 
    nodeToDistanceMap: { [key: number]: number }; 
};

export type FloydWarshallState = {
    dist: number[][];           
    next: number[][];           
    currentK: number;           
    currentI: number;           
    currentJ: number;           
    nodeCount: number;          
    history: {                  
        dist: number[][],
        next: number[][],
        currentK: number,
        currentI: number,
        currentJ: number,
        lastUpdated?: boolean   
    }[];
    currentStep: number;        
    isRunning: boolean;         
    completed: boolean;         
    pathFound: boolean;         
    startNode: number | null;   
    lastUpdated?: boolean;      
};

export type KruskalState = {
    sortedEdges: Edge[];          
    currentEdgeIndex: number;     
    mstEdges: Edge[];             
    disjointSets: number[];       
    disjointSetRanks: number[];   
    history: {
        currentEdgeIndex: number,
        mstEdges: Edge[],
        disjointSets: number[]
    }[];
    currentStep: number;
    isRunning: boolean;
    completed: boolean;
};


export type PrimState = {
    visited: Set<number>;       
    availableEdges: Edge[];     
    mstEdges: Edge[];           
    history: {                  
        visited: Set<number>,
        availableEdges: Edge[],
        mstEdges: Edge[]
    }[];
    currentStep: number;        
    isRunning: boolean;         
    completed: boolean;         
    startNode: number;          
};