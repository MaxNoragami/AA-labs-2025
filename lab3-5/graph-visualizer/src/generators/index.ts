import { Graph } from '../types';
import { generateCompleteGraph } from './completeGraph.ts';
import { generateDenseGraph } from './denseGraph.ts';
import { generateSparseGraph } from './sparseGraph.ts';
import { generateTreeGraph } from './treeGraph.ts';
import { generateConnectedGraph } from './connectedGraph.ts';
import { generateDisconnectedGraph } from './disconnectedGraph.ts';
import { generateCyclicGraph } from './cyclicGraph.ts';
import { generateAcyclicGraph } from './acyclicGraph.ts';
import { generateGridGraph } from './gridGraph.ts';

// This function serves as a factory method to create graphs based on type
export const generateGraph = (
    type: string,
    nodeCount: number,
    isWeighted: boolean,
    isDirected: boolean
): Graph => {
    switch (type) {
        case 'complete':
            return generateCompleteGraph(nodeCount, isWeighted);
        case 'dense':
            return generateDenseGraph(nodeCount, isWeighted);
        case 'sparse':
            return generateSparseGraph(nodeCount, isWeighted);
        case 'tree':
            return generateTreeGraph(nodeCount, isWeighted);
        case 'connected':
            return generateConnectedGraph(nodeCount, isWeighted);
        case 'disconnected':
            return generateDisconnectedGraph(nodeCount, isWeighted);
        case 'cyclic':
            return generateCyclicGraph(nodeCount, isWeighted);
        case 'acyclic':
            // For acyclic graph, force directed to be true since DAGs are directed by nature
            return generateAcyclicGraph(nodeCount, isWeighted);
        case 'grid':
            return generateGridGraph(nodeCount, isWeighted);
        default:
            return { nodes: [], edges: [] };
    }
};

// Export all individual generators
export {
    generateCompleteGraph,
    generateDenseGraph,
    generateSparseGraph,
    generateTreeGraph,
    generateConnectedGraph,
    generateDisconnectedGraph,
    generateCyclicGraph,
    generateAcyclicGraph,
    generateGridGraph
};