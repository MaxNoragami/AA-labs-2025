import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';


export const generateDenseGraph = (nodeCount: number, isWeighted: boolean): Graph => {
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

    
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;

    
    const densityFactor = 0.75;
    const targetEdgeCount = Math.floor(maxEdges * densityFactor);

    
    for (let i = 0; i < nodeCount - 1; i++) {
        const edge: Edge = { source: i, target: i + 1 };

        if (isWeighted) {
            edge.weight = Math.floor(Math.random() * 10) + 1;
        }

        edges.push(edge);
    }

    
    
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
    for (let i = 0; i < remainingToAdd; i++) {
        const edge: Edge = possibleEdges[i];

        if (isWeighted) {
            edge.weight = Math.floor(Math.random() * 10) + 1;
        }

        edges.push(edge);
    }

    return { nodes, edges };
};