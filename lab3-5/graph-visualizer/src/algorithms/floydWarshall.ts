import { Graph, FloydWarshallState } from '../types';

// Initialize the Floyd-Warshall algorithm
export const initializeFloydWarshall = (graph: Graph, startNode: number | null, isDirected: boolean): FloydWarshallState => {
    const n = graph.nodes.length;

    // Initialize distance matrix with infinity
    const dist: number[][] = Array(n).fill(0).map(() => Array(n).fill(Number.MAX_SAFE_INTEGER));

    // Initialize next node matrix for path reconstruction
    const next: number[][] = Array(n).fill(0).map(() => Array(n).fill(-1));

    // Initialize with direct edges
    graph.edges.forEach(edge => {
        const weight = edge.weight || 1;
        dist[edge.source][edge.target] = weight;
        next[edge.source][edge.target] = edge.target;

        // For undirected graphs, add reverse edges
        if (!isDirected) {
            dist[edge.target][edge.source] = weight;
            next[edge.target][edge.source] = edge.source;
        }
    });

    // Set distance from a node to itself as 0
    for (let i = 0; i < n; i++) {
        dist[i][i] = 0;
        next[i][i] = i;
    }

    return {
        dist: dist,
        next: next,
        currentK: -1,
        currentI: -1,
        currentJ: -1,
        nodeCount: n,
        history: [{
            dist: dist.map(row => [...row]),
            next: next.map(row => [...row]),
            currentK: -1,
            currentI: -1,
            currentJ: -1
        }],
        currentStep: 0,
        isRunning: false,
        completed: false,
        pathFound: false,
        startNode
    };
};

// Execute a single step of Floyd-Warshall
export const stepFloydWarshall = (state: FloydWarshallState): FloydWarshallState => {
    let { dist, next, currentK, currentI, currentJ, nodeCount, history, currentStep } = state;

    // Deep clone the matrices to avoid reference issues
    dist = dist.map(row => [...row]);
    next = next.map(row => [...row]);

    // First step, set k = 0
    if (currentK === -1) {
        currentK = 0;
        currentI = 0;
        currentJ = 0;
    } else {
        // Move to next cell
        currentJ++;

        // If we've completed all j's for this i, move to next i
        if (currentJ >= nodeCount) {
            currentJ = 0;
            currentI++;

            // If we've completed all i's for this k, move to next k
            if (currentI >= nodeCount) {
                currentI = 0;
                currentK++;

                // If we've completed all k's, we're done
                if (currentK >= nodeCount) {
                    return {
                        ...state,
                        dist,
                        next,
                        currentK,
                        currentI,
                        currentJ,
                        currentStep: currentStep + 1,
                        isRunning: false,
                        completed: true,
                        history: [...history, {
                            dist: dist.map(row => [...row]),
                            next: next.map(row => [...row]),
                            currentK,
                            currentI,
                            currentJ
                        }]
                    };
                }
            }
        }
    }

    // Apply the Floyd-Warshall relaxation step
    if (dist[currentI][currentK] !== Number.MAX_SAFE_INTEGER &&
        dist[currentK][currentJ] !== Number.MAX_SAFE_INTEGER) {

        const newDist = dist[currentI][currentK] + dist[currentK][currentJ];

        if (newDist < dist[currentI][currentJ]) {
            dist[currentI][currentJ] = newDist;
            next[currentI][currentJ] = next[currentI][currentK];
        }
    }

    const newHistoryEntry = {
        dist: dist.map(row => [...row]),
        next: next.map(row => [...row]),
        currentK,
        currentI,
        currentJ
    };

    return {
        ...state,
        dist,
        next,
        currentK,
        currentI,
        currentJ,
        currentStep: currentStep + 1,
        history: [...history, newHistoryEntry]
    };
};

// Reset the Floyd-Warshall algorithm
export const resetFloydWarshall = (graph: Graph, startNode: number | null, isDirected: boolean): FloydWarshallState => {
    return initializeFloydWarshall(graph, startNode, isDirected);
};

// Reconstruct shortest path from i to j using the next matrix
export const getFloydWarshallPath = (state: FloydWarshallState, startNode: number, endNode: number): number[] => {
    if (state.next[startNode][endNode] === -1) return []; // No path exists

    const path: number[] = [startNode];
    let current = startNode;

    while (current !== endNode) {
        current = state.next[current][endNode];
        if (current === -1) return []; // No path exists
        path.push(current);
    }

    return path;
};

// Format path with edge weights for display
// Update the function signature to include isDirected parameter
export const formatPathWithWeights = (path: number[], graph: Graph, isDirected: boolean): string => {
    if (path.length <= 1) return "No path exists";

    let result = "";
    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];

        // Find the edge weight
        // Now use isDirected as a parameter instead of graph.isDirected
        const edge = graph.edges.find(e =>
            (e.source === from && e.target === to) ||
            (!isDirected && e.source === to && e.target === from)
        );

        const weight = edge ? edge.weight || 1 : "?";

        result += `[${from}] -- ${weight} --> `;
    }

    result += `[${path[path.length - 1]}]`;
    return result;
};