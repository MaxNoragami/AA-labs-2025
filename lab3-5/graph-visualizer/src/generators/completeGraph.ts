import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';

export const generateCompleteGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Place nodes in a circle for complete graphs
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    // Create nodes positioned in a circle
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount;
        // Convert index to letter (A, B, C, ..., Z, AA, AB, ...)
        const label = getLetterLabel(i);
        nodes.push({
            id: i,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            label,
            status: 'unvisited'
        });
    }

    // Create edges - connect each node to every other node
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            const edge: Edge = { source: i, target: j };

            // Add weights if weighted option is enabled
            if (isWeighted) {
                // Generate random weight between 1 and 10
                edge.weight = Math.floor(Math.random() * 10) + 1;
            }

            edges.push(edge);
        }
    }

    return { nodes, edges };
};