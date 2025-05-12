import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';

export const generateCyclicGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount;
        
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

    
    
    for (let i = 1; i < nodeCount; i++) {
        const edge: Edge = {
            source: Math.floor(Math.random() * i), 
            target: i
        };

        if (isWeighted) {
            edge.weight = Math.floor(Math.random() * 10) + 1;
        }

        edges.push(edge);
    }

    
    
    const numCycles = Math.max(1, Math.floor(nodeCount / 2));

    
    
    for (let i = 0; i < numCycles; i++) {
        
        const source = i % nodeCount;
        const target = (i + 2) % nodeCount;

        
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