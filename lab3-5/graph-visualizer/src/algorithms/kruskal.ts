import { Graph, Edge, KruskalState } from '../types';


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


export const initializeKruskal = (graph: Graph): KruskalState => {
    
    const sortedEdges = [...graph.edges].sort((a: Edge, b: Edge) => {
        const weightA = a.weight ?? 1; 
        const weightB = b.weight ?? 1;
        return weightA - weightB;
    });

    return {
        sortedEdges,
        currentEdgeIndex: -1, 
        mstEdges: [],
        disjointSets: Array.from({ length: graph.nodes.length }, (_, i) => i),
        disjointSetRanks: Array(graph.nodes.length).fill(1),
        history: [],
        currentStep: 0,
        isRunning: false,
        completed: false
    };
};


export const stepKruskal = (state: KruskalState): KruskalState => {
    const { sortedEdges, currentEdgeIndex, mstEdges, disjointSets } = state;

    
    const newMstEdges = [...mstEdges];
    const newDisjointSets = [...disjointSets];

    
    const ds = new DisjointSet(disjointSets.length);
    ds.parent = [...newDisjointSets]; 
    ds.rank = [...state.disjointSetRanks];

    
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

    
    const nextEdgeIndex = currentEdgeIndex + 1;
    const currentEdge = sortedEdges[nextEdgeIndex];

    
    const sourceSet = ds.find(currentEdge.source);
    const targetSet = ds.find(currentEdge.target);

    
    if (sourceSet !== targetSet) {
        ds.unite(currentEdge.source, currentEdge.target);
        newMstEdges.push(currentEdge);
        

        
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


export const resetKruskal = (graph: Graph): KruskalState => {
    return initializeKruskal(graph);
};


export const getShortestPathInMST = (
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