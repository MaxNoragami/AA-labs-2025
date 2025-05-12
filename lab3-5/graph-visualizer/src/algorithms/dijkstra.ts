import { Node, Edge, Graph, DijkstraState } from '../types';
import { buildAdjacencyList } from '../utils';


class MinHeap {
    heap: [number, number][];  

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


export const initializeDijkstra = (graph: Graph, startNode: number, isDirected: boolean): DijkstraState => {
    
    const adjList: [number, number][][] = Array(graph.nodes.length).fill(null).map(() => []);

    
    graph.edges.forEach(edge => {
        
        const weight = edge.weight || 1;
        adjList[edge.source].push([edge.target, weight]);

        
        if (!isDirected) {
            adjList[edge.target].push([edge.source, weight]);
        }
    });

    
    const distances: number[] = Array(graph.nodes.length).fill(Number.MAX_SAFE_INTEGER);
    distances[startNode] = 0;

    
    const previous: (number | null)[] = Array(graph.nodes.length).fill(null);

    const dijkstraState: DijkstraState = {
        distances,
        previous,
        visited: new Set<number>(),
        toVisit: new Set<number>([startNode]),
        priorityQueue: [[0, startNode]], 
        history: [],
        currentStep: 0,
        isRunning: false,
        targetFound: false,
        pathFound: false,
        adjList,
        nodeToDistanceMap: { [startNode]: 0 } 
    };
    
    dijkstraState.history.push({
        distances: [...dijkstraState.distances],
        previous: [...dijkstraState.previous],
        visited: new Set(dijkstraState.visited),
        toVisit: new Set(dijkstraState.toVisit),
        priorityQueue: [...dijkstraState.priorityQueue]
    });

    return dijkstraState;
};

export const stepDijkstra = (dijkstraState: DijkstraState, endNode: number | null): DijkstraState => {
    const { distances, previous, visited, toVisit, priorityQueue, adjList } = dijkstraState;

    
    const minHeap = new MinHeap();
    for (const item of priorityQueue) {
        minHeap.push(item);
    }

    
    if (minHeap.size() === 0) {
        return { ...dijkstraState, isRunning: false, pathFound: false, priorityQueue: [] };
    }

    
    const [currentDist, current] = minHeap.pop()!;

    
    const newPriorityQueue = dijkstraState.priorityQueue.filter(
        item => !(item[0] === currentDist && item[1] === current)
    );

    
    if (endNode !== null && current === endNode) {
        
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
            currentStep: dijkstraState.currentStep + 1,
            processedNode: current, 
            nodeToDistanceMap: { ...dijkstraState.nodeToDistanceMap, [current]: distances[current] }
        };
    }

    
    if (visited.has(current)) {
        return {
            ...dijkstraState,
            priorityQueue: newPriorityQueue,
            currentStep: dijkstraState.currentStep + 1
        };
    }

    
    const newVisited = new Set([...visited, current]);
    toVisit.delete(current);

    
    const queueAdditions: [number, number][] = [];
    const nodesToEnqueue: number[] = [];

    
    const neighbors = adjList[current];
    for (const [neighbor, weight] of neighbors) {
        if (!visited.has(neighbor)) {
            
            const newDist = distances[current] + weight;

            
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = current;

                
                queueAdditions.push([newDist, neighbor]);
                nodesToEnqueue.push(neighbor);

                
                if (endNode !== null && neighbor === endNode) {
                    dijkstraState.targetFound = true;
                }
            }
        }
    }

    
    const heapArray: [number, number][] = [];
    while (minHeap.size() > 0) {
        const item = minHeap.pop();
        if (item) heapArray.push(item);
    }

    
    for (const item of queueAdditions) {
        heapArray.push(item);
    }

    
    const newState = {
        ...dijkstraState,
        distances: [...distances],
        previous: [...previous],
        visited: newVisited,
        toVisit: new Set([...toVisit, ...nodesToEnqueue]),
        priorityQueue: heapArray,
        currentStep: dijkstraState.currentStep + 1,
        processedNode: current, 
        newlyQueuedNodes: nodesToEnqueue, 
        nodeToDistanceMap: {
            ...dijkstraState.nodeToDistanceMap,
            [current]: distances[current]
        }
    };

    
    newState.history.push({
        distances: [...newState.distances],
        previous: [...newState.previous],
        visited: new Set(newState.visited),
        toVisit: new Set(newState.toVisit),
        priorityQueue: [...newState.priorityQueue],
        processedNode: newState.processedNode,
        newlyQueuedNodes: newState.newlyQueuedNodes,
        nodeToDistanceMap: { ...newState.nodeToDistanceMap }
    });

    return newState;
};


export const getShortestPath = (dijkstraState: DijkstraState, targetNode: number): number[] => {
    const path: number[] = [];
    let current = targetNode;

    
    while (current !== null && dijkstraState.previous[current] !== null) {
        path.unshift(current);
        current = dijkstraState.previous[current]!;
    }

    
    if (current !== null) {
        path.unshift(current);
    }

    return path;
};


export const resetDijkstra = (graph: Graph, startNode: number, isDirected: boolean): DijkstraState => {
    return initializeDijkstra(graph, startNode, isDirected);
};