import { Graph, FloydWarshallState } from '../types';


export const initializeFloydWarshall = (graph: Graph, startNode: number | null, isDirected: boolean): FloydWarshallState => {
    const n = graph.nodes.length;

    
    const dist: number[][] = Array(n).fill(0).map(() => Array(n).fill(Number.MAX_SAFE_INTEGER));

    
    const next: number[][] = Array(n).fill(0).map(() => Array(n).fill(-1));

    
    graph.edges.forEach(edge => {
        const weight = edge.weight || 1;
        dist[edge.source][edge.target] = weight;
        next[edge.source][edge.target] = edge.target;

        
        if (!isDirected) {
            dist[edge.target][edge.source] = weight;
            next[edge.target][edge.source] = edge.source;
        }
    });

    
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


export const stepFloydWarshall = (state: FloydWarshallState): FloydWarshallState => {
    let { dist, next, currentK, currentI, currentJ, nodeCount, history, currentStep } = state;

    
    dist = dist.map(row => [...row]);
    next = next.map(row => [...row]);

    
    if (currentK === -1) {
        currentK = 0;
        currentI = 0;
        currentJ = 0;
    } else {
        
        currentJ++;

        
        if (currentJ >= nodeCount) {
            currentJ = 0;
            currentI++;

            
            if (currentI >= nodeCount) {
                currentI = 0;
                currentK++;

                
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
                        lastUpdated: false,
                        history: [...history, {
                            dist: dist.map(row => [...row]),
                            next: next.map(row => [...row]),
                            currentK,
                            currentI,
                            currentJ,
                            lastUpdated: false
                        }]
                    };
                }
            }
        }
    }

    
    let lastUpdated = false;

    if (dist[currentI][currentK] !== Number.MAX_SAFE_INTEGER &&
        dist[currentK][currentJ] !== Number.MAX_SAFE_INTEGER) {

        const newDist = dist[currentI][currentK] + dist[currentK][currentJ];

        
        if (newDist < dist[currentI][currentJ]) {
            dist[currentI][currentJ] = newDist;
            next[currentI][currentJ] = next[currentI][currentK];
            lastUpdated = true;
        }
    }

    const newHistoryEntry = {
        dist: dist.map(row => [...row]),
        next: next.map(row => [...row]),
        currentK,
        currentI,
        currentJ,
        lastUpdated
    };

    return {
        ...state,
        dist,
        next,
        currentK,
        currentI,
        currentJ,
        lastUpdated,
        currentStep: currentStep + 1,
        history: [...history, newHistoryEntry]
    };
};


export const resetFloydWarshall = (graph: Graph, startNode: number | null, isDirected: boolean): FloydWarshallState => {
    return initializeFloydWarshall(graph, startNode, isDirected);
};


export const getFloydWarshallPath = (state: FloydWarshallState, startNode: number, endNode: number): number[] => {
    if (state.next[startNode][endNode] === -1) return []; 

    const path: number[] = [startNode];
    let current = startNode;

    while (current !== endNode) {
        current = state.next[current][endNode];
        if (current === -1) return []; 
        path.push(current);
    }

    return path;
};



export const formatPathWithWeights = (path: number[], graph: Graph, isDirected: boolean): string => {
    if (path.length <= 1) return "No path exists";

    let result = "";
    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];

        
        
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