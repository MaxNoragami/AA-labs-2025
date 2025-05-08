import { Node, Edge, Graph, DijkstraState } from '../types';
import { buildAdjacencyList } from '../utils';

// MinHeap implementation for Dijkstra's algorithm
class MinHeap {
    heap: [number, number][];  // [distance, nodeId]

    constructor() {
        this.heap = [];
    }

    push(val: [number, number]) {
        this.heap.push(val);
        this._heapifyUp(this.heap.length - 1);
    }

    pop(): [number, number] | null {
        if (this.size() === 0) return null;
        if (this.size() === 1) return this.heap.pop()!;
        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this._heapifyDown(0);
        return min;
    }

    size(): number {
        return this.heap.length;
    }

    _heapifyUp(index: number) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.heap[parent][0] <= this.heap[index][0]) break;
            [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
            index = parent;
        }
    }

    _heapifyDown(index: number) {
        const n = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < n && this.heap[left][0] < this.heap[smallest][0]) {
                smallest = left;
            }

            if (right < n && this.heap[right][0] < this.heap[smallest][0]) {
                smallest = right;
            }
            if (smallest === index) break;
            [this.heap[smallest], this.heap[index]] =
                [this.heap[index], this.heap[smallest]];
            index = smallest;
        }
    }
}

// Dijkstra implementation
export const initializeDijkstra = (graph: Graph, startNode: number, isDirected: boolean): DijkstraState => {
    // Create weighted adjacency list from graph
    const adjList: [number, number][][] = Array(graph.nodes.length).fill(null).map(() => []);

    // Build weighted adjacency list
    graph.edges.forEach(edge => {
        // Default weight to 1 if not specified
        const weight = edge.weight || 1;
        adjList[edge.source].push([edge.target, weight]);

        // For undirected graphs, add the reverse edge as well
        if (!isDirected) {
            adjList[edge.target].push([edge.source, weight]);
        }
    });

    // Initialize distances array with infinity
    const distances: number[] = Array(graph.nodes.length).fill(Number.MAX_SAFE_INTEGER);
    distances[startNode] = 0;

    // Initialize previous array to track paths
    const previous: (number | null)[] = Array(graph.nodes.length).fill(null);

    // Initialize Dijkstra state
    const dijkstraState: DijkstraState = {
        distances,
        previous,
        visited: new Set<number>(),
        toVisit: new Set<number>([startNode]),
        priorityQueue: [[0, startNode]], // [distance, nodeId]
        history: [],
        currentStep: 0,
        isRunning: false,
        targetFound: false,
        pathFound: false,
        adjList
    };

    // Save initial state to history
    dijkstraState.history.push({
        distances: [...dijkstraState.distances],
        previous: [...dijkstraState.previous],
        visited: new Set(dijkstraState.visited),
        toVisit: new Set(dijkstraState.toVisit),
        priorityQueue: [...dijkstraState.priorityQueue]
    });

    return dijkstraState;
};

// Execute a single step of Dijkstra's algorithm
export const stepDijkstra = (dijkstraState: DijkstraState, endNode: number | null): DijkstraState => {
    const { distances, previous, visited, toVisit, priorityQueue, adjList } = dijkstraState;

    // Create MinHeap instance and populate it
    const minHeap = new MinHeap();
    for (const item of priorityQueue) {
        minHeap.push(item);
    }

    // If queue is empty, there's nothing more to do
    if (minHeap.size() === 0) {
        return { ...dijkstraState, isRunning: false, pathFound: false, priorityQueue: [] };
    }

    // Get node with minimum distance
    const [currentDist, current] = minHeap.pop()!;

    // Remove from priority queue
    const newPriorityQueue = dijkstraState.priorityQueue.filter(
        item => !(item[0] === currentDist && item[1] === current)
    );

    // Check if we reached the end node
    if (endNode !== null && current === endNode) {
        // Mark as visited
        const newVisited = new Set([...visited, current]);
        toVisit.delete(current);

        return {
            ...dijkstraState,
            visited: newVisited,
            toVisit: new Set(toVisit),
            priorityQueue: newPriorityQueue,
            isRunning: false,
            targetFound: true,
            pathFound: true,
            currentStep: dijkstraState.currentStep + 1
        };
    }

    // Skip if already visited
    if (visited.has(current)) {
        return {
            ...dijkstraState,
            priorityQueue: newPriorityQueue,
            currentStep: dijkstraState.currentStep + 1
        };
    }

    // Mark as visited
    const newVisited = new Set([...visited, current]);
    toVisit.delete(current);

    // Process neighbors
    const neighbors = adjList[current];
    for (const [neighbor, weight] of neighbors) {
        if (!visited.has(neighbor)) {
            // Calculate new distance
            const newDist = distances[current] + weight;

            // If new distance is better, update
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = current;

                // Add to priority queue
                minHeap.push([newDist, neighbor]);
                toVisit.add(neighbor);

                // If this neighbor is the target, mark it
                if (endNode !== null && neighbor === endNode) {
                    dijkstraState.targetFound = true;
                }
            }
        }
    }

    // Re-build priority queue from minHeap
    const heapArray: [number, number][] = [];
    while (minHeap.size() > 0) {
        const item = minHeap.pop();
        if (item) heapArray.push(item);
    }

    // Create the new state with all updates
    const newState = {
        ...dijkstraState,
        distances: [...distances],
        previous: [...previous],
        visited: newVisited,
        toVisit: new Set(toVisit),
        priorityQueue: heapArray,
        currentStep: dijkstraState.currentStep + 1
    };

    // Save current state to history
    newState.history.push({
        distances: [...newState.distances],
        previous: [...newState.previous],
        visited: new Set(newState.visited),
        toVisit: new Set(newState.toVisit),
        priorityQueue: [...newState.priorityQueue]
    });

    return newState;
};

// Construct the shortest path from start to target
export const getShortestPath = (dijkstraState: DijkstraState, targetNode: number): number[] => {
    const path: number[] = [];
    let current = targetNode;

    // Reconstruct path from target to start
    while (current !== null && dijkstraState.previous[current] !== null) {
        path.unshift(current);
        current = dijkstraState.previous[current]!;
    }

    // Add start node
    if (current !== null) {
        path.unshift(current);
    }

    return path;
};

// Reset the Dijkstra algorithm
export const resetDijkstra = (graph: Graph, startNode: number, isDirected: boolean): DijkstraState => {
    return initializeDijkstra(graph, startNode, isDirected);
};