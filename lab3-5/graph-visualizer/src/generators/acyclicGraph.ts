import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';

export const generateAcyclicGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    
    
    const numLayers = Math.min(Math.max(2, Math.floor(Math.sqrt(nodeCount) * 1.5)), Math.floor(nodeCount / 2));
    const nodesPerLayer: number[] = [];

    
    let remainingNodes = nodeCount;
    for (let i = 0; i < numLayers - 1; i++) {
        
        const layerSize = Math.max(1, Math.floor(remainingNodes / (numLayers - i) * (i === 1 ? 1.5 : 1)));
        nodesPerLayer.push(layerSize);
        remainingNodes -= layerSize;
    }
    nodesPerLayer.push(remainingNodes); 

    
    let nodeIndex = 0;
    const layerHeight = 300 / (numLayers + 1);
    const layerStartY = 50;

    for (let layerIndex = 0; layerIndex < numLayers; layerIndex++) {
        const layerSize = nodesPerLayer[layerIndex];
        const y = layerStartY + layerIndex * layerHeight;

        
        for (let i = 0; i < layerSize; i++) {
            const x = 50 + (300 / (layerSize + 1)) * (i + 1);

            nodes.push({
                id: nodeIndex,
                x,
                y,
                label: getLetterLabel(nodeIndex),
                status: 'unvisited'
            });

            nodeIndex++;
        }
    }

    
    
    for (let targetLayer = 1; targetLayer < numLayers; targetLayer++) {
        
        const startTargetNodeIndex = nodesPerLayer.slice(0, targetLayer).reduce((a, b) => a + b, 0);
        const layerSize = nodesPerLayer[targetLayer];

        for (let i = 0; i < layerSize; i++) {
            const targetNodeIndex = startTargetNodeIndex + i;

            
            const numConnections = Math.min(
                1 + Math.floor(Math.random() * 2),
                startTargetNodeIndex 
            );

            
            const connectedSources = new Set<number>();

            for (let j = 0; j < numConnections; j++) {
                
                let sourceNodeIndex = Math.floor(Math.random() * startTargetNodeIndex);

                
                while (connectedSources.has(sourceNodeIndex)) {
                    sourceNodeIndex = Math.floor(Math.random() * startTargetNodeIndex);
                }

                connectedSources.add(sourceNodeIndex);

                const edge: Edge = {
                    source: sourceNodeIndex,
                    target: targetNodeIndex
                };

                if (isWeighted) {
                    edge.weight = Math.floor(Math.random() * 10) + 1;
                }

                edges.push(edge);
            }
        }
    }

    return { nodes, edges };
};
