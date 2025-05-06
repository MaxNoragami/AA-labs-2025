import { Node, Edge, Graph, DFSState } from '../types';
import { buildAdjacencyList } from '../utils';

// DFS implementation
export const initializeDFS = (graph: Graph, startNode: number, isDirected: boolean): DFSState => {
    const adjList = buildAdjacencyList(graph.nodes, graph.edges, isDirected);

    // Initialize DFS state
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

    // Save initial state to history
    dfsState.history.push({
        stack: [...dfsState.stack],
        visited: new Set(dfsState.visited),
        toVisit: new Set(dfsState.toVisit)
    });

    return dfsState;
};

// Execute a single step of DFS
export const stepDFS = (dfsState: DFSState, endNode: number | null): DFSState => {
    const { stack, visited, toVisit, adjList } = dfsState;

    // If stack is empty, there's nothing more to do
    if (stack.length === 0) {
        return { ...dfsState, isRunning: false, pathFound: false };
    }

    // Pop the top node from the stack
    const current = stack.pop()!;

    // Check if we reached the end node
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

    // Mark as visited
    const newVisited = new Set([...visited, current]);
    const newToVisit = new Set(toVisit);
    newToVisit.delete(current);

    // Get all adjacent vertices
    const neighbors = adjList[current];
    const newStack = [...stack];

    // For each adjacent vertex, if not visited and not in stack, add to stack
    // Processing in reverse order for natural left-to-right traversal
    for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i];
        if (!newVisited.has(neighbor) && !newToVisit.has(neighbor)) {
            newStack.push(neighbor);
            newToVisit.add(neighbor);

            // If this neighbor is the target, we'll find it in the next step
            if (endNode !== null && neighbor === endNode) {
                // Mark it but don't modify the state yet
                dfsState.targetFound = true;
            }
        }
    }

    // Create the new state with all updates
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

// Reset the DFS algorithm
export const resetDFS = (graph: Graph, startNode: number, isDirected: boolean): DFSState => {
    return initializeDFS(graph, startNode, isDirected);
};