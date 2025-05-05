import React, { useState, useEffect, useRef } from 'react';

// Types for our application
type GraphType = 'complete' | 'dense' | 'sparse' | 'tree' | 'connected' | 'disconnected' | 'cyclic' | 'acyclic' | 'grid';
type AlgorithmType = 'none' | 'bfs';
type Node = {
    id: number;
    x: number;
    y: number;
    label: string;
    component?: number;
    gridX?: number;
    gridY?: number;
    status?: 'unvisited' | 'queued' | 'visited';
};
type Edge = { source: number; target: number; weight?: number };
type Graph = { nodes: Node[]; edges: Edge[] };

// BFS algorithm state
type BFSState = {
    queue: number[];
    visited: Set<number>;
    toVisit: Set<number>;
    history: { queue: number[], visited: Set<number>, toVisit: Set<number> }[];
    currentStep: number;
    isRunning: boolean;
    targetFound: boolean;
    pathFound: boolean;
    adjList: number[][];
};

// Graph generator functions
const generateCompleteGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Place nodes in a circle for complete graphs
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    // Create nodes positioned in a circle
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount;
        // Convert index to letter (A, B, C, ..., Z, AA, AB, ...)
        const label = getLetterLabel(i);
        nodes.push({
            id: i,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            label,
            status: 'unvisited'
        });
    }

    // Create edges - connect each node to every other node
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            const edge: Edge = { source: i, target: j };

            // Add weights if weighted option is enabled
            if (isWeighted) {
                // Generate random weight between 1 and 10
                edge.weight = Math.floor(Math.random() * 10) + 1;
            }

            edges.push(edge);
        }
    }

    return { nodes, edges };
};

// Generate a dense graph - has many but not all possible edges
const generateDenseGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Place nodes in a circle for consistent layout
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    // Create nodes positioned in a circle
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

    // Calculate maximum possible edges for an undirected graph
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;

    // For dense graph, we'll use about 70-80% of possible edges
    const densityFactor = 0.75;
    const targetEdgeCount = Math.floor(maxEdges * densityFactor);

    // First, ensure the graph is connected by adding n-1 edges (minimum spanning tree)
    for (let i = 0; i < nodeCount - 1; i++) {
        const edge: Edge = { source: i, target: i + 1 };

        if (isWeighted) {
            edge.weight = Math.floor(Math.random() * 10) + 1;
        }

        edges.push(edge);
    }

    // Add remaining edges randomly until we reach the target density
    // Create a list of all possible edges not yet added
    const possibleEdges: { source: number, target: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            // Skip edges already added in the spanning tree
            if (j !== i + 1 || i >= nodeCount - 1) {
                possibleEdges.push({ source: i, target: j });
            }
        }
    }

    // Shuffle the possible edges
    for (let i = possibleEdges.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [possibleEdges[i], possibleEdges[j]] = [possibleEdges[j], possibleEdges[i]];
    }

    // Add edges until we reach our target
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

