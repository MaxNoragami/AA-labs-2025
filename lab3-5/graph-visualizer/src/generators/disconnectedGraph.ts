import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';

// Generate a disconnected graph with multiple components
export const generateDisconnectedGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Determine number of components (2-4 based on node count)
    const numComponents = Math.min(Math.max(2, Math.floor(nodeCount / 5)), 4);

    // Distribute nodes among components
    const componentsSize: number[] = [];
    let remainingNodes = nodeCount;

    // Assign at least 2 nodes to each component
    for (let i = 0; i < numComponents; i++) {
        componentsSize[i] = 2;
        remainingNodes -= 2;
    }

    // Distribute remaining nodes somewhat randomly
    while (remainingNodes > 0) {
        const componentIndex = Math.floor(Math.random() * numComponents);
        componentsSize[componentIndex]++;
        remainingNodes--;
    }

    // Create layouts for each component
    const sectorsAngle = (2 * Math.PI) / numComponents;
    let nodeIndex = 0;

    for (let componentIndex = 0; componentIndex < numComponents; componentIndex++) {
        const componentSize = componentsSize[componentIndex];
        const componentCenterAngle = componentIndex * sectorsAngle;

        // Position the component away from the center
        const componentDistance = 100;
        const componentCenterX = 200 + componentDistance * Math.cos(componentCenterAngle);
        const componentCenterY = 200 + componentDistance * Math.sin(componentCenterAngle);

        // Calculate a good radius for this component
        const componentRadius = Math.min(60, 30 + componentSize * 5);

        // Create nodes for this component
        const componentNodes: number[] = [];
        for (let i = 0; i < componentSize; i++) {
            // Position nodes in a circle around the component center
            const angle = (i * 2 * Math.PI) / componentSize;
            const x = componentCenterX + componentRadius * Math.cos(angle);
            const y = componentCenterY + componentRadius * Math.sin(angle);

            nodes.push({
                id: nodeIndex,
                x,
                y,
                label: getLetterLabel(nodeIndex),
                component: componentIndex,
                status: 'unvisited'
            });

            componentNodes.push(nodeIndex);
            nodeIndex++;
        }

        // Connect the nodes within this component to ensure each component is connected
        if (componentNodes.length > 1) {
            // First create a connected path through all nodes in the component
            for (let i = 0; i < componentNodes.length - 1; i++) {
                const edge: Edge = {
                    source: componentNodes[i],
                    target: componentNodes[i + 1]
                };

                if (isWeighted) {
                    edge.weight = Math.floor(Math.random() * 10) + 1;
                }

                edges.push(edge);
            }

            // Add a few more random connections within this component
            const additionalEdges = Math.max(1, Math.floor(componentSize / 3));
            for (let i = 0; i < additionalEdges; i++) {
                const sourceIndex = Math.floor(Math.random() * componentNodes.length);
                let targetIndex = Math.floor(Math.random() * componentNodes.length);

                // Avoid self-loops and duplicate edges
                let attempts = 0;
                while (
                    sourceIndex === targetIndex ||
                    edges.some(e =>
                        (e.source === componentNodes[sourceIndex] && e.target === componentNodes[targetIndex]) ||
                        (e.source === componentNodes[targetIndex] && e.target === componentNodes[sourceIndex])
                    )
                ) {
                    targetIndex = Math.floor(Math.random() * componentNodes.length);
                    attempts++;
                    if (attempts > 10) break;
                }

                if (attempts <= 10) {
                    const edge: Edge = {
                        source: componentNodes[sourceIndex],
                        target: componentNodes[targetIndex]
                    };

                    if (isWeighted) {
                        edge.weight = Math.floor(Math.random() * 10) + 1;
                    }

                    edges.push(edge);
                }
            }
        }
    }

    return { nodes, edges };
};