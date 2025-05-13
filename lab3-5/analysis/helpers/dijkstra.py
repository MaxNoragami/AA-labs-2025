import time
import heapq


def dijkstra(adj, start_node):
    """
    Dijkstra's algorithm for shortest path from a single source.
    Works on weighted graphs represented as adjacency lists of {neighbor: weight} dictionaries.

    Args:
        adj: List of dictionaries where adj[i] = {j: weight} for edge (i,j)
        start_node: Source node to find shortest paths from

    Returns:
        distances: List of shortest distances from start_node to all other nodes
        predecessors: List of predecessors for reconstructing paths
    """
    n = len(adj)
    distances = [float('inf')] * n
    distances[start_node] = 0
    predecessors = [None] * n

    # Priority queue for efficient minimum distance extraction
    # Format: (distance, node)
    pq = [(0, start_node)]
    visited = set()

    while pq:
        dist, node = heapq.heappop(pq)

        # Skip if already processed this node with a shorter path
        if node in visited:
            continue

        # Mark as visited
        visited.add(node)

        # Check neighbors
        for neighbor, weight in adj[node].items():
            if neighbor not in visited:
                new_dist = dist + weight

                # Found a better path
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    predecessors[neighbor] = node
                    heapq.heappush(pq, (new_dist, neighbor))

    return distances, predecessors


def measure_dijkstra_performance(adj, start_node=0):
    """
    Measure Dijkstra's algorithm performance and collect metrics

    Args:
        adj: Graph represented as adjacency list of dictionaries
        start_node: Starting node

    Returns:
        metrics: Dictionary of performance metrics
    """
    # Start timing
    start_time = time.time()

    # Run Dijkstra's algorithm
    distances, predecessors = dijkstra(adj, start_node)

    # End timing
    execution_time = time.time() - start_time

    # Calculate metrics
    n = len(adj)
    reachable_nodes = [i for i in range(n) if i != start_node and distances[i] != float('inf')]

    if not reachable_nodes:
        avg_distance = 0
        max_distance = 0
    else:
        avg_distance = sum(distances[i] for i in reachable_nodes) / len(reachable_nodes)
        max_distance = max(distances[i] for i in reachable_nodes)

    coverage = len(reachable_nodes) / (n - 1) * 100 if n > 1 else 100

    return {
        "distances": distances,
        "predecessors": predecessors,
        "avg_distance": avg_distance,
        "max_distance": max_distance,
        "coverage": coverage,
        "reachable_count": len(reachable_nodes),
        "execution_time": execution_time * 1000  # Convert to milliseconds
    }


def get_shortest_path(predecessors, start_node, end_node):
    """
    Reconstruct the shortest path from start_node to end_node

    Args:
        predecessors: List of predecessors from Dijkstra's algorithm
        start_node: Starting node
        end_node: Target node

    Returns:
        path: List representing the shortest path (empty if no path)
    """
    if predecessors[end_node] is None and start_node != end_node:
        return []  # No path exists

    path = []
    current = end_node

    while current is not None:
        path.append(current)
        current = predecessors[current]
        # Break if we reach the start node or detect a cycle
        if current == start_node:
            path.append(current)
            break

    return path[::-1]  # Reverse to get path from start to end