import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';

export const generateCompleteGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    
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

    
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            const edge: Edge = { source: i, target: j };

            
            if (isWeighted) {
                
                edge.weight = Math.floor(Math.random() * 10) + 1;
            }

            edges.push(edge);
        }
    }

    return { nodes, edges };
};