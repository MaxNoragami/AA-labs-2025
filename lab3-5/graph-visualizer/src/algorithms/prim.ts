import { Graph, Edge, PrimState } from '../types';


export const initializePrim = (graph: Graph, startNode: number, isDirected: boolean): PrimState => {
    const visited = new Set<number>([startNode]);
    const availableEdges: Edge[] = [];

    
    graph.edges.forEach(edge => {
        if (edge.source === startNode && !visited.has(edge.target)) {
            availableEdges.push(edge);
        } else if (!isDirected && edge.target === startNode && !visited.has(edge.source)) {
            
            availableEdges.push({
                source: edge.target,
                target: edge.source,
                weight: edge.weight
            });
        }
    });

    
    availableEdges.sort((a, b) => (a.weight || 1) - (b.weight || 1));

    return {
        visited,
        availableEdges,
        mstEdges: [],
        history: [{
            visited: new Set(visited),
            availableEdges: [...availableEdges],
            mstEdges: []
        }],
        currentStep: 0,
        isRunning: false,
        completed: false,
        startNode
    };
};


export const stepPrim = (state: PrimState, graph: Graph, isDirected: boolean): PrimState => {
    const { visited, availableEdges, mstEdges } = state;

    
    if (availableEdges.length === 0 || visited.size === graph.nodes.length) {
        return {
            ...state,
            isRunning: false,
            completed: true,
            history: [
                ...state.history,
                {
                    visited: new Set(visited),
                    availableEdges: [...availableEdges],
                    mstEdges: [...mstEdges]
                }
            ],
            currentStep: state.currentStep + 1
        };
    }

    
    const minEdge = availableEdges.shift()!;

    
    if (visited.has(minEdge.target)) {
        return {
            ...state,
            availableEdges,
            history: [
                ...state.history,
                {
                    visited: new Set(visited),
                    availableEdges: [...availableEdges],
                    mstEdges: [...mstEdges]
                }
            ],
            currentStep: state.currentStep + 1
        };
    }

    
    visited.add(minEdge.target);

    
    mstEdges.push(minEdge);

    
    graph.edges.forEach(edge => {
        if (edge.source === minEdge.target && !visited.has(edge.target)) {
            availableEdges.push(edge);
        } else if (!isDirected && edge.target === minEdge.target && !visited.has(edge.source)) {
            
            availableEdges.push({
                source: edge.target,
                target: edge.source,
                weight: edge.weight
            });
        }
    });

    
    availableEdges.sort((a, b) => (a.weight || 1) - (b.weight || 1));

    
    return {
        ...state,
        visited,
        availableEdges,
        mstEdges,
        history: [
            ...state.history,
            {
                visited: new Set(visited),
                availableEdges: [...availableEdges],
                mstEdges: [...mstEdges]
            }
        ],
        currentStep: state.currentStep + 1
    };
};


export const resetPrim = (graph: Graph, startNode: number, isDirected: boolean): PrimState => {
    return initializePrim(graph, startNode, isDirected);
};



export const getShortestPathInPrimMST = (
    mstEdges: Edge[],
    startNode: number,
    endNode: number,
    nodeCount: number
): number[] => {
    
    const adjList: number[][] = Array.from(
        { length: nodeCount },
        () => [] as number[]
    );

    mstEdges.forEach((edge: Edge) => {
        adjList[edge.source].push(edge.target);
        adjList[edge.target].push(edge.source);
    });

    
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

    
    const path: number[] = [];
    let current = endNode;

    if (!parent.has(endNode)) {
        return []; 
    }

    while (current !== startNode) {
        path.unshift(current);
        current = parent.get(current)!;
    }

    path.unshift(startNode);
    return path;
};