import { Node, Edge, Graph, DFSState } from '../types';
import { buildAdjacencyList } from '../utils';


export const initializeDFS = (graph: Graph, startNode: number, isDirected: boolean): DFSState => {
    const adjList = buildAdjacencyList(graph.nodes, graph.edges, isDirected);

    
    const dfsState: DFSState = {
        stack: [startNode],
        visited: new Set<number>(),
        toVisit: new Set<number>([startNode]),
        history: [],
        currentStep: 0,
        isRunning: false,
        targetFound: false,
        pathFound: false,
        adjList
    };

    
    dfsState.history.push({
        stack: [...dfsState.stack],
        visited: new Set(dfsState.visited),
        toVisit: new Set(dfsState.toVisit)
    });

    return dfsState;
};


export const stepDFS = (dfsState: DFSState, endNode: number | null): DFSState => {
    const { stack, visited, toVisit, adjList } = dfsState;

    
    if (stack.length === 0) {
        return { ...dfsState, isRunning: false, pathFound: false };
    }

    
    const current = stack.pop()!;

    
    if (endNode !== null && current === endNode) {
        const newVisited = new Set([...visited, current]);
        const newToVisit = new Set(toVisit);
        newToVisit.delete(current);

        return {
            ...dfsState,
            stack: [...stack],
            visited: newVisited,
            toVisit: newToVisit,
            isRunning: false,
            targetFound: true,
            pathFound: true,
            currentStep: dfsState.currentStep + 1,
            history: [
                ...dfsState.history,
                {
                    stack: [...stack],
                    visited: new Set(newVisited),
                    toVisit: new Set(newToVisit)
                }
            ]
        };
    }

    
    const newVisited = new Set([...visited, current]);
    const newToVisit = new Set(toVisit);
    newToVisit.delete(current);

    
    const neighbors = adjList[current];
    const newStack = [...stack];

    
    
    for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i];
        if (!newVisited.has(neighbor) && !newToVisit.has(neighbor)) {
            newStack.push(neighbor);
            newToVisit.add(neighbor);

            
            if (endNode !== null && neighbor === endNode) {
                
                dfsState.targetFound = true;
            }
        }
    }

    
    const newState = {
        ...dfsState,
        stack: newStack,
        visited: newVisited,
        toVisit: newToVisit,
        currentStep: dfsState.currentStep + 1,
        history: [
            ...dfsState.history,
            {
                stack: [...newStack],
                visited: new Set(newVisited),
                toVisit: new Set(newToVisit)
            }
        ]
    };

    return newState;
};


export const resetDFS = (graph: Graph, startNode: number, isDirected: boolean): DFSState => {
    return initializeDFS(graph, startNode, isDirected);
};