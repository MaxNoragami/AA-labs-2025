import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';


export const generateDisconnectedGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    
    const numComponents = Math.min(Math.max(2, Math.floor(nodeCount / 5)), 4);

    
    const componentsSize: number[] = [];
    let remainingNodes = nodeCount;

    
    for (let i = 0; i < numComponents; i++) {
        componentsSize[i] = 2;
        remainingNodes -= 2;
    }

    
    while (remainingNodes > 0) {
        const componentIndex = Math.floor(Math.random() * numComponents);
        componentsSize[componentIndex]++;
        remainingNodes--;
    }

    
    const sectorsAngle = (2 * Math.PI) / numComponents;
    let nodeIndex = 0;

    for (let componentIndex = 0; componentIndex < numComponents; componentIndex++) {
        const componentSize = componentsSize[componentIndex];
        const componentCenterAngle = componentIndex * sectorsAngle;

        
        const componentDistance = 100;
        const componentCenterX = 200 + componentDistance * Math.cos(componentCenterAngle);
        const componentCenterY = 200 + componentDistance * Math.sin(componentCenterAngle);

        
        const componentRadius = Math.min(60, 30 + componentSize * 5);

        
        const componentNodes: number[] = [];
        for (let i = 0; i < componentSize; i++) {
            
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

        
        if (componentNodes.length > 1) {
            
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

            
            const additionalEdges = Math.max(1, Math.floor(componentSize / 3));
            for (let i = 0; i < additionalEdges; i++) {
                const sourceIndex = Math.floor(Math.random() * componentNodes.length);
                let targetIndex = Math.floor(Math.random() * componentNodes.length);

                
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