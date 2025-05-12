import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';

export const generateConnectedGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount;
        
        const nodeRadius = radius * (0.8 + Math.random() * 0.4);
        const offsetAngle = angle + (Math.random() * 0.2 - 0.1);

        nodes.push({
            id: i,
            x: centerX + nodeRadius * Math.cos(offsetAngle),
            y: centerY + nodeRadius * Math.sin(offsetAngle),
            label: getLetterLabel(i),
            status: 'unvisited'
        });
    }

    
    
    const usedNodes = new Set<number>([0]); 
    const remainingNodes = new Set<number>();
    for (let i = 1; i < nodeCount; i++) {
        remainingNodes.add(i);
    }

    
    while (remainingNodes.size > 0) {
        const sourceIds = Array.from(usedNodes);
        const sourceId = sourceIds[Math.floor(Math.random() * sourceIds.length)];

        
        let closestNode = -1;
        let minDistance = Infinity;

        for (const targetId of remainingNodes) {
            const sourceNode = nodes[sourceId];
            const targetNode = nodes[targetId];
            const distance = Math.sqrt(
                Math.pow(sourceNode.x - targetNode.x, 2) +
                Math.pow(sourceNode.y - targetNode.y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestNode = targetId;
            }
        }

        if (closestNode !== -1) {
            
            const edge: Edge = {
                source: sourceId,
                target: closestNode
            };

            if (isWeighted) {
                edge.weight = Math.floor(Math.random() * 10) + 1;
            }

            edges.push(edge);
            usedNodes.add(closestNode);
            remainingNodes.delete(closestNode);
        }
    }

    
    
    const additionalEdges = Math.floor(nodeCount / 3);

    for (let i = 0; i < additionalEdges; i++) {
        let source = Math.floor(Math.random() * nodeCount);
        let target = Math.floor(Math.random() * nodeCount);

        
        let attempts = 0;
        while (
            source === target ||
            edges.some(e =>
                (e.source === source && e.target === target) ||
                (e.source === target && e.target === source)
            )
        ) {
            source = Math.floor(Math.random() * nodeCount);
            target = Math.floor(Math.random() * nodeCount);

            attempts++;
            if (attempts > 20) break; 
        }

        if (attempts <= 20) {
            const edge: Edge = {
                source,
                target
            };

            if (isWeighted) {
                edge.weight = Math.floor(Math.random() * 10) + 1;
            }

            edges.push(edge);
        }
    }

    return { nodes, edges };
};