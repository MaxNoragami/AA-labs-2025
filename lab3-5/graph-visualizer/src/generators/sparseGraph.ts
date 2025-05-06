import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';

export const generateSparseGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // For sparse graphs, we'll use a slightly different layout than a perfect circle
    // to better show the sparse structure
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    // Create nodes with a bit of randomness to the positions
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount;

        // Add slight randomness to radius for more natural look
        const nodeRadius = radius * (0.8 + Math.random() * 0.4);

        const label = getLetterLabel(i);
        nodes.push({
            id: i,
            x: centerX + nodeRadius * Math.cos(angle),
            y: centerY + nodeRadius * Math.sin(angle),
            label,
            status: 'unvisited'
        });
    }

    // Calculate maximum possible edges
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;

    // For sparse graph, use only about 15-20% of possible edges
    const sparsityFactor = 0.18;
    let targetEdgeCount = Math.max(nodeCount - 1, Math.floor(maxEdges * sparsityFactor));

    // Ensure we have at least a spanning tree to guarantee connectivity
    // For sparse graphs, we'll create a path-like or tree-like structure

    // First approach: Create a backbone path through all nodes
    for (let i = 0; i < nodeCount - 1; i++) {
        const edge: Edge = { source: i, target: i + 1 };

        if (isWeighted) {
            edge.weight = Math.floor(Math.random() * 10) + 1;
        }

        edges.push(edge);
    }

    // If we have more than just the minimum spanning tree edges to add
    if (targetEdgeCount > nodeCount - 1) {
        // Add a small number of additional edges to create some cycles or branches
        // but maintain the sparse nature

        // Create a list of possible additional edges
        const possibleEdges: { source: number, target: number }[] = [];
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                // Skip edges already in the path
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

        // Add edges until we reach our sparse target
        const remainingToAdd = Math.min(targetEdgeCount - (nodeCount - 1), possibleEdges.length);

        // For a more natural sparse graph, prioritize nearby nodes
        possibleEdges.sort((a, b) => {
            const distA = Math.abs(a.source - a.target);
            const distB = Math.abs(b.source - b.target);
            return distA - distB; // Sort by distance between node indices
        });

        for (let i = 0; i < remainingToAdd; i++) {
            const edge: Edge = possibleEdges[i];

            if (isWeighted) {
                edge.weight = Math.floor(Math.random() * 10) + 1;
            }

            edges.push(edge);
        }
    }

    return { nodes, edges };
};