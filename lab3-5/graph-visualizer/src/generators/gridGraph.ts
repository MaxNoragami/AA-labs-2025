import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';

export const generateGridGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    
    
    const gridWidth = Math.ceil(Math.sqrt(nodeCount));
    const gridHeight = Math.ceil(nodeCount / gridWidth);

    
    const cellWidth = 320 / gridWidth;
    const cellHeight = 320 / gridHeight;

    
    const startX = 40 + (cellWidth / 2);
    const startY = 40 + (cellHeight / 2);

    
    let nodeIndex = 0;
    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            if (nodeIndex >= nodeCount) break;

            const x = startX + col * cellWidth;
            const y = startY + row * cellHeight;

            nodes.push({
                id: nodeIndex,
                x,
                y,
                label: getLetterLabel(nodeIndex),
                gridX: col,
                gridY: row,
                status: 'unvisited'
            });

            nodeIndex++;
        }
    }

    
    for (const node of nodes) {
        const gridX = node.gridX!;
        const gridY = node.gridY!;

        
        if (gridX < gridWidth - 1) {
            const rightNeighborIndex = nodes.findIndex(
                n => n.gridX === gridX + 1 && n.gridY === gridY
            );

            if (rightNeighborIndex !== -1) {
                const edge: Edge = {
                    source: node.id,
                    target: nodes[rightNeighborIndex].id
                };

                if (isWeighted) {
                    edge.weight = Math.floor(Math.random() * 10) + 1;
                }

                edges.push(edge);
            }
        }

        
        if (gridY < gridHeight - 1) {
            const bottomNeighborIndex = nodes.findIndex(
                n => n.gridX === gridX && n.gridY === gridY + 1
            );

            if (bottomNeighborIndex !== -1) {
                const edge: Edge = {
                    source: node.id,
                    target: nodes[bottomNeighborIndex].id
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