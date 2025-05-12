import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';

export const generateSparseGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    
    
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount;

        
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

    
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;

    
    const sparsityFactor = 0.18;
    let targetEdgeCount = Math.max(nodeCount - 1, Math.floor(maxEdges * sparsityFactor));

    
    

    
    for (let i = 0; i < nodeCount - 1; i++) {
        const edge: Edge = { source: i, target: i + 1 };

        if (isWeighted) {
            edge.weight = Math.floor(Math.random() * 10) + 1;
        }

        edges.push(edge);
    }

    
    if (targetEdgeCount > nodeCount - 1) {
        
        

        
        const possibleEdges: { source: number, target: number }[] = [];
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                
                if (j !== i + 1 || i >= nodeCount - 1) {
                    possibleEdges.push({ source: i, target: j });
                }
            }
        }

        
        for (let i = possibleEdges.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [possibleEdges[i], possibleEdges[j]] = [possibleEdges[j], possibleEdges[i]];
        }

        
        const remainingToAdd = Math.min(targetEdgeCount - (nodeCount - 1), possibleEdges.length);

        
        possibleEdges.sort((a, b) => {
            const distA = Math.abs(a.source - a.target);
            const distB = Math.abs(b.source - b.target);
            return distA - distB; 
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