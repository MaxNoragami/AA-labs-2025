import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';

// Generate a dense graph - has many but not all possible edges
export const generateDenseGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Place nodes in a circle for consistent layout
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    // Create nodes positioned in a circle
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount;
        const label = getLetterLabel(i);
        nodes.push({
            id: i,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            label,
            status: 'unvisited'
        });
    }

    // Calculate maximum possible edges for an undirected graph
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;

    // For dense graph, we'll use about 70-80% of possible edges
    const densityFactor = 0.75;
    const targetEdgeCount = Math.floor(maxEdges * densityFactor);

    // First, ensure the graph is connected by adding n-1 edges (minimum spanning tree)
    for (let i = 0; i < nodeCount - 1; i++) {
        const edge: Edge = { source: i, target: i + 1 };

        if (isWeighted) {
            edge.weight = Math.floor(Math.random() * 10) + 1;
        }

        edges.push(edge);
    }

    // Add remaining edges randomly until we reach the target density
    // Create a list of all possible edges not yet added
    const possibleEdges: { source: number, target: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            // Skip edges already added in the spanning tree
            if (j !== i + 1 || i >= nodeCount - 1) {
                possibleEdges.push({ source: i, target: j });
            }
        }
    }

    // Shuffle the possible edges
    for (let i = possibleEdges.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [possibleEdges[i], possibleEdges[j]] = [possibleEdges[j], possibleEdges[i]];
    }

    // Add edges until we reach our target
    const remainingToAdd = Math.min(targetEdgeCount - (nodeCount - 1), possibleEdges.length);
    for (let i = 0; i < remainingToAdd; i++) {
        const edge: Edge = possibleEdges[i];

        if (isWeighted) {
            edge.weight = Math.floor(Math.random() * 10) + 1;
        }

        edges.push(edge);
    }

    return { nodes, edges };
};