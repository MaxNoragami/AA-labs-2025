import time
import heapq


def prim(adj, start_node=0):
    """
    Prim's algorithm for finding Minimum Spanning Tree

    Args:
        adj: Weighted graph as adjacency list of {neighbor: weight} dictionaries
        start_node: Starting vertex

    Returns:
        mst_edges: List of (u, v, weight) tuples in the MST
        total_weight: Total weight of the MST
    """
    n = len(adj)
    visited = [False] * n
    mst_edges = []
    total_weight = 0

    # Priority queue of edges (weight, to_vertex, from_vertex)
    pq = []

    # Start from the given vertex
    visited[start_node] = True

    # Add all edges from start_node to the priority queue
    for neighbor, weight in adj[start_node].items():
        heapq.heappush(pq, (weight, neighbor, start_node))

    # While there are edges to process
    while pq:
        weight, to_vertex, from_vertex = heapq.heappop(pq)

        # Skip if the destination vertex is already visited
        if visited[to_vertex]:
            continue

        # Add the edge to MST
        visited[to_vertex] = True
        mst_edges.append((from_vertex, to_vertex, weight))
        total_weight += weight

        # Add all edges from the newly visited vertex
        for neighbor, edge_weight in adj[to_vertex].items():
            if not visited[neighbor]:
                heapq.heappush(pq, (edge_weight, neighbor, to_vertex))

    return mst_edges, total_weight


def find_largest_component(adj):
    """Find the largest connected component in a graph"""
    n = len(adj)
    visited = [False] * n
    components = []

    for i in range(n):
        if not visited[i]:
            # Find all nodes in this component
            component = []
            queue = [i]
            visited[i] = True

            while queue:
                node = queue.pop(0)
                component.append(node)

                for neighbor in adj[node]:
                    if not visited[neighbor]:
                        visited[neighbor] = True
                        queue.append(neighbor)

            components.append(component)

    # Return the largest component
    return max(components, key=len) if components else []


def measure_prim_performance(adj, start_node=0):
    """
    Measure Prim's algorithm performance

    Args:
        adj: Weighted adjacency list
        start_node: Starting vertex

    Returns:
        Dictionary of performance metrics
    """
    # Start timing
    start_time = time.time()

    # Handle disconnected graphs by finding the largest component
    if not any(adj[start_node]):  # If start_node has no neighbors
        component = find_largest_component(adj)
        if component:
            start_node = component[0]  # Use first node in largest component

    # Run Prim's algorithm
    mst_edges, total_weight = prim(adj, start_node)

    # End timing
    execution_time = time.time() - start_time

    # Calculate metrics
    n = len(adj)

    # Calculate vertices covered
    vertices_in_mst = set([start_node])  # Start node is always included
    for u, v, _ in mst_edges:
        vertices_in_mst.add(u)
        vertices_in_mst.add(v)

    # Calculate coverage percentage
    coverage = len(vertices_in_mst) / n * 100

    return {
        "mst_edges": mst_edges,
        "total_weight": total_weight,
        "execution_time": execution_time * 1000,  # Convert to milliseconds
        "vertices_covered": len(vertices_in_mst),
        "coverage": coverage
    }


def test_prim(adj, start_node=0):
    """Test function that matches the style in minimum_spanning_tree.py"""
    # Handle disconnected graphs by finding the largest component
    if not any(adj[start_node]):  # If start_node has no neighbors
        component = find_largest_component(adj)
        if component:
            start_node = component[0]  # Use first node in largest component

    start = time.time()
    _, total_weight = prim(adj, start_node)
    return time.time() - start