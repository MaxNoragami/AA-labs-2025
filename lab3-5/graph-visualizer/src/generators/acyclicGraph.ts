import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';

export const generateAcyclicGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create nodes with a layered layout for a DAG
    // First, decide how many layers to create
    const numLayers = Math.min(Math.max(2, Math.floor(Math.sqrt(nodeCount) * 1.5)), Math.floor(nodeCount / 2));
    const nodesPerLayer: number[] = [];

    // Distribute nodes across layers
    let remainingNodes = nodeCount;
    for (let i = 0; i < numLayers - 1; i++) {
        // Distribute nodes somewhat evenly, with more nodes in the middle layers
        const layerSize = Math.max(1, Math.floor(remainingNodes / (numLayers - i) * (i === 1 ? 1.5 : 1)));
        nodesPerLayer.push(layerSize);
        remainingNodes -= layerSize;
    }
    nodesPerLayer.push(remainingNodes); // Add remaining nodes to the last layer

    // Create nodes layer by layer
    let nodeIndex = 0;
    const layerHeight = 300 / (numLayers + 1);
    const layerStartY = 50;

    for (let layerIndex = 0; layerIndex < numLayers; layerIndex++) {
        const layerSize = nodesPerLayer[layerIndex];
        const y = layerStartY + layerIndex * layerHeight;

        // Position nodes horizontally within this layer
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

    // Create edges - in a DAG, edges only go from earlier layers to later layers
    // This ensures no cycles are created
    for (let targetLayer = 1; targetLayer < numLayers; targetLayer++) {
        // For each node in this layer
        const startTargetNodeIndex = nodesPerLayer.slice(0, targetLayer).reduce((a, b) => a + b, 0);
        const layerSize = nodesPerLayer[targetLayer];

        for (let i = 0; i < layerSize; i++) {
            const targetNodeIndex = startTargetNodeIndex + i;

            // Choose 1-3 nodes from earlier layers to connect to this node
            const numConnections = Math.min(
                1 + Math.floor(Math.random() * 2),
                startTargetNodeIndex // Can't have more connections than nodes in earlier layers
            );

            // Create a set of source nodes already connected to this target
            const connectedSources = new Set<number>();

            for (let j = 0; j < numConnections; j++) {
                // Choose a random node from an earlier layer
                let sourceNodeIndex = Math.floor(Math.random() * startTargetNodeIndex);

                // Avoid duplicate connections
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
