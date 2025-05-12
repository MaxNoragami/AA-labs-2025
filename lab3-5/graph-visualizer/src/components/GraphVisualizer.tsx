import React, { useState, useEffect, useRef } from 'react';
import { Graph, Node, Edge, GraphType, AlgorithmType, BFSState, DFSState, DijkstraState, FloydWarshallState, KruskalState } from '../types';
import { generateGraph } from '../generators';
import { initializeBFS, stepBFS, resetBFS, initializeDFS, stepDFS, resetDFS, initializeDijkstra, stepDijkstra, resetDijkstra, getShortestPath, initializeFloydWarshall, stepFloydWarshall, getFloydWarshallPath, initializeKruskal, stepKruskal, getShortestPathInMST } from '../algorithms';

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
    const [dfsState, setDfsState] = useState<DFSState | null>(null);
    const [dijkstraState, setDijkstraState] = useState<DijkstraState | null>(null);
    const [floydWarshallState, setFloydWarshallState] = useState<FloydWarshallState | null>(null);
    const [kruskalState, setKruskalState] = useState<KruskalState | null>(null);
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
        let newGraph: Graph = generateGraph(graphType, nodeCount, isWeighted, isDirected);

        // For acyclic graphs, force directed to be true
        if (graphType === 'acyclic' && !isDirected) {
            setIsDirected(true);
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
        if (algorithmType === 'bfs' && bfsState) {
            // Update node statuses based on BFS state
            const updatedNodes = graph.nodes.map(node => {
                let status: 'unvisited' | 'queued' | 'visited' = 'unvisited';

                if (bfsState.visited.has(node.id)) {
                    status = 'visited';
                } else if (bfsState.toVisit.has(node.id)) {
                    status = 'queued';
                }

                // In the BFS useEffect:
                return {
                    ...node,
                    status,
                    // Reset the distance property if it exists
                    ...(('distance' in node) ? { distance: undefined } : {})
                };

                // Same for DFS
            });

            setGraph(prev => ({ ...prev, nodes: updatedNodes }));
        } else if (algorithmType === 'dfs' && dfsState) {
            // Update node statuses based on DFS state
            const updatedNodes = graph.nodes.map(node => {
                let status: 'unvisited' | 'queued' | 'visited' = 'unvisited';

                if (dfsState.visited.has(node.id)) {
                    status = 'visited';
                } else if (dfsState.toVisit.has(node.id)) {
                    status = 'queued';
                }

                // In the BFS useEffect:
                return {
                    ...node,
                    status,
                    // Reset the distance property if it exists
                    ...(('distance' in node) ? { distance: undefined } : {})
                };

                // Same for DFS
            });

            setGraph(prev => ({ ...prev, nodes: updatedNodes }));
        }
        else if (algorithmType === 'dijkstra' && dijkstraState) {
            // Update node statuses based on Dijkstra state
            const updatedNodes = graph.nodes.map(node => {
                let status: 'unvisited' | 'queued' | 'visited' = 'unvisited';
                let dijkstraStatus: 'unprocessed' | 'inQueue' | 'processed' = 'unprocessed';

                // Determine node status
                if (dijkstraState.visited.has(node.id)) {
                    status = 'visited';
                    dijkstraStatus = 'processed'; // Blue
                } else if (dijkstraState.toVisit.has(node.id)) {
                    status = 'queued';
                    dijkstraStatus = 'inQueue'; // Yellow
                }

                // Only show distances for processed nodes
                const distance = dijkstraState.nodeToDistanceMap[node.id] !== undefined
                    ? dijkstraState.nodeToDistanceMap[node.id]
                    : Infinity;

                return {
                    ...node,
                    status,
                    dijkstraStatus,
                    distance
                };
            });

            setGraph(prev => ({ ...prev, nodes: updatedNodes }));
        }
    }, [bfsState, dfsState, dijkstraState, algorithmType, graph.nodes]);



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
        if (algorithmType === 'bfs' || algorithmType === 'dfs') {
            window.addEventListener('keydown', handleAlgorithmKeyDown);
            return () => {
                window.removeEventListener('keydown', handleAlgorithmKeyDown);
            };
        }
    }, [algorithmType, bfsState, dfsState, startNode, endNode]);

    // Update the algorithm change handler
    const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newAlgorithm = e.target.value as AlgorithmType;
        setAlgorithmType(newAlgorithm);

        // Force weighted to be true when Dijkstra is selected
        if (newAlgorithm === 'dijkstra' && !isWeighted) {
            setIsWeighted(true);
        }

        // Initialize algorithm if selected and we have a start node
        if (startNode !== null) {
            if (newAlgorithm === 'bfs') {
                setBfsState(initializeBFS(graph, startNode, isDirected));
                setDfsState(null);
                setDijkstraState(null);
            } else if (newAlgorithm === 'dfs') {
                setDfsState(initializeDFS(graph, startNode, isDirected));
                setBfsState(null);
                setDijkstraState(null);
            } else if (newAlgorithm === 'dijkstra') {
                setDijkstraState(initializeDijkstra(graph, startNode, isDirected));
                setBfsState(null);
                setDfsState(null);
            } else if (newAlgorithm === 'floydWarshall') {
                setFloydWarshallState(initializeFloydWarshall(graph, startNode, isDirected));
                setBfsState(null);
                setDfsState(null);
                setDijkstraState(null);

                // Force weighted to be true when Floyd-Warshall is selected
                if (!isWeighted) {
                    setIsWeighted(true);
                }
            } else if (newAlgorithm === 'kruskal') {
                setKruskalState(initializeKruskal(graph));
                setBfsState(null);
                setDfsState(null);
                setDijkstraState(null);
                setFloydWarshallState(null);

                // Force weighted to be true when Kruskal is selected
                if (!isWeighted) {
                    setIsWeighted(true);
                }
            }else {
                setBfsState(null);
                setDfsState(null);
                setDijkstraState(null);
            }
        } else {
            setBfsState(null);
            setDfsState(null);
            setDijkstraState(null);
        }

        // Reset node statuses when changing algorithms
        setGraph(prev => ({
            ...prev,
            nodes: prev.nodes.map(node => ({ ...node, status: 'unvisited' }))
        }));
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

    // Handle step through DFS algorithm
    const handleDfsStepNext = () => {
        if (!dfsState || dfsState.stack.length === 0 || dfsState.pathFound) return;

        const newDfsState = stepDFS(dfsState, endNode);
        setDfsState(newDfsState);
    };

    const handleKruskalStepNext = () => {
        if (!kruskalState || kruskalState.completed) return;

        const newKruskalState = stepKruskal(kruskalState);
        setKruskalState(newKruskalState);
    };

    const handleKruskalReset = () => {
        setKruskalState(initializeKruskal(graph));
    };

    // Handle reset DFS algorithm
    const handleDfsReset = () => {
        if (startNode === null) return;

        const newDfsState = resetDFS(graph, startNode, isDirected);
        setDfsState(newDfsState);
    };

    const handleFloydWarshallStepNext = () => {
        if (!floydWarshallState || floydWarshallState.completed) return;

        const newFloydWarshallState = stepFloydWarshall(floydWarshallState);
        setFloydWarshallState(newFloydWarshallState);
    };

    const handleFloydWarshallReset = () => {
        setFloydWarshallState(initializeFloydWarshall(graph, startNode, isDirected));
    };

    // Add these functions for Dijkstra controls
    const handleDijkstraStepNext = () => {
        if (!dijkstraState || dijkstraState.priorityQueue.length === 0 || dijkstraState.pathFound) return;

        const newDijkstraState = stepDijkstra(dijkstraState, endNode);
        setDijkstraState(newDijkstraState);
    };

    const handleDijkstraReset = () => {
        if (startNode === null) return;

        const newDijkstraState = resetDijkstra(graph, startNode, isDirected);
        setDijkstraState(newDijkstraState);
    };

    // Update the keyboard event handler
    const handleAlgorithmKeyDown = (e: KeyboardEvent) => {
        // Right arrow key for next step
        if (e.key === 'ArrowRight') {
            if (algorithmType === 'bfs') {
                handleBfsStepNext();
            } else if (algorithmType === 'dfs') {
                handleDfsStepNext();
            } else if (algorithmType === 'dijkstra') {
                handleDijkstraStepNext();
            }
            else if (algorithmType === 'floydWarshall') {
                handleFloydWarshallStepNext();
            }
            else if (algorithmType === 'kruskal') {
                handleKruskalStepNext();
            }
        }

        // 'R' key for reset
        if (e.key === 'r' || e.key === 'R') {
            if (algorithmType === 'bfs') {
                handleBfsReset();
            } else if (algorithmType === 'dfs') {
                handleDfsReset();
            } else if (algorithmType === 'dijkstra') {
                handleDijkstraReset();
            }
            else if (algorithmType === 'floydWarshall') {
                handleFloydWarshallReset();
            }
            else if (algorithmType === 'kruskal') {
                handleKruskalReset();
            }
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
                        <option value="dfs">Depth-First Search (DFS)</option>
                        <option value="dijkstra">Dijkstra's Algorithm</option>
                        <option value="floydWarshall">Floyd-Warshall Algorithm</option>
                        <option value="kruskal">Kruskal's Minimum Spanning Tree</option>
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
                            disabled={algorithmType === 'dijkstra'} // Disable when Dijkstra is selected
                            className="mr-2 h-4 w-4"
                        />
                        <label htmlFor="weighted" className="font-medium">
                            Weighted Graph{algorithmType === 'dijkstra' ? ' (Required for Dijkstra)' : ''}
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

                            // Determine edge styling based on algorithm
                            let edgeOpacity = 1.0;
                            let strokeColor;
                            let strokeWidth = 1;
                            
                            // Determine if this edge is part of the shortest path
                            let isInShortestPath = false;
                            // For Kruskal algorithm
                            if (algorithmType === 'kruskal' && kruskalState) {
                                // Default all edges to faded
                                edgeOpacity = 0.3;
                                strokeColor = graphType === 'tree' ? '#555' :
                                    graphType === 'cyclic' ? '#E64A19' :
                                        graphType === 'acyclic' ? '#1976D2' :
                                            graphType === 'grid' ? '#7B1FA2' : 'black';

                                // Check if this is the current edge being examined
                                const isCurrentEdge = kruskalState.currentEdgeIndex >= 0 &&
                                    kruskalState.currentEdgeIndex < kruskalState.sortedEdges.length && // Bounds check
                                    kruskalState.sortedEdges[kruskalState.currentEdgeIndex].source === edge.source &&
                                    kruskalState.sortedEdges[kruskalState.currentEdgeIndex].target === edge.target;

                                // Check if this edge is in the MST
                                const isInMST = kruskalState.mstEdges.some((e: Edge) =>
                                    (e.source === edge.source && e.target === edge.target) ||
                                    (!isDirected && e.source === edge.target && e.target === edge.source)
                                );

                                // Check if edge is part of shortest path between start and end nodes
                                let isInPath = false;
                                if (kruskalState.completed && startNode !== null && endNode !== null) {
                                    const path = getShortestPathInMST(kruskalState.mstEdges, startNode, endNode, graph.nodes.length);
                                    // Check if this edge is part of the path
                                    for (let i = 0; i < path.length - 1; i++) {
                                        if ((edge.source === path[i] && edge.target === path[i + 1]) ||
                                            (!isDirected && edge.source === path[i + 1] && edge.target === path[i])) {
                                            isInPath = true;
                                            break;
                                        }
                                    }
                                }

                                // First check if the edge is part of a path (this has highest priority)
                                if (isInPath) {
                                    // Edges in shortest path are pink and fully opaque
                                    strokeColor = '#FF4081'; // Pink
                                    edgeOpacity = 1.0;
                                    strokeWidth = 3;
                                }
                                // Then check if algorithm is completed
                                else if (kruskalState.completed) {
                                    if (isInMST) {
                                        // MST edge styling when completed
                                        strokeColor = graphType === 'tree' ? '#555' :
                                            graphType === 'cyclic' ? '#E64A19' :
                                                graphType === 'acyclic' ? '#1976D2' :
                                                    graphType === 'grid' ? '#7B1FA2' : 'black';
                                        edgeOpacity = 1.0;
                                        strokeWidth = 2;
                                    } else {
                                        // Non-MST edge styling when completed
                                        edgeOpacity = 0.3;
                                        strokeWidth = 1;
                                    }
                                }
                                // Finally handle in-progress styling
                                else {
                                    if (isCurrentEdge) {
                                        // Current edge being examined is blue and fully opaque
                                        strokeColor = '#2196F3'; // Blue
                                        edgeOpacity = 1.0;
                                        strokeWidth = 2;
                                    } else if (isInMST) {
                                        // Edges in MST are normal color and fully opaque
                                        edgeOpacity = 1.0;
                                        strokeWidth = 2;
                                    }
                                }
                            }
                            if (algorithmType === 'floydWarshall' && floydWarshallState &&
                                floydWarshallState.completed && startNode !== null && endNode !== null) {
                                const path = getFloydWarshallPath(floydWarshallState, startNode, endNode);
                                // Check if this edge is part of the path
                                for (let i = 0; i < path.length - 1; i++) {
                                    if ((edge.source === path[i] && edge.target === path[i + 1]) ||
                                        (!isDirected && edge.source === path[i + 1] && edge.target === path[i])) {
                                        isInShortestPath = true;
                                        break;
                                    }
                                }
                            }

                            else if (algorithmType === 'dijkstra' && dijkstraState &&
                                dijkstraState.pathFound && startNode !== null && endNode !== null) {
                                const path = getShortestPath(dijkstraState, endNode);
                                // Check if this edge is part of the path
                                for (let i = 0; i < path.length - 1; i++) {
                                    if ((edge.source === path[i] && edge.target === path[i + 1]) ||
                                        (!isDirected && edge.source === path[i + 1] && edge.target === path[i])) {
                                        isInShortestPath = true;
                                        break;
                                    }
                                }
                            }

                            return (
                                <g key={`edge-${index}`}>
                                    {/* Edge line */}
                                    <line
                                        x1={sourceNode.x}
                                        y1={sourceNode.y}
                                        x2={targetNode.x}
                                        y2={targetNode.y}
                                        stroke={
                                            isInShortestPath ? '#FF4081' : // Bright pink for shortest path
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
                                            isInShortestPath ? 3 : // Thicker line for shortest path
                                                graphType === 'tree' ||
                                                    graphType === 'cyclic' ||
                                                    graphType === 'acyclic' ||
                                                    graphType === 'grid'
                                                    ? 1.5
                                                    : 1
                                        }
                                        opacity={edgeOpacity}
                                        strokeDasharray={isInShortestPath ? "none" : "none"}
                                    />

                                    {/* Arrow for directed graph */}
                                    {isDirected && (
                                        <g transform={`translate(${midX},${midY}) rotate(${angle})`} opacity={edgeOpacity}>
                                            <polygon
                                                points="-12,-6 0,0 -12,6"
                                                fill={strokeColor}
                                            />
                                        </g>
                                    )}

                                    {/* Weight label for weighted graph */}
                                    {/* Weight label for weighted graph */}
                                    {isWeighted && edge.weight && (
                                        <g transform={`translate(${labelX},${labelY})`} opacity={edgeOpacity}>
                                            <circle
                                                r="10"
                                                fill="white"
                                                stroke="gray"
                                                strokeWidth="1"
                                            />
                                            <text
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fontSize="10px"
                                                fontWeight="bold"
                                                fill="black"
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
                            if (algorithmType === 'dijkstra') {
                                const isInShortestPath = dijkstraState && dijkstraState.pathFound &&
                                    startNode !== null && endNode !== null &&
                                    node.id !== startNode && node.id !== endNode &&
                                    getShortestPath(dijkstraState, endNode).includes(node.id);

                                if (isInShortestPath) {
                                    fillColor = '#E91E63'; // Pink for nodes in shortest path (matching Floyd-Warshall)
                                } else if (node.dijkstraStatus === 'processed') {
                                    fillColor = '#2196F3'; // Blue for processed nodes
                                } else if (node.dijkstraStatus === 'inQueue') {
                                    fillColor = '#FFC107'; // Yellow for nodes in queue
                                } else {
                                    // Regular coloring logic for unprocessed nodes
                                    const isStartNode = node.id === startNode;
                                    const isEndNode = node.id === endNode;

                                    if (isStartNode) {
                                        fillColor = '#76FF03'; // Lime green for start node
                                    } else if (isEndNode) {
                                        fillColor = '#00B0FF'; // Bright blue for end node
                                    } else {
                                        // Use default coloring for other nodes
                                        fillColor = '#4CAF50';
                                    }
                                }
                            }
                            
                            else if (algorithmType === 'floydWarshall') {
                                // Highlight nodes differently based on Floyd-Warshall state
                                if (floydWarshallState && floydWarshallState.currentK >= 0) {
                                    if (node.id === startNode) {
                                        fillColor = '#76FF03'; // Start node
                                    } else if (node.id === endNode) {
                                        fillColor = '#00B0FF'; // End node
                                    } else if (node.id === floydWarshallState.currentK) {
                                        fillColor = '#FFC107'; // Current k node (yellow)
                                    } else if (
                                        floydWarshallState.completed &&
                                        startNode !== null &&
                                        endNode !== null &&
                                        getFloydWarshallPath(floydWarshallState, startNode, endNode).includes(node.id)
                                    ) {
                                        fillColor = '#E91E63'; // Node in shortest path (pink)
                                    } else {
                                        // Default color
                                        fillColor = '#4CAF50';
                                    }
                                }
                            }
                            else
                            if (algorithmType === 'bfs' || algorithmType === 'dfs') {
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

                                    {/* Show distance for Dijkstra algorithm */}
                                    {algorithmType === 'dijkstra' && dijkstraState &&
                                        (node.dijkstraStatus === 'processed' || node.id === startNode) && (
                                            <g>
                                                <circle
                                                    cx={node.x}
                                                    cy={node.y + 25}
                                                    r="12"
                                                    fill="#4CAF50"
                                                    opacity="0.9"
                                                />
                                                <text
                                                    x={node.x}
                                                    y={node.y + 25}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    fill="#FFFFFF"
                                                    fontWeight="bold"
                                                    fontSize="10px"
                                                >
                                                    {node.distance === undefined || node.distance === Infinity ? '∞' : node.distance}
                                                </text>
                                            </g>
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
            {/* BFS Controls and Info */}
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
                        <div className={`${endNode === null ? (bfsState.visited.size === graph.nodes.length ? "bg-green-100 border-green-500 text-green-700" : "bg-blue-100 border-blue-500 text-blue-700") : "bg-yellow-100 border-yellow-500 text-yellow-700"} px-4 py-2 rounded mb-4 border`}>
                            {endNode === null ? (
                                bfsState.visited.size === graph.nodes.length ? (
                                    <>
                                        <p className="font-bold">Graph Fully Traversed! 🌐</p>
                                        <p>Visited all {bfsState.visited.size} nodes in the graph.</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-bold">Partial Traversal Completed</p>
                                        <p>Visited {bfsState.visited.size} out of {graph.nodes.length} nodes. Some nodes are unreachable from the start node.</p>
                                    </>
                                )
                            ) : (
                                <>
                                    <p className="font-bold">Path Not Found!</p>
                                    <p>Explored all reachable nodes ({bfsState.visited.size} nodes) but could not reach the target.</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Queue and Visited Display */}
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

            {/* DFS Controls and Info */}
            {algorithmType === 'dfs' && (
                <div className="mt-4 w-full">
                    <div className="flex justify-between items-center mb-2 bg-gray-100 p-3 rounded border border-gray-300">
                        <h3 className="font-bold">DFS Control</h3>

                        <div className="flex space-x-2">
                            <button
                                onClick={handleDfsReset}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                disabled={startNode === null}
                            >
                                Reset (R)
                            </button>
                            <button
                                onClick={handleDfsStepNext}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                disabled={!dfsState || dfsState.stack.length === 0 || (dfsState && dfsState.pathFound)}
                            >
                                Step Next (→)
                            </button>
                        </div>
                    </div>

                    {/* Path Messages */}
                    {dfsState && dfsState.pathFound && (
                        <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-2 rounded mb-4">
                            <p className="font-bold">Path Found! 🎉</p>
                            <p>Target node reached after {dfsState.currentStep} steps.</p>
                        </div>
                    )}

                    {dfsState && dfsState.stack.length === 0 && !dfsState.pathFound && dfsState.currentStep > 0 && (
                        <div className={`${endNode === null ? (dfsState.visited.size === graph.nodes.length ? "bg-green-100 border-green-500 text-green-700" : "bg-blue-100 border-blue-500 text-blue-700") : "bg-yellow-100 border-yellow-500 text-yellow-700"} px-4 py-2 rounded mb-4 border`}>
                            {endNode === null ? (
                                dfsState.visited.size === graph.nodes.length ? (
                                    <>
                                        <p className="font-bold">Graph Fully Traversed! 🌐</p>
                                        <p>Visited all {dfsState.visited.size} nodes in the graph.</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-bold">Partial Traversal Completed</p>
                                        <p>Visited {dfsState.visited.size} out of {graph.nodes.length} nodes. Some nodes are unreachable from the start node.</p>
                                    </>
                                )
                            ) : (
                                <>
                                    <p className="font-bold">Path Not Found!</p>
                                    <p>Explored all reachable nodes ({dfsState.visited.size} nodes) but could not reach the target.</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Stack and Visited Display */}
                    <div className="flex gap-4">
                        <div className="flex-1 bg-gray-100 p-3 rounded border border-gray-300">
                            <h4 className="font-medium mb-2">Stack:</h4>
                            <div className="flex items-center">
                                {dfsState?.stack.length === 0 ? (
                                    <span className="italic text-gray-500">Empty</span>
                                ) : (
                                    <span>
                                        {dfsState?.stack.map((nodeId, index) => (
                                            <span key={`stack-${nodeId}`}>
                                                <span className="font-bold">{graph.nodes.find(n => n.id === nodeId)?.label || nodeId}</span>
                                                {index < dfsState.stack.length - 1 && <span className="mx-1">→</span>}
                                            </span>
                                        ))}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 bg-gray-100 p-3 rounded border border-gray-300">
                            <h4 className="font-medium mb-2">Visited Nodes:</h4>
                            <div className="flex items-center">
                                {dfsState?.visited.size === 0 ? (
                                    <span className="italic text-gray-500">None</span>
                                ) : (
                                    <span>
                                        {Array.from(dfsState?.visited || []).map((nodeId, index, array) => (
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
            {/* Dijkstra Controls and Info */}
            {algorithmType === 'dijkstra' && (
                <div className="mt-4 w-full">
                    <div className="flex justify-between items-center mb-2 bg-gray-100 p-3 rounded border border-gray-300">
                        <h3 className="font-bold">Dijkstra Control</h3>

                        <div className="flex space-x-2">
                            <button
                                onClick={handleDijkstraReset}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                disabled={startNode === null}
                            >
                                Reset (R)
                            </button>
                            <button
                                onClick={handleDijkstraStepNext}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                disabled={!dijkstraState || dijkstraState.priorityQueue.length === 0 || (dijkstraState && dijkstraState.pathFound)}
                            >
                                Step Next (→)
                            </button>
                        </div>
                    </div>

                    {/* Path Messages */}
                    {dijkstraState && dijkstraState.pathFound && (
                        <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-2 rounded mb-4">
                            <p className="font-bold">Path Found! 🎉</p>
                            <p>Target node reached after {dijkstraState.currentStep} steps.</p>
                            {endNode !== null && (
                                <p>Shortest distance: {dijkstraState.distances[endNode]}</p>
                            )}
                        </div>
                    )}

                    {dijkstraState && dijkstraState.priorityQueue.length === 0 && !dijkstraState.pathFound && dijkstraState.currentStep > 0 && (
                        <div className={`${endNode === null ? (dijkstraState.visited.size === graph.nodes.length ? "bg-green-100 border-green-500 text-green-700" : "bg-blue-100 border-blue-500 text-blue-700") : "bg-yellow-100 border-yellow-500 text-yellow-700"} px-4 py-2 rounded mb-4 border`}>
                            {endNode === null ? (
                                dijkstraState.visited.size === graph.nodes.length ? (
                                    <>
                                        <p className="font-bold">All Shortest Paths Found! 🌐</p>
                                        <p>Calculated shortest paths to all {dijkstraState.visited.size} nodes in the graph.</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-bold">Partial Shortest Paths Calculated</p>
                                        <p>Found shortest paths to {dijkstraState.visited.size} out of {graph.nodes.length} nodes. Some nodes are unreachable from the start node.</p>
                                    </>
                                )
                            ) : (
                                <>
                                    <p className="font-bold">Path Not Found!</p>
                                    <p>Explored all reachable nodes ({dijkstraState.visited.size} nodes) but could not reach the target.</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Specific Path Display if End Node is selected */}
                    {dijkstraState && dijkstraState.pathFound && startNode !== null && endNode !== null && (
                        <div className="mt-4 p-4 bg-green-100 border border-green-500 rounded">
                            <h4 className="font-medium mb-2">
                                Shortest Path from {graph.nodes[startNode]?.label || startNode} to {graph.nodes[endNode]?.label || endNode}:
                            </h4>

                            {(() => {
                                const path = getShortestPath(dijkstraState, endNode);
                                if (path.length <= 1) {
                                    return <p className="text-red-500">No path exists</p>;
                                }

                                const pathStr = path.map(p => graph.nodes[p]?.label || p).join(' → ');
                                const distance = dijkstraState.distances[endNode];

                                let pathWithWeights = '';
                                for (let i = 0; i < path.length - 1; i++) {
                                    const from = path[i];
                                    const to = path[i + 1];

                                    // Find the edge
                                    const edge = graph.edges.find(e =>
                                        (e.source === from && e.target === to) ||
                                        (!isDirected && e.source === to && e.target === from)
                                    );

                                    const weight = edge?.weight || 1;

                                    pathWithWeights += `[${graph.nodes[from]?.label || from}] -- ${weight} --> `;
                                }
                                pathWithWeights += `[${graph.nodes[path[path.length - 1]]?.label || path[path.length - 1]}]`;

                                return (
                                    <>
                                        <p>Total distance: <span className="font-bold">{distance}</span></p>
                                        <p>Path: {pathStr}</p>
                                        <p className="text-sm mt-2">{pathWithWeights}</p>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* Distance Table */}
                    <div className="flex gap-4">
                        <div className="flex-1 bg-gray-100 p-3 rounded border border-gray-300">
                            <h4 className="font-medium mb-2">Priority Queue (Distance, Node):</h4>
                            <div className="flex flex-wrap gap-2">
                                {dijkstraState?.priorityQueue.length === 0 ? (
                                    <span className="italic text-gray-500">Empty</span>
                                ) : (
                                    dijkstraState?.priorityQueue.map(([dist, nodeId], index) => (
                                        <span key={`queue-${nodeId}-${index}`} className="inline-block px-2 py-1 bg-green-100 border border-green-200 rounded">
                                            ({dist}, {graph.nodes.find(n => n.id === nodeId)?.label || nodeId})
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex-1 bg-gray-100 p-3 rounded border border-gray-300">
                            <h4 className="font-medium mb-2">Distances:</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {dijkstraState?.distances.map((distance, index) => (
                                    <div key={`distance-${index}`} className="flex justify-between px-2 py-1 bg-white border border-gray-200 rounded">
                                        <span className="font-bold">{graph.nodes.find(n => n.id === index)?.label || index}:</span>
                                        <span>{distance === Number.MAX_SAFE_INTEGER ? '∞' : distance}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


            )}
            {/* Floyd-Warshall Controls and Info */}
            { algorithmType === 'floydWarshall' && (
                <div className="mt-4 w-full">
                    <div className="flex justify-between items-center mb-2 bg-gray-100 p-3 rounded border border-gray-300">
                        <h3 className="font-bold">Floyd-Warshall Control</h3>

                        <div className="flex space-x-2">
                            <button
                                onClick={handleFloydWarshallReset}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                Reset (R)
                            </button>
                            <button
                                onClick={handleFloydWarshallStepNext}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                disabled={!floydWarshallState || floydWarshallState.completed}
                            >
                                Step Next (→)
                            </button>
                        </div>
                    </div>

                    {/* Algorithm Status */}
                    {floydWarshallState && (
                        <div className="bg-blue-100 border border-blue-500 text-blue-700 px-4 py-2 rounded mb-4">
                            <p className="font-bold">
                                {floydWarshallState.completed
                                    ? "🪖 Algorithm Completed! All shortest paths calculated."
                                    : `Step ${floydWarshallState.currentStep}: Processing k=${floydWarshallState.currentK}, i=${floydWarshallState.currentI}, j=${floydWarshallState.currentJ}`}
                            </p>
                        </div>
                    )}

                    {/* Current Comparison */}
                    {floydWarshallState && !floydWarshallState.completed && floydWarshallState.currentK >= 0 && (
                        <div className="mb-4 p-3 border border-gray-300 rounded bg-gray-50">
                            <h4 className="font-medium mb-2">Current Comparison:</h4>
                            <div className="flex flex-col items-start">
                                {/* First line: general formula - KEEP THE ORIGINAL FORMAT */}
                                <div className="text-lg font-mono">
                                    dist[i][j] &gt; dist[i][k] + dist[k][j]
                                </div>

                                {/* Second line: with node labels - KEEP THE ORIGINAL ORDER */}
                                <div className="text-lg font-mono">
                                    dist[
                                    <span className="font-bold">{graph.nodes[floydWarshallState.currentI]?.label || floydWarshallState.currentI}</span>
                                    ][
                                    <span className="font-bold">{graph.nodes[floydWarshallState.currentJ]?.label || floydWarshallState.currentJ}</span>
                                    ] &gt; dist[
                                    <span className="font-bold">{graph.nodes[floydWarshallState.currentI]?.label || floydWarshallState.currentI}</span>
                                    ][
                                    <span className="font-bold">{graph.nodes[floydWarshallState.currentK]?.label || floydWarshallState.currentK}</span>
                                    ] + dist[
                                    <span className="font-bold">{graph.nodes[floydWarshallState.currentK]?.label || floydWarshallState.currentK}</span>
                                    ][
                                    <span className="font-bold">{graph.nodes[floydWarshallState.currentJ]?.label || floydWarshallState.currentJ}</span>
                                    ]
                                </div>

                                {/* Third line: But FIX the values issue */}
                                {(() => {
                                    // Get the PREVIOUS history entry to show the value BEFORE any update
                                    const prevEntry = floydWarshallState.history[floydWarshallState.history.length - 2];
                                    const currentIJ = prevEntry ?
                                        prevEntry.dist[floydWarshallState.currentI][floydWarshallState.currentJ] :
                                        floydWarshallState.dist[floydWarshallState.currentI][floydWarshallState.currentJ];

                                    const currentIK = floydWarshallState.dist[floydWarshallState.currentI][floydWarshallState.currentK];
                                    const currentKJ = floydWarshallState.dist[floydWarshallState.currentK][floydWarshallState.currentJ];

                                    const newPath = (currentIK !== Number.MAX_SAFE_INTEGER &&
                                        currentKJ !== Number.MAX_SAFE_INTEGER) ?
                                        currentIK + currentKJ : Number.MAX_SAFE_INTEGER;

                                    const wasUpdated = newPath < currentIJ;

                                    return (
                                        <div className={`text-lg font-mono ${wasUpdated ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                                            {currentIJ === Number.MAX_SAFE_INTEGER ? '∞' : currentIJ} &gt; {currentIK === Number.MAX_SAFE_INTEGER ? '∞' : currentIK} + {currentKJ === Number.MAX_SAFE_INTEGER ? '∞' : currentKJ}
                                            {wasUpdated && (
                                                <span className="ml-4 text-green-600">
                                                    (Updated to {newPath})
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Show final formula explanation after completion */}
                    {floydWarshallState && floydWarshallState.completed && (
                        <div className="mb-4 p-3 border border-green-300 rounded bg-green-50">
                            <h4 className="font-medium mb-2">Floyd-Warshall Algorithm Complete</h4>
                            <p>All shortest paths have been computed. The algorithm works by:</p>
                            <div className="pl-4 mt-2">
                                <p>1. For each intermediate node <strong>k</strong></p>
                                <p>2. For each pair of nodes <strong>i</strong> and <strong>j</strong></p>
                                <p>3. Check if going through node <strong>k</strong> gives a shorter path:</p>
                                <div className="font-mono bg-white p-2 mt-1 rounded">
                                    {"if dist[i][k] + dist[k][j] < dist[i][j]:"}
                                    <br />
                                    &nbsp;&nbsp;{"dist[i][j] = dist[i][k] + dist[k][j]"}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Distance Matrix Table */}
                    {floydWarshallState && (
                        <div className="mb-4">
                            <h4 className="font-medium mb-2">Distance Matrix:</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 p-2 bg-gray-100"></th>
                                            {graph.nodes.map((node) => (
                                                <th key={`col-${node.id}`} className="border border-gray-300 p-2 bg-gray-100">
                                                    {node.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {floydWarshallState.dist.map((row, i) => (
                                            <tr key={`row-${i}`}>
                                                <th className="border border-gray-300 p-2 bg-gray-100">
                                                    {graph.nodes[i]?.label || i}
                                                </th>
                                                {row.map((dist, j) => (
                                                    <td
                                                        key={`cell-${i}-${j}`}
                                                        className={`border border-gray-300 p-2 text-center ${i === floydWarshallState.currentI && j === floydWarshallState.currentJ
                                                                ? floydWarshallState.lastUpdated
                                                                    ? 'bg-green-200' // Green for updated cell
                                                                    : 'bg-yellow-200' // Yellow for current cell
                                                                : ''
                                                            } ${
                                                            // Highlight k row and column 
                                                            (floydWarshallState.currentK === i || floydWarshallState.currentK === j) &&
                                                                !(i === floydWarshallState.currentI && j === floydWarshallState.currentJ)
                                                                ? 'bg-blue-100'
                                                                : ''
                                                            }`}
                                                    >
                                                        {dist === Number.MAX_SAFE_INTEGER ? '∞' : dist}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Path Display Section */}
                    {floydWarshallState && floydWarshallState.completed && startNode !== null && (
                        <div className="mt-4">
                            <h4 className="font-medium mb-2">Shortest Paths from Node {graph.nodes[startNode]?.label || startNode}:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {graph.nodes.map((node) => {
                                    if (node.id === startNode) return null;

                                    const path = getFloydWarshallPath(floydWarshallState, startNode, node.id);
                                    const distance = path.length > 0 ? floydWarshallState.dist[startNode][node.id] : '∞';

                                    return (
                                        <div
                                            key={`path-${node.id}`}
                                            className={`p-2 rounded border ${path.length > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                                }`}
                                        >
                                            <p className="font-bold">
                                                To {node.label}: {distance === '∞' ? '∞' : `${distance} units`}
                                            </p>
                                            {path.length > 0 ? (
                                                <p className="text-sm">
                                                    Path: {path.map(p => graph.nodes[p]?.label || p).join(' → ')}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-red-500">No path exists</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Specific Path Display if End Node is selected */}
                    {floydWarshallState && floydWarshallState.completed && startNode !== null && endNode !== null && (
                        <div className="mt-4 p-4 bg-green-100 border border-green-500 rounded">
                            <h4 className="font-medium mb-2">
                                Shortest Path from {graph.nodes[startNode]?.label || startNode} to {graph.nodes[endNode]?.label || endNode}:
                            </h4>

                            {(() => {
                                const path = getFloydWarshallPath(floydWarshallState, startNode, endNode);
                                if (path.length <= 1) {
                                    return <p className="text-red-500">No path exists</p>;
                                }

                                const pathStr = path.map(p => graph.nodes[p]?.label || p).join(' → ');
                                const distance = floydWarshallState.dist[startNode][endNode];

                                let pathWithWeights = '';
                                for (let i = 0; i < path.length - 1; i++) {
                                    const from = path[i];
                                    const to = path[i + 1];

                                    // Find the edge
                                    const edge = graph.edges.find(e =>
                                        (e.source === from && e.target === to) ||
                                        (!isDirected && e.source === to && e.target === from)
                                    );

                                    const weight = edge?.weight || 1;

                                    pathWithWeights += `[${graph.nodes[from]?.label || from}] -- ${weight} --> `;
                                }
                                pathWithWeights += `[${graph.nodes[path[path.length - 1]]?.label || path[path.length - 1]}]`;

                                return (
                                    <>
                                        <p>Total distance: <span className="font-bold">{distance}</span></p>
                                        <p>Path: {pathStr}</p>
                                        <p className="text-sm mt-2">{pathWithWeights}</p>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                    
                </div>
            )}

            {/* Kruskal Controls and Info */}
            {algorithmType === 'kruskal' && (
                <div className="mt-4 w-full">
                    <div className="flex justify-between items-center mb-2 bg-gray-100 p-3 rounded border border-gray-300">
                        <h3 className="font-bold">Kruskal's MST Algorithm</h3>

                        <div className="flex space-x-2">
                            <button
                                onClick={handleKruskalReset}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                Reset (R)
                            </button>
                            <button
                                onClick={handleKruskalStepNext}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                disabled={!kruskalState || kruskalState.completed}
                            >
                                Step Next (→)
                            </button>
                        </div>
                    </div>

                    {/* Algorithm Status */}
                    {kruskalState && (
                        <div className="bg-blue-100 border border-blue-500 text-blue-700 px-4 py-2 rounded mb-4">
                            <p className="font-bold">
                                {kruskalState.completed
                                    ? "Algorithm Completed! Minimum Spanning Tree constructed."
                                    : `Step ${kruskalState.currentStep}: Examining edge ${kruskalState.currentEdgeIndex + 1}/${kruskalState.sortedEdges.length}`}
                            </p>
                            {kruskalState.currentEdgeIndex >= 0 && kruskalState.currentEdgeIndex < kruskalState.sortedEdges.length && (
                                <p>
                                    Current edge:
                                    {graph.nodes.find(n => n.id === kruskalState.sortedEdges[kruskalState.currentEdgeIndex].source)?.label || kruskalState.sortedEdges[kruskalState.currentEdgeIndex].source} →
                                    {graph.nodes.find(n => n.id === kruskalState.sortedEdges[kruskalState.currentEdgeIndex].target)?.label || kruskalState.sortedEdges[kruskalState.currentEdgeIndex].target}
                                    (Weight: {kruskalState.sortedEdges[kruskalState.currentEdgeIndex].weight || 1})
                                </p>
                            )}
                            {kruskalState.completed && (
                                <p>Total MST Weight: {kruskalState.mstEdges.reduce((sum: number, edge: Edge) => sum + (edge.weight ?? 1), 0)}</p>
                            )}
                        </div>
                    )}

                    {/* MST Edges Display */}
                    {kruskalState && (
                        <div className="mb-4">
                            <h4 className="font-medium mb-2">MST Edges:</h4>
                            <div className="flex flex-wrap gap-2">
                                {kruskalState.mstEdges.length === 0 ? (
                                    <span className="italic text-gray-500">None yet</span>
                                ) : (
                                    kruskalState.mstEdges.map((edge, index) => (
                                        <span key={`mst-edge-${index}`} className="inline-block px-2 py-1 bg-green-100 border border-green-200 rounded">
                                            {graph.nodes.find(n => n.id === edge.source)?.label || edge.source} →
                                            {graph.nodes.find(n => n.id === edge.target)?.label || edge.target}
                                            {edge.weight ? ` (${edge.weight})` : ''}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Path Display if Start and End Nodes are Selected */}
                    {kruskalState && kruskalState.completed && startNode !== null && endNode !== null && (
                        <div className="mt-4 p-4 bg-green-100 border border-green-500 rounded">
                            <h4 className="font-medium mb-2">
                                Shortest Path in MST from {graph.nodes[startNode]?.label || startNode} to {graph.nodes[endNode]?.label || endNode}:
                            </h4>

                            {(() => {
                                const path = getShortestPathInMST(kruskalState.mstEdges, startNode, endNode, graph.nodes.length);
                                if (path.length <= 1) {
                                    return <p className="text-red-500">No path exists in the MST</p>;
                                }

                                const pathStr = path.map(p => graph.nodes.find(n => n.id === p)?.label || p).join(' → ');

                                // Calculate total path weight
                                let totalWeight = 0;
                                for (let i = 0; i < path.length - 1; i++) {
                                    for (const edge of kruskalState.mstEdges) {
                                        if ((edge.source === path[i] && edge.target === path[i + 1]) ||
                                            (!isDirected && edge.source === path[i + 1] && edge.target === path[i])) {
                                            totalWeight += edge.weight || 1;
                                            break;
                                        }
                                    }
                                }

                                return (
                                    <>
                                        <p>Total path weight: <span className="font-bold">{totalWeight}</span></p>
                                        <p>Path: {pathStr}</p>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GraphVisualizer;