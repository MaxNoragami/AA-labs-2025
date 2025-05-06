import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';

export const generateCyclicGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create nodes in a circular layout with some randomization
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    // Create the nodes
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount;
        // Add a bit of randomness to create a more organic layout
        const nodeRadius = radius * (0.85 + Math.random() * 0.3);
        const offsetAngle = angle + (Math.random() * 0.2 - 0.1);

        nodes.push({
            id: i,
            x: centerX + nodeRadius * Math.cos(offsetAngle),
            y: centerY + nodeRadius * Math.sin(offsetAngle),
            label: getLetterLabel(i),
            status: 'unvisited'
        });
    }

    // First ensure the graph is connected
    // We'll start by creating a spanning tree
    for (let i = 1; i < nodeCount; i++) {
        const edge: Edge = {
            source: Math.floor(Math.random() * i), // Connect to a random earlier node
            target: i
        };

        if (isWeighted) {
            edge.weight = Math.floor(Math.random() * 10) + 1;
        }

        edges.push(edge);
    }

    // Now create cycles by adding edges between nodes that are already connected indirectly
    // We'll create approximately n/2 cycles
    const numCycles = Math.max(1, Math.floor(nodeCount / 2));

    // Create a simple function to check if adding an edge would create a cycle
    // For simplicity, we'll add edges that are likely to create cycles
    for (let i = 0; i < numCycles; i++) {
        // Create edges that "close" the cycle by connecting nodes that are distance 2 or more apart
        const source = i % nodeCount;
        const target = (i + 2) % nodeCount;

        // Check if this edge already exists
        if (!edges.some(e =>
            (e.source === source && e.target === target) ||
            (e.source === target && e.target === source)
        )) {
            const edge: Edge = { source, target };

            if (isWeighted) {
                edge.weight = Math.floor(Math.random() * 10) + 1;
            }

            edges.push(edge);
        }
    }

    return { nodes, edges };
};