// Generate a sparse graph - has very few edges
const generateSparseGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // For sparse graphs, we'll use a slightly different layout than a perfect circle
    // to better show the sparse structure
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    // Create nodes with a bit of randomness to the positions
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount;

        // Add slight randomness to radius for more natural look
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

    // Calculate maximum possible edges
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;

    // For sparse graph, use only about 15-20% of possible edges
    const sparsityFactor = 0.18;
    let targetEdgeCount = Math.max(nodeCount - 1, Math.floor(maxEdges * sparsityFactor));

    // Ensure we have at least a spanning tree to guarantee connectivity
    // For sparse graphs, we'll create a path-like or tree-like structure

    // First approach: Create a backbone path through all nodes
    for (let i = 0; i < nodeCount - 1; i++) {
        const edge: Edge = { source: i, target: i + 1 };

        if (isWeighted) {
            edge.weight = Math.floor(Math.random() * 10) + 1;
        }

        edges.push(edge);
    }

    // If we have more than just the minimum spanning tree edges to add
    if (targetEdgeCount > nodeCount - 1) {
        // Add a small number of additional edges to create some cycles or branches
        // but maintain the sparse nature

        // Create a list of possible additional edges
        const possibleEdges: { source: number, target: number }[] = [];
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                // Skip edges already in the path
                if (j !== i + 1 || i >= nodeCount - 1) {
                    possibleEdges.push({ source: i, target: j });
                }
            }
        }

        // Shuffle the possible edges
        for (let i = possibleEdges.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [possibleEdges[i], possibleEdges[j]] = [possibleEdges[j], possibleEdges[i]];
        }

        // Add edges until we reach our sparse target
        const remainingToAdd = Math.min(targetEdgeCount - (nodeCount - 1), possibleEdges.length);

        // For a more natural sparse graph, prioritize nearby nodes
        possibleEdges.sort((a, b) => {
            const distA = Math.abs(a.source - a.target);
            const distB = Math.abs(b.source - b.target);
            return distA - distB; // Sort by distance between node indices
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

// Generate a tree graph with improved aesthetics
const generateTreeGraph = (nodeCount: number, isWeighted: boolean): Graph => {
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

// Generate a connected graph that's not complete but ensures all nodes are reachable
const generateConnectedGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create nodes in a circular layout with some randomization
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    // Create the nodes
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount;
        // Add a bit of randomness to create a more organic layout
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

    // First ensure the graph is connected by creating a spanning tree
    // We'll use a path-like structure that visits each node
    const usedNodes = new Set<number>([0]); // Start with node 0
    const remainingNodes = new Set<number>();
    for (let i = 1; i < nodeCount; i++) {
        remainingNodes.add(i);
    }

    // Connect each node to an already used node
    while (remainingNodes.size > 0) {
        const sourceIds = Array.from(usedNodes);
        const sourceId = sourceIds[Math.floor(Math.random() * sourceIds.length)];

        // Find the nearest unused node
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
            // Add an edge between the source and the closest unused node
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

    // Add some more edges to make the graph less tree-like
    // We'll add approximately n/3 more edges between random nodes
    const additionalEdges = Math.floor(nodeCount / 3);

    for (let i = 0; i < additionalEdges; i++) {
        let source = Math.floor(Math.random() * nodeCount);
        let target = Math.floor(Math.random() * nodeCount);

        // Ensure we don't add duplicate edges or self-loops
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
            if (attempts > 20) break; // Avoid infinite loop
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

// Generate a disconnected graph with multiple components
const generateDisconnectedGraph = (nodeCount: number, isWeighted: boolean): Graph => {
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

// Generate a cyclic graph that explicitly contains cycles
const generateCyclicGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create nodes in a circular layout with some randomization
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    // Create the nodes
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount;
        // Add a bit of randomness to create a more organic layout
        const nodeRadius = radius * (0.85 + Math.random() * 0.3);
        const offsetAngle = angle + (Math.random() * 0.2 - 0.1);

        nodes.push({
            id: i,
            x: centerX + nodeRadius * Math.cos(offsetAngle),
            y: centerY + nodeRadius * Math.sin(offsetAngle),
            label: getLetterLabel(i),
            status: 'unvisited'
        });
    }

    // First ensure the graph is connected
    // We'll start by creating a spanning tree
    for (let i = 1; i < nodeCount; i++) {
        const edge: Edge = {
            source: Math.floor(Math.random() * i), // Connect to a random earlier node
            target: i
        };

        if (isWeighted) {
            edge.weight = Math.floor(Math.random() * 10) + 1;
        }

        edges.push(edge);
    }

    // Now create cycles by adding edges between nodes that are already connected indirectly
    // We'll create approximately n/2 cycles
    const numCycles = Math.max(1, Math.floor(nodeCount / 2));

    // Create a simple function to check if adding an edge would create a cycle
    // For simplicity, we'll add edges that are likely to create cycles
    for (let i = 0; i < numCycles; i++) {
        // Create edges that "close" the cycle by connecting nodes that are distance 2 or more apart
        const source = i % nodeCount;
        const target = (i + 2) % nodeCount;

        // Check if this edge already exists
        if (!edges.some(e =>
            (e.source === source && e.target === target) ||
            (e.source === target && e.target === source)
        )) {
            const edge: Edge = { source, target };

            if (isWeighted) {
                edge.weight = Math.floor(Math.random() * 10) + 1;
            }

            edges.push(edge);
        }
    }

    return { nodes, edges };
};

// Generate an acyclic graph (Directed Acyclic Graph - DAG)
const generateAcyclicGraph = (nodeCount: number, isWeighted: boolean): Graph => {
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

// Generate a grid graph
const generateGridGraph = (nodeCount: number, isWeighted: boolean): Graph => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Determine grid dimensions to make it as square as possible
    // Calculate the best grid dimensions based on the node count
    const gridWidth = Math.ceil(Math.sqrt(nodeCount));
    const gridHeight = Math.ceil(nodeCount / gridWidth);

    // Calculate the size of each grid cell to fit in the visible area
    const cellWidth = 320 / gridWidth;
    const cellHeight = 320 / gridHeight;

    // Starting position for the grid (centered)
    const startX = 40 + (cellWidth / 2);
    const startY = 40 + (cellHeight / 2);

    // Create nodes in grid layout
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

    // Create edges - connect adjacent nodes in the grid
    for (const node of nodes) {
        const gridX = node.gridX!;
        const gridY = node.gridY!;

        // Connect to right neighbor
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

        // Connect to bottom neighbor
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

// Helper function to convert number to letter label
function getLetterLabel(index: number): string {
    // For indices 0-25, return A-Z
    if (index < 26) {
        return String.fromCharCode(65 + index);
    }
    // For indices 26+, return AA, AB, etc.
    const firstChar = String.fromCharCode(65 + Math.floor((index - 26) / 26));
    const secondChar = String.fromCharCode(65 + ((index - 26) % 26));
    return firstChar + secondChar;
}

// Helper function to build adjacency list from edges
const buildAdjacencyList = (nodes: Node[], edges: Edge[], isDirected: boolean): number[][] => {
    const adjList: number[][] = Array(nodes.length).fill(null).map(() => []);

    edges.forEach(edge => {
        adjList[edge.source].push(edge.target);

        // For undirected graphs, add the reverse edge as well
        if (!isDirected) {
            adjList[edge.target].push(edge.source);
        }
    });

    // Remove duplicates from each adjacency list
    return adjList.map(neighbors => Array.from(new Set(neighbors)));
};

// BFS implementation
const initializeBFS = (graph: Graph, startNode: number, isDirected: boolean): BFSState => {
    const adjList = buildAdjacencyList(graph.nodes, graph.edges, isDirected);

    // Initialize BFS state
    const bfsState: BFSState = {
        queue: [startNode],
        visited: new Set<number>(),
        toVisit: new Set<number>([startNode]),
        history: [],
        currentStep: 0,
        isRunning: false,
        targetFound: false,
        pathFound: false,
        adjList
    };

    // Save initial state to history
    bfsState.history.push({
        queue: [...bfsState.queue],
        visited: new Set(bfsState.visited),
        toVisit: new Set(bfsState.toVisit)
    });

    return bfsState;
};

// Execute a single step of BFS
const stepBFS = (bfsState: BFSState, endNode: number | null): BFSState => {
    const { queue, visited, toVisit, adjList } = bfsState;

    // If queue is empty, there's nothing more to do
    if (queue.length === 0) {
        return { ...bfsState, isRunning: false, pathFound: false };
    }

    // Dequeue the first node
    const current = queue.shift()!;

    // Check if we reached the end node
    if (endNode !== null && current === endNode) {
        return {
            ...bfsState,
            queue: [...queue],
            visited: new Set([...visited, current]),
            toVisit: new Set(toVisit),
            isRunning: false,
            targetFound: true,
            pathFound: true,
            currentStep: bfsState.currentStep + 1
        };
    }

    // Mark as visited
    visited.add(current);
    toVisit.delete(current);

    // Get all adjacent vertices
    const neighbors = adjList[current];

    // For each adjacent vertex, if not visited and not in queue, add to queue
    for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && !toVisit.has(neighbor)) {
            queue.push(neighbor);
            toVisit.add(neighbor);

            // If this neighbor is the target, we'll find it in the next step
            if (endNode !== null && neighbor === endNode) {
                bfsState.targetFound = true;
            }
        }
    }

    // Save current state to history
    const newState = {
        ...bfsState,
        queue: [...queue],
        visited: new Set(visited),
        toVisit: new Set(toVisit),
        currentStep: bfsState.currentStep + 1
    };

    newState.history.push({
        queue: [...newState.queue],
        visited: new Set(newState.visited),
        toVisit: new Set(newState.toVisit)
    });

    return newState;
};

// Reset the BFS algorithm
const resetBFS = (graph: Graph, startNode: number, isDirected: boolean): BFSState => {
    return initializeBFS(graph, startNode, isDirected);
};

// Graph visualizer component
const GraphVisualizer: React.FC = () => {
    const [graphType, setGraphType] = useState<GraphType>('complete');
    const [algorithmType, setAlgorithmType] = useState<AlgorithmType>('none');
    const [nodeCount, setNodeCount] = useState<number>(5);
    const [isDirected, setIsDirected] = useState<boolean>(false);
    const [isWeighted, setIsWeighted] = useState<boolean>(false);
    const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
    const [draggedNode, setDraggedNode] = useState<number | null>(null);
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);
    const [startNode, setStartNode] = useState<number | null>(null);
    const [endNode, setEndNode] = useState<number | null>(null);
    const [bfsState, setBfsState] = useState<BFSState | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Pan and zoom state
    const [viewTransform, setViewTransform] = useState({
        x: 0,
        y: 0,
        scale: 1
    });
    const [isPanning, setIsPanning] = useState(false);
    const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });

    // Generate graph when parameters change
    useEffect(() => {
        let newGraph: Graph;

        switch (graphType) {
            case 'complete':
                newGraph = generateCompleteGraph(nodeCount, isWeighted);
                break;
            case 'dense':
                newGraph = generateDenseGraph(nodeCount, isWeighted);
                break;
            case 'sparse':
                newGraph = generateSparseGraph(nodeCount, isWeighted);
                break;
            case 'tree':
                newGraph = generateTreeGraph(nodeCount, isWeighted);
                break;
            case 'connected':
                newGraph = generateConnectedGraph(nodeCount, isWeighted);
                break;
            case 'disconnected':
                newGraph = generateDisconnectedGraph(nodeCount, isWeighted);
                break;
            case 'cyclic':
                newGraph = generateCyclicGraph(nodeCount, isWeighted);
                break;
            case 'acyclic':
                // For acyclic graph, force directed to be true since DAGs are directed by nature
                if (!isDirected) {
                    setIsDirected(true);
                }
                newGraph = generateAcyclicGraph(nodeCount, isWeighted);
                break;
            case 'grid':
                newGraph = generateGridGraph(nodeCount, isWeighted);
                break;
            default:
                newGraph = { nodes: [], edges: [] };
        }

        setGraph(newGraph);
        // Reset dragged node when graph changes
        setDraggedNode(null);
        // Reset start and end nodes
        setStartNode(null);
        setEndNode(null);
        // Reset BFS state
        setBfsState(null);
        // Reset algorithm type
        setAlgorithmType('none');
    }, [graphType, nodeCount, isWeighted, isDirected]);

    // Update node colors based on BFS state
    useEffect(() => {
        if (!bfsState || algorithmType !== 'bfs') return;

        // Update node statuses based on BFS state
        const updatedNodes = graph.nodes.map(node => {
            let status: 'unvisited' | 'queued' | 'visited' = 'unvisited';

            if (bfsState.visited.has(node.id)) {
                status = 'visited';
            } else if (bfsState.toVisit.has(node.id)) {
                status = 'queued';
            }

            return { ...node, status };
        });

        setGraph(prev => ({ ...prev, nodes: updatedNodes }));
    }, [bfsState, algorithmType]);

    // Simple zoom functions
    const zoomIn = () => {
        setViewTransform(prev => ({
            ...prev,
            scale: Math.min(5, prev.scale + 0.2)
        }));
    };

    const zoomOut = () => {
        setViewTransform(prev => ({
            ...prev,
            scale: Math.max(0.1, prev.scale - 0.2)
        }));
    };

    const resetView = () => {
        setViewTransform({ x: 0, y: 0, scale: 1 });
    };

    // Handle node dragging
    const handleNodeDrag = (nodeId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering pan
        setDraggedNode(nodeId);
    };

    // Handle panning
    const handlePanStart = (e: React.MouseEvent) => {
        // Only start panning if we're not dragging a node
        if (draggedNode === null) {
            setIsPanning(true);
            setStartPanPoint({ x: e.clientX, y: e.clientY });
        }
    };

    // Handle mouse movements for both node dragging and panning
    const handleMouseMove = (e: React.MouseEvent) => {
        // Handle panning
        if (isPanning) {
            const dx = e.clientX - startPanPoint.x;
            const dy = e.clientY - startPanPoint.y;

            setViewTransform(prev => ({
                ...prev,
                x: prev.x + dx,
                y: prev.y + dy
            }));

            setStartPanPoint({ x: e.clientX, y: e.clientY });
            return;
        }

        // Handle node dragging
        if (draggedNode === null) return;

        // Get SVG coordinates
        const svg = svgRef.current;
        if (!svg) return;

        const svgRect = svg.getBoundingClientRect();

        // Convert screen coordinates to SVG coordinates, accounting for transform
        const screenX = e.clientX - svgRect.left;
        const screenY = e.clientY - svgRect.top;

        // Convert to graph coordinates
        const x = (screenX - viewTransform.x) / viewTransform.scale;
        const y = (screenY - viewTransform.y) / viewTransform.scale;

        // Update node position
        setGraph(prevGraph => {
            const newNodes = [...prevGraph.nodes];
            const nodeIndex = newNodes.findIndex(node => node.id === draggedNode);

            if (nodeIndex !== -1) {
                newNodes[nodeIndex] = { ...newNodes[nodeIndex], x, y };
            }

            return { ...prevGraph, nodes: newNodes };
        });
    };

    // Handle mouse up for both dragging and panning
    const handleMouseUp = () => {
        setDraggedNode(null);
        setIsPanning(false);
    };

    // Handle keyboard events to mark start and end nodes
    const handleKeyDown = (e: KeyboardEvent) => {
        if (hoveredNode === null) return;

        // Handle 'S' key for marking start node
        if (e.key === 's' || e.key === 'S') {
            // If this node is already the start node, unmark it
            if (hoveredNode === startNode) {
                setStartNode(null);
                setBfsState(null);
            }
            // Prevent setting a node as both start and end
            else if (hoveredNode === endNode) {
                // Optionally show a message or visual indicator that this isn't allowed
                console.log("Can't set same node as both start and end");
                return;
            }
            // Otherwise mark it as the start node (replacing any previous start node)
            else {
                setStartNode(hoveredNode);
                // Reset BFS state when start node changes
                if (algorithmType === 'bfs') {
                    setBfsState(initializeBFS(graph, hoveredNode, isDirected));
                }
            }
        }

        // Handle 'E' key for marking end node
        if (e.key === 'e' || e.key === 'E') {
            // If this node is already the end node, unmark it
            if (hoveredNode === endNode) {
                setEndNode(null);
            }
            // Prevent setting a node as both start and end 
            else if (hoveredNode === startNode) {
                // Optionally show a message or visual indicator that this isn't allowed
                console.log("Can't set same node as both start and end");
                return;
            }
            // Otherwise mark it as the end node (replacing any previous end node)
            else {
                setEndNode(hoveredNode);
            }
        }
    };

    // Add/remove event listeners for keyboard
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [hoveredNode, startNode, endNode, algorithmType, graph, isDirected]);

    // Add/remove event listeners for algorithm controls
    useEffect(() => {
        if (algorithmType === 'bfs') {
            window.addEventListener('keydown', handleAlgorithmKeyDown);
            return () => {
                window.removeEventListener('keydown', handleAlgorithmKeyDown);
            };
        }
    }, [algorithmType, bfsState, startNode, endNode]);

    // Handle algorithm selection
    const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newAlgorithm = e.target.value as AlgorithmType;
        setAlgorithmType(newAlgorithm);

        // Initialize BFS if selected and we have a start node
        if (newAlgorithm === 'bfs' && startNode !== null) {
            setBfsState(initializeBFS(graph, startNode, isDirected));
        } else {
            setBfsState(null);

            // Reset node statuses
            setGraph(prev => ({
                ...prev,
                nodes: prev.nodes.map(node => ({ ...node, status: 'unvisited' }))
            }));
        }
    };

    // Handle step through BFS algorithm
    const handleBfsStepNext = () => {
        if (!bfsState || bfsState.queue.length === 0 || bfsState.pathFound) return;

        const newBfsState = stepBFS(bfsState, endNode);
        setBfsState(newBfsState);
    };

    // Handle reset BFS algorithm
    const handleBfsReset = () => {
        if (startNode === null) return;

        const newBfsState = resetBFS(graph, startNode, isDirected);
        setBfsState(newBfsState);
    };

    // Handle keyboard controls
    const handleAlgorithmKeyDown = (e: KeyboardEvent) => {
        // Right arrow key for next step
        if (e.key === 'ArrowRight') {
            handleBfsStepNext();
        }

        // 'R' key for reset
        if (e.key === 'r' || e.key === 'R') {
            handleBfsReset();
        }
    };

    return (
        <div className="flex flex-col items-center p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Graph Visualizer</h1>

            <div className="w-full mb-6 space-y-4">
                <div className="flex flex-col">
                    <label htmlFor="algorithm-type" className="mb-2 font-medium">
                        Algorithm:
                    </label>
                    <select
                        id="algorithm-type"
                        className="p-2 border border-gray-300 rounded"
                        value={algorithmType}
                        onChange={handleAlgorithmChange}
                    >
                        <option value="none">None</option>
                        <option value="bfs">Breadth-First Search (BFS)</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="graph-type" className="mb-2 font-medium">
                        Graph Type:
                    </label>
                    <select
                        id="graph-type"
                        className="p-2 border border-gray-300 rounded"
                        value={graphType}
                        onChange={(e) => setGraphType(e.target.value as GraphType)}
                    >
                        <option value="complete">Complete Graph (K{nodeCount})</option>
                        <option value="dense">Dense Graph</option>
                        <option value="sparse">Sparse Graph</option>
                        <option value="tree">Tree Graph</option>
                        <option value="connected">Connected Graph</option>
                        <option value="disconnected">Disconnected Graph</option>
                        <option value="cyclic">Cyclic Graph</option>
                        <option value="acyclic">Acyclic Graph</option>
                        <option value="grid">Grid Graph</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="node-count" className="mb-2 font-medium">
                        Number of Nodes: {nodeCount}
                    </label>
                    <input
                        id="node-count"
                        type="range"
                        min="2"
                        max="100"
                        value={nodeCount}
                        onChange={(e) => setNodeCount(parseInt(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div className="flex space-x-6">
                    <div className="flex items-center">
                        <input
                            id="directed"
                            type="checkbox"
                            checked={isDirected}
                            onChange={(e) => setIsDirected(e.target.checked)}
                            className="mr-2 h-4 w-4"
                        />
                        <label htmlFor="directed" className="font-medium">
                            Directed Graph
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="weighted"
                            type="checkbox"
                            checked={isWeighted}
                            onChange={(e) => setIsWeighted(e.target.checked)}
                            className="mr-2 h-4 w-4"
                        />
                        <label htmlFor="weighted" className="font-medium">
                            Weighted Graph
                        </label>
                    </div>
                </div>
            </div>



            <div className="border border-gray-300 rounded-lg p-4 w-full relative">
                {/* Debug info */}
                <div className="absolute top-2 left-2 bg-white/70 p-1 text-xs z-10 rounded">
                    Scale: {viewTransform.scale.toFixed(2)} | X: {viewTransform.x.toFixed(0)} Y: {viewTransform.y.toFixed(0)}
                </div>

                {/* Graph type indicator */}
                <div className="absolute top-2 right-24 bg-white/70 p-1 text-sm z-10 rounded font-bold">
                    {graphType === 'complete'
                        ? 'Complete Graph'
                        : graphType === 'dense'
                            ? 'Dense Graph'
                            : graphType === 'sparse'
                                ? 'Sparse Graph'
                                : graphType === 'tree'
                                    ? 'Tree Graph'
                                    : graphType === 'connected'
                                        ? 'Connected Graph'
                                        : graphType === 'disconnected'
                                            ? 'Disconnected Graph'
                                            : graphType === 'cyclic'
                                                ? 'Cyclic Graph'
                                                : graphType === 'acyclic'
                                                    ? 'Acyclic Graph'
                                                    : 'Grid Graph'}
                </div>

                {/* Instructions for start/end nodes */}
                <div className="absolute bottom-2 left-2 bg-white/70 p-1 text-xs z-10 rounded">
                    Hover over a node and press <span className="font-bold">S</span> to mark start node, <span className="font-bold">E</span> to mark end node
                    <br />
                    <span className="text-red-500">Note: Start and end cannot be the same node</span>
                </div>

                <svg
                    ref={svgRef}
                    width="400"
                    height="400"
                    viewBox="0 0 400 400"
                    className="mx-auto bg-gray-50"
                    onMouseDown={handlePanStart}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ touchAction: 'none' }}
                >
                    {/* Background rect to ensure the SVG is visible and clickable */}
                    <rect x="0" y="0" width="400" height="400" fill="white" />

                    {/* SVG transformation group for pan and zoom */}
                    <g transform={`translate(${viewTransform.x} ${viewTransform.y}) scale(${viewTransform.scale})`}>
                        {/* Draw edges */}
                        {graph.edges.map((edge, index) => {
                            const sourceNode = graph.nodes.find(n => n.id === edge.source);
                            const targetNode = graph.nodes.find(n => n.id === edge.target);

                            if (!sourceNode || !targetNode) return null;

                            // Calculate the midpoint of the edge for weight label and arrow marker
                            const midX = (sourceNode.x + targetNode.x) / 2;
                            const midY = (sourceNode.y + targetNode.y) / 2;

                            // Calculate angle for directed graph arrows
                            const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x) * 180 / Math.PI;

                            // Calculate slight offset for weight label (perpendicular to the edge)
                            const perpAngle = angle + 90;
                            const offset = 15;
                            const labelX = midX + (offset * Math.cos(perpAngle * Math.PI / 180));
                            const labelY = midY + (offset * Math.sin(perpAngle * Math.PI / 180));

                            return (
                                <g key={`edge-${index}`}>
                                    {/* Edge line */}
                                    <line
                                        x1={sourceNode.x}
                                        y1={sourceNode.y}
                                        x2={targetNode.x}
                                        y2={targetNode.y}
                                        stroke={
                                            graphType === 'tree'
                                                ? '#555'
                                                : graphType === 'cyclic'
                                                    ? '#E64A19'
                                                    : graphType === 'acyclic'
                                                        ? '#1976D2'
                                                        : graphType === 'grid'
                                                            ? '#7B1FA2' // Dark purple for grid
                                                            : 'black'
                                        }
                                        strokeWidth={
                                            graphType === 'tree' ||
                                                graphType === 'cyclic' ||
                                                graphType === 'acyclic' ||
                                                graphType === 'grid'
                                                ? 1.5
                                                : 1
                                        }
                                    />

                                    {/* Arrow for directed graph */}
                                    {isDirected && (
                                        <g transform={`translate(${midX},${midY}) rotate(${angle})`}>
                                            <polygon
                                                points="-12,-6 0,0 -12,6"
                                                fill="black"
                                            />
                                        </g>
                                    )}

                                    {/* Weight label for weighted graph */}
                                    {isWeighted && edge.weight && (
                                        <g transform={`translate(${labelX},${labelY})`}>
                                            <circle r="10" fill="white" stroke="gray" strokeWidth="1" />
                                            <text
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fontSize="10px"
                                                fontWeight="bold"
                                            >
                                                {edge.weight}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}

                        {/* Draw nodes */}
                        {graph.nodes.map((node) => {
                            // Determine fill color based on graph type, node state (start/end), and algorithm status
                            let fillColor = '#4CAF50'; // Default green color

                            // Set color based on algorithm status
                            if (algorithmType === 'bfs') {
                                if (node.status === 'visited') {
                                    fillColor = '#000000'; // Black for visited
                                } else if (node.status === 'queued') {
                                    fillColor = '#444444'; // Dark grey for in queue
                                } else {
                                    // If not visited or in queue, use regular coloring logic
                                    const isStartNode = node.id === startNode;
                                    const isEndNode = node.id === endNode;

                                    if (isStartNode) {
                                        fillColor = '#76FF03'; // Lime green for start node
                                    } else if (isEndNode) {
                                        fillColor = '#00B0FF'; // Bright blue for end node
                                    } else {
                                        // Graph type specific colors
                                        const isTreeGraph = graphType === 'tree';
                                        const isDisconnectedGraph = graphType === 'disconnected';
                                        const isCyclicGraph = graphType === 'cyclic';
                                        const isAcyclicGraph = graphType === 'acyclic';
                                        const isGridGraph = graphType === 'grid';

                                        if (isTreeGraph) {
                                            // Estimate node level based on y-coordinate
                                            const normalizedY = (node.y - 50) / 330; // Normalize between 0-1
                                            // Create a gradient from dark green to light green based on level
                                            const r = Math.floor(60 + normalizedY * 150);
                                            const g = Math.floor(180 - normalizedY * 40);
                                            const b = Math.floor(60 + normalizedY * 120);
                                            fillColor = `rgb(${r}, ${g}, ${b})`;
                                        } else if (isDisconnectedGraph && node.component !== undefined) {
                                            // Use different colors for different components
                                            const componentColors = [
                                                '#4285F4', // Blue
                                                '#EA4335', // Red
                                                '#FBBC05', // Yellow
                                                '#34A853', // Green
                                                '#8F3985', // Purple
                                                '#00A4BD'  // Teal
                                            ];
                                            fillColor = componentColors[node.component % componentColors.length];
                                        } else if (isCyclicGraph) {
                                            // Use a orange-red gradient for cyclic graphs
                                            fillColor = '#FF7043'; // Orange-red
                                        } else if (isAcyclicGraph) {
                                            // For acyclic (DAG), color based on layer (y-position)
                                            const normalizedY = (node.y - 50) / 330; // Normalize between 0-1
                                            // Create a blue gradient based on layer
                                            const r = Math.floor(30 + normalizedY * 100);
                                            const g = Math.floor(100 + normalizedY * 100);
                                            const b = Math.floor(180 + normalizedY * 75);
                                            fillColor = `rgb(${r}, ${g}, ${b})`;
                                        } else if (isGridGraph) {
                                            // For grid graph, use a purple color
                                            fillColor = '#9C27B0'; // Purple
                                        }
                                    }
                                }
                            } else {
                                // If no algorithm is running, use regular coloring logic
                                const isStartNode = node.id === startNode;
                                const isEndNode = node.id === endNode;

                                if (isStartNode) {
                                    fillColor = '#76FF03'; // Lime green for start node
                                } else if (isEndNode) {
                                    fillColor = '#00B0FF'; // Bright blue for end node
                                } else {
                                    // Graph type specific colors
                                    const isTreeGraph = graphType === 'tree';
                                    const isDisconnectedGraph = graphType === 'disconnected';
                                    const isCyclicGraph = graphType === 'cyclic';
                                    const isAcyclicGraph = graphType === 'acyclic';
                                    const isGridGraph = graphType === 'grid';

                                    if (isTreeGraph) {
                                        // Estimate node level based on y-coordinate
                                        const normalizedY = (node.y - 50) / 330; // Normalize between 0-1
                                        // Create a gradient from dark green to light green based on level
                                        const r = Math.floor(60 + normalizedY * 150);
                                        const g = Math.floor(180 - normalizedY * 40);
                                        const b = Math.floor(60 + normalizedY * 120);
                                        fillColor = `rgb(${r}, ${g}, ${b})`;
                                    } else if (isDisconnectedGraph && node.component !== undefined) {
                                        // Use different colors for different components
                                        const componentColors = [
                                            '#4285F4', // Blue
                                            '#EA4335', // Red
                                            '#FBBC05', // Yellow
                                            '#34A853', // Green
                                            '#8F3985', // Purple
                                            '#00A4BD'  // Teal
                                        ];
                                        fillColor = componentColors[node.component % componentColors.length];
                                    } else if (isCyclicGraph) {
                                        // Use a orange-red gradient for cyclic graphs
                                        fillColor = '#FF7043'; // Orange-red
                                    } else if (isAcyclicGraph) {
                                        // For acyclic (DAG), color based on layer (y-position)
                                        const normalizedY = (node.y - 50) / 330; // Normalize between 0-1
                                        // Create a blue gradient based on layer
                                        const r = Math.floor(30 + normalizedY * 100);
                                        const g = Math.floor(100 + normalizedY * 100);
                                        const b = Math.floor(180 + normalizedY * 75);
                                        fillColor = `rgb(${r}, ${g}, ${b})`;
                                    } else if (isGridGraph) {
                                        // For grid graph, use a purple color
                                        fillColor = '#9C27B0'; // Purple
                                    }
                                }
                            }

                            // Additional styling for hovered node
                            const isHovered = node.id === hoveredNode;
                            const hoverStroke = isHovered ? '#FFC107' : 'black'; // Yellow stroke for hovered node
                            const hoverStrokeWidth = isHovered ? 2 : 1;

                            return (
                                <g
                                    key={`node-${node.id}`}
                                    onMouseDown={(e) => handleNodeDrag(node.id, e)}
                                    onMouseEnter={() => setHoveredNode(node.id)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    style={{ cursor: 'grab' }}
                                >
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r="12"
                                        fill={fillColor}
                                        stroke={hoverStroke}
                                        strokeWidth={hoverStrokeWidth}
                                    />
                                    <text
                                        x={node.x}
                                        y={node.y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill={node.status === 'visited' ? '#FFFFFF' : (node.status === 'queued' ? '#FFFFFF' : '#FFFFFF')}
                                        fontWeight="bold"
                                        fontSize="12px"
                                    >
                                        {node.label}
                                    </text>

                                    {/* Indicator for start/end nodes */}
                                    {node.id === startNode && (
                                        <text
                                            x={node.x}
                                            y={node.y - 20}
                                            textAnchor="middle"
                                            fill="#76FF03"
                                            fontWeight="bold"
                                            fontSize="12px"
                                        >
                                            Start
                                        </text>
                                    )}
                                    {node.id === endNode && (
                                        <text
                                            x={node.x}
                                            y={node.y - 20}
                                            textAnchor="middle"
                                            fill="#00B0FF"
                                            fontWeight="bold"
                                            fontSize="12px"
                                        >
                                            End
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </g>

                    {/* Zoom controls */}
                    <g className="zoom-controls" transform="translate(350, 20)">
                        {/* Zoom In Button */}
                        <g onClick={zoomIn} style={{ cursor: 'pointer' }}>
                            <circle r="15" fill="white" stroke="gray" strokeWidth="1" />
                            <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fontSize="20px" pointerEvents="none">+</text>
                        </g>

                        {/* Zoom Out Button */}
                        <g transform="translate(0, 40)" onClick={zoomOut} style={{ cursor: 'pointer' }}>
                            <circle r="15" fill="white" stroke="gray" strokeWidth="1" />
                            <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fontSize="20px" pointerEvents="none">−</text>
                        </g>

                        {/* Reset Button */}
                        <g transform="translate(0, 80)" onClick={resetView} style={{ cursor: 'pointer' }}>
                            <circle r="15" fill="white" stroke="gray" strokeWidth="1" />
                            <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fontSize="14px" pointerEvents="none">R</text>
                        </g>
                    </g>
                </svg>

                {/* Error message if graph is empty */}
                {graph.nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                        <p className="text-red-500 font-bold">No graph to display. Try changing parameters.</p>
                    </div>
                )}
            </div>

            {/* BFS Controls and Info (below graph) */}
            {algorithmType === 'bfs' && (
                <div className="mt-4 w-full">
                    <div className="flex justify-between items-center mb-2 bg-gray-100 p-3 rounded border border-gray-300">
                        <h3 className="font-bold">BFS Control</h3>

                        <div className="flex space-x-2">
                            <button
                                onClick={handleBfsReset}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                disabled={startNode === null}
                            >
                                Reset (R)
                            </button>
                            <button
                                onClick={handleBfsStepNext}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                disabled={!bfsState || bfsState.queue.length === 0 || (bfsState && bfsState.pathFound)}
                            >
                                Step Next (→)
                            </button>
                        </div>
                    </div>

                    {/* Path Messages */}
                    {bfsState && bfsState.pathFound && (
                        <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-2 rounded mb-4">
                            <p className="font-bold">Path Found! 🎉</p>
                            <p>Target node reached after {bfsState.currentStep} steps.</p>
                        </div>
                    )}

                    {bfsState && bfsState.queue.length === 0 && !bfsState.pathFound && bfsState.currentStep > 0 && (
                        <div className="bg-yellow-100 border border-yellow-500 text-yellow-700 px-4 py-2 rounded mb-4">
                            <p className="font-bold">Path Not Found!</p>
                            <p>Explored all reachable nodes ({bfsState.visited.size} nodes) but could not reach the target.</p>
                        </div>
                    )}

                    {/* Queue and Visited Display (horizontal layout) */}
                    <div className="flex gap-4">
                        <div className="flex-1 bg-gray-100 p-3 rounded border border-gray-300">
                            <h4 className="font-medium mb-2">Queue:</h4>
                            <div className="flex items-center">
                                {bfsState?.queue.length === 0 ? (
                                    <span className="italic text-gray-500">Empty</span>
                                ) : (
                                    <span>
                                        {bfsState?.queue.map((nodeId, index) => (
                                            <span key={`queue-${nodeId}`}>
                                                <span className="font-bold">{graph.nodes.find(n => n.id === nodeId)?.label || nodeId}</span>
                                                {index < bfsState.queue.length - 1 && <span className="mx-1">←</span>}
                                            </span>
                                        ))}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 bg-gray-100 p-3 rounded border border-gray-300">
                            <h4 className="font-medium mb-2">Visited Nodes:</h4>
                            <div className="flex items-center">
                                {bfsState?.visited.size === 0 ? (
                                    <span className="italic text-gray-500">None</span>
                                ) : (
                                    <span>
                                        {Array.from(bfsState?.visited || []).map((nodeId, index, array) => (
                                            <span key={`visited-${nodeId}`}>
                                                <span className="font-bold">{graph.nodes.find(n => n.id === nodeId)?.label || nodeId}</span>
                                                {index < array.length - 1 && <span className="mx-1">,</span>}
                                            </span>
                                        ))}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GraphVisualizer;