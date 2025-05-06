import { Graph, Node, Edge } from '../types';
import { getLetterLabel } from '../utils';


export const generateTreeGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // For tree layout, we need to calculate levels and positions
    const width = 400;
    const height = 380;
    const topMargin = 50;
    const horizontalMargin = 20;

    // Build tree structure first, then calculate positions
    type TreeNode = {
        id: number;
        children: TreeNode[];
        x?: number;
        y?: number;
        width?: number;
        level: number;
        parent?: number;
    };

    // Create root node
    const root: TreeNode = { id: 0, children: [], level: 0 };
    const treeNodes: TreeNode[] = [root];

    // Determine max children per node based on total node count to create a balanced tree
    // For smaller trees, use fewer children per node to create a more balanced look
    let maxChildrenPerNode = 3;
    if (nodeCount <= 10) {
        maxChildrenPerNode = 2;
    } else if (nodeCount <= 20) {
        maxChildrenPerNode = 3;
    } else {
        maxChildrenPerNode = 4;
    }

    // Build the tree structure
    let currentId = 1;
    let currentLevel = [root];
    let nextLevel: TreeNode[] = [];

    while (currentId < nodeCount) {
        for (const parent of currentLevel) {
            // Determine how many children to add to this node
            // Vary the number of children to create a more natural look
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

    // Calculate the max depth of the tree
    const maxLevel = Math.max(...treeNodes.map(node => node.level));

    // Calculate node positions using a more sophisticated algorithm
    const levelHeight = (height - topMargin) / (maxLevel + 1);

    // Calculate node sizes - make them slightly smaller for larger trees
    const nodeRadius = Math.max(12, Math.min(16, 20 - Math.floor(nodeCount / 10)));

    // First pass: set y-coordinates based on levels and count nodes per level
    const nodesPerLevel: number[] = Array(maxLevel + 1).fill(0);
    treeNodes.forEach(node => {
        node.y = topMargin + node.level * levelHeight;
        nodesPerLevel[node.level]++;
    });

    // Helper function to calculate subtree width
    const calculateSubtreeWidths = (node: TreeNode): number => {
        if (node.children.length === 0) {
            // Leaf nodes have a fixed width
            node.width = 2 * nodeRadius + 20; // Node diameter plus spacing
            return node.width;
        }

        // For internal nodes, width is the sum of children's widths
        let subtreeWidth = 0;
        for (const child of node.children) {
            subtreeWidth += calculateSubtreeWidths(child);
        }

        // Ensure minimum width for internal nodes
        node.width = Math.max(subtreeWidth, 2 * nodeRadius + 20);
        return node.width;
    };

    // Calculate all subtree widths starting from root
    calculateSubtreeWidths(root);

    // Position nodes horizontally
    const positionNodes = (node: TreeNode, leftBoundary: number): void => {
        if (node.children.length === 0) {
            // Leaf node
            node.x = leftBoundary + node.width! / 2;
            return;
        }

        // Determine start position for children
        let currentX = leftBoundary;

        // Position each child
        for (const child of node.children) {
            positionNodes(child, currentX);
            currentX += child.width!;
        }

        // Center the parent over its children
        if (node.children.length > 0) {
            const firstChild = node.children[0];
            const lastChild = node.children[node.children.length - 1];
            node.x = (firstChild.x! + lastChild.x!) / 2;
        } else {
            node.x = leftBoundary + node.width! / 2;
        }
    };

    // Start positioning from the root
    positionNodes(root, horizontalMargin);

    // Scale the x-coordinates to fit within the width
    const maxX = Math.max(...treeNodes.map(node => node.x || 0));
    const scaleX = (width - 2 * horizontalMargin) / maxX;

    // Create nodes and edges from the tree structure
    treeNodes.forEach(treeNode => {
        nodes.push({
            id: treeNode.id,
            x: horizontalMargin + (treeNode.x || 0) * (width - 2 * horizontalMargin) / maxX,
            y: treeNode.y || 0,
            label: getLetterLabel(treeNode.id),
            status: 'unvisited'
        });

        // Add edge from parent to this node
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