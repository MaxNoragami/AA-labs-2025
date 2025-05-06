import { Node, Edge, Graph, BFSState } from '../types';
import { buildAdjacencyList } from '../utils';

// BFS implementation
export const initializeBFS = (graph: Graph, startNode: number, isDirected: boolean): BFSState => {
    const adjList = buildAdjacencyList(graph.nodes, graph.edges, isDirected);

    // Initialize BFS state
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

    // Save initial state to history
    bfsState.history.push({
        queue: [...bfsState.queue],
        visited: new Set(bfsState.visited),
        toVisit: new Set(bfsState.toVisit)
    });

    return bfsState;
};

// Execute a single step of BFS
export const stepBFS = (bfsState: BFSState, endNode: number | null): BFSState => {
    const { queue, visited, toVisit, adjList } = bfsState;

    // If queue is empty, there's nothing more to do
    if (queue.length === 0) {
        return { ...bfsState, isRunning: false, pathFound: false };
    }

    // Dequeue the first node
    const current = queue.shift()!;

    // Check if we reached the end node
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

    // Mark as visited
    visited.add(current);
    toVisit.delete(current);

    // Get all adjacent vertices
    const neighbors = adjList[current];

    // For each adjacent vertex, if not visited and not in queue, add to queue
    for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && !toVisit.has(neighbor)) {
            queue.push(neighbor);
            toVisit.add(neighbor);

            // If this neighbor is the target, we'll find it in the next step
            if (endNode !== null && neighbor === endNode) {
                bfsState.targetFound = true;
            }
        }
    }

    // Save current state to history
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

// Reset the BFS algorithm
export const resetBFS = (graph: Graph, startNode: number, isDirected: boolean): BFSState => {
    return initializeBFS(graph, startNode, isDirected);
};