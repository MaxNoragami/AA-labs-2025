import { Graph, Edge, KruskalState } from '../types';

// DisjointSet implementation for Kruskal's algorithm
class DisjointSet {
    parent: number[];
    rank: number[];

    constructor(n: number) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = Array(n).fill(1);
    }

    find(i: number): number {
        if (this.parent[i] !== i) {
            this.parent[i] = this.find(this.parent[i]);
        }
        return this.parent[i];
    }

    unite(x: number, y: number): void {
        const s1 = this.find(x);
        const s2 = this.find(y);
        if (s1 !== s2) {
            if (this.rank[s1] < this.rank[s2]) {
                this.parent[s1] = s2;
            } else if (this.rank[s1] > this.rank[s2]) {
                this.parent[s2] = s1;
            } else {
                this.parent[s2] = s1;
                this.rank[s1]++;
            }
        }
    }
}

// Initialize Kruskal's algorithm
export const initializeKruskal = (graph: Graph): KruskalState => {
    // Sort edges by weight
    const sortedEdges = [...graph.edges].sort((a: Edge, b: Edge) => {
        const weightA = a.weight ?? 1; // Use nullish coalescing instead of ||
        const weightB = b.weight ?? 1;
        return weightA - weightB;
    });

    return {
        sortedEdges,
        currentEdgeIndex: -1, // Start at -1 since we'll increment on first step
        mstEdges: [],
        disjointSets: Array.from({ length: graph.nodes.length }, (_, i) => i),
        disjointSetRanks: Array(graph.nodes.length).fill(1),
        history: [],
        currentStep: 0,
        isRunning: false,
        completed: false
    };
};

// Execute a single step of Kruskal's algorithm
export const stepKruskal = (state: KruskalState): KruskalState => {
    const { sortedEdges, currentEdgeIndex, mstEdges, disjointSets } = state;

    // Create new instances of arrays to avoid mutation
    const newMstEdges = [...mstEdges];
    const newDisjointSets = [...disjointSets];

    // Initialize DisjointSet from current state
    const ds = new DisjointSet(disjointSets.length);
    ds.parent = [...newDisjointSets]; // Copy current parent state
    ds.rank = [...state.disjointSetRanks];

    // If all edges have been processed or MST is complete
    if (currentEdgeIndex >= sortedEdges.length - 1 || newMstEdges.length >= disjointSets.length - 1) {
        return {
            ...state,
            currentEdgeIndex: currentEdgeIndex + 1,
            isRunning: false,
            completed: true,
            history: [
                ...state.history,
                {
                    currentEdgeIndex: currentEdgeIndex + 1,
                    mstEdges: newMstEdges,
                    disjointSets: newDisjointSets
                    
                }
            ],
            currentStep: state.currentStep + 1
        };
    }

    // Move to next edge
    const nextEdgeIndex = currentEdgeIndex + 1;
    const currentEdge = sortedEdges[nextEdgeIndex];

    // Check if adding this edge creates a cycle
    const sourceSet = ds.find(currentEdge.source);
    const targetSet = ds.find(currentEdge.target);

    // If no cycle, add to MST
    if (sourceSet !== targetSet) {
        ds.unite(currentEdge.source, currentEdge.target);
        newMstEdges.push(currentEdge);
        

        // Update disjointSets to reflect new disjoint set state
        for (let i = 0; i < newDisjointSets.length; i++) {
            newDisjointSets[i] = ds.find(i);
        }
    }

    const newDisjointSetRanks = [...ds.rank];
    

    return {
        ...state,
        currentEdgeIndex: nextEdgeIndex,
        mstEdges: newMstEdges,
        disjointSets: newDisjointSets,
        disjointSetRanks: newDisjointSetRanks,
        history: [
            ...state.history,
            {
                currentEdgeIndex: nextEdgeIndex,
                mstEdges: newMstEdges,
                disjointSets: newDisjointSets
            }
        ],
        currentStep: state.currentStep + 1
    };
};

// Reset Kruskal's algorithm
export const resetKruskal = (graph: Graph): KruskalState => {
    return initializeKruskal(graph);
};

// Find shortest path in MST between start and end nodes
export const getShortestPathInMST = (
    mstEdges: Edge[],
    startNode: number,
    endNode: number,
    nodeCount: number
): number[] => {
    // Build adjacency list from MST edges
    const adjList: number[][] = Array.from(
        { length: nodeCount },
        () => [] as number[]
    );

    mstEdges.forEach((edge: Edge) => {
        adjList[edge.source].push(edge.target);
        adjList[edge.target].push(edge.source);
    });

    // BFS to find shortest path
    const queue: number[] = [startNode];
    const visited = new Set<number>([startNode]);
    const parent = new Map<number, number>();

    while (queue.length > 0) {
        const node = queue.shift()!;

        if (node === endNode) {
            break;
        }

        const neighbors = adjList[node] || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                parent.set(neighbor, node);
                queue.push(neighbor);
            }
        }
    }

    // Reconstruct path
    const path: number[] = [];
    let current = endNode;

    if (!parent.has(endNode)) {
        return []; // No path exists
    }

    while (current !== startNode) {
        path.unshift(current);
        current = parent.get(current)!;
    }

    path.unshift(startNode);
    return path;
};