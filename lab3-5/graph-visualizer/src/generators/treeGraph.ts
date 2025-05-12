import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';


export const generateTreeGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    
    const width = 400;
    const height = 380;
    const topMargin = 50;
    const horizontalMargin = 20;

    
    type TreeNode = {
        id: number;
        children: TreeNode[];
        x?: number;
        y?: number;
        width?: number;
        level: number;
        parent?: number;
    };

    
    const root: TreeNode = { id: 0, children: [], level: 0 };
    const treeNodes: TreeNode[] = [root];

    
    
    let maxChildrenPerNode = 3;
    if (nodeCount <= 10) {
        maxChildrenPerNode = 2;
    } else if (nodeCount <= 20) {
        maxChildrenPerNode = 3;
    } else {
        maxChildrenPerNode = 4;
    }

    
    let currentId = 1;
    let currentLevel = [root];
    let nextLevel: TreeNode[] = [];

    while (currentId < nodeCount) {
        for (const parent of currentLevel) {
            
            
            const childrenToAdd = Math.min(
                Math.floor(1 + Math.random() * maxChildrenPerNode),
                nodeCount - currentId
            );

            if (childrenToAdd <= 0) break;

            for (let i = 0; i < childrenToAdd; i++) {
                if (currentId >= nodeCount) break;

                const child: TreeNode = {
                    id: currentId,
                    children: [],
                    level: parent.level + 1,
                    parent: parent.id
                };

                parent.children.push(child);
                treeNodes.push(child);
                nextLevel.push(child);
                currentId++;
            }
        }

        if (nextLevel.length === 0 || currentId >= nodeCount) break;

        currentLevel = nextLevel;
        nextLevel = [];
    }

    
    const maxLevel = Math.max(...treeNodes.map(node => node.level));

    
    const levelHeight = (height - topMargin) / (maxLevel + 1);

    
    const nodeRadius = Math.max(12, Math.min(16, 20 - Math.floor(nodeCount / 10)));

    
    const nodesPerLevel: number[] = Array(maxLevel + 1).fill(0);
    treeNodes.forEach(node => {
        node.y = topMargin + node.level * levelHeight;
        nodesPerLevel[node.level]++;
    });

    
    const calculateSubtreeWidths = (node: TreeNode): number => {
        if (node.children.length === 0) {
            
            node.width = 2 * nodeRadius + 20; 
            return node.width;
        }

        
        let subtreeWidth = 0;
        for (const child of node.children) {
            subtreeWidth += calculateSubtreeWidths(child);
        }

        
        node.width = Math.max(subtreeWidth, 2 * nodeRadius + 20);
        return node.width;
    };

    
    calculateSubtreeWidths(root);

    
    const positionNodes = (node: TreeNode, leftBoundary: number): void => {
        if (node.children.length === 0) {
            
            node.x = leftBoundary + node.width! / 2;
            return;
        }

        
        let currentX = leftBoundary;

        
        for (const child of node.children) {
            positionNodes(child, currentX);
            currentX += child.width!;
        }

        
        if (node.children.length > 0) {
            const firstChild = node.children[0];
            const lastChild = node.children[node.children.length - 1];
            node.x = (firstChild.x! + lastChild.x!) / 2;
        } else {
            node.x = leftBoundary + node.width! / 2;
        }
    };

    
    positionNodes(root, horizontalMargin);

    
    const maxX = Math.max(...treeNodes.map(node => node.x || 0));
    const scaleX = (width - 2 * horizontalMargin) / maxX;

    
    treeNodes.forEach(treeNode => {
        nodes.push({
            id: treeNode.id,
            x: horizontalMargin + (treeNode.x || 0) * (width - 2 * horizontalMargin) / maxX,
            y: treeNode.y || 0,
            label: getLetterLabel(treeNode.id),
            status: 'unvisited'
        });

        
        if (treeNode.parent !== undefined) {
            const edge: Edge = {
                source: treeNode.parent,
                target: treeNode.id
            };

            if (isWeighted) {
                edge.weight = Math.floor(Math.random() * 10) + 1;
            }

            edges.push(edge);
        }
    });

    return { nodes, edges };
};