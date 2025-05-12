import { Node, Edge, Graph, BFSState } from '../types';
import { buildAdjacencyList } from '../utils';


export const initializeBFS = (graph: Graph, startNode: number, isDirected: boolean): BFSState => {
    const adjList = buildAdjacencyList(graph.nodes, graph.edges, isDirected);

    
    const bfsState: BFSState = {
        queue: [startNode],
        visited: new Set<number>(),
        toVisit: new Set<number>([startNode]),
        history: [],
        currentStep: 0,
        isRunning: false,
        targetFound: false,
        pathFound: false,
        adjList
    };

    
    bfsState.history.push({
        queue: [...bfsState.queue],
        visited: new Set(bfsState.visited),
        toVisit: new Set(bfsState.toVisit)
    });

    return bfsState;
};


export const stepBFS = (bfsState: BFSState, endNode: number | null): BFSState => {
    const { queue, visited, toVisit, adjList } = bfsState;

    
    if (queue.length === 0) {
        return { ...bfsState, isRunning: false, pathFound: false };
    }

    
    const current = queue.shift()!;

    
    if (endNode !== null && current === endNode) {
        return {
            ...bfsState,
            queue: [...queue],
            visited: new Set([...visited, current]),
            toVisit: new Set(toVisit),
            isRunning: false,
            targetFound: true,
            pathFound: true,
            currentStep: bfsState.currentStep + 1
        };
    }

    
    visited.add(current);
    toVisit.delete(current);

    
    const neighbors = adjList[current];

    
    for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && !toVisit.has(neighbor)) {
            queue.push(neighbor);
            toVisit.add(neighbor);

            
            if (endNode !== null && neighbor === endNode) {
                bfsState.targetFound = true;
            }
        }
    }

    
    const newState = {
        ...bfsState,
        queue: [...queue],
        visited: new Set(visited),
        toVisit: new Set(toVisit),
        currentStep: bfsState.currentStep + 1
    };

    newState.history.push({
        queue: [...newState.queue],
        visited: new Set(newState.visited),
        toVisit: new Set(newState.toVisit)
    });

    return newState;
};


export const resetBFS = (graph: Graph, startNode: number, isDirected: boolean): BFSState => {
    return initializeBFS(graph, startNode, isDirected);
};