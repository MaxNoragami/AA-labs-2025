import time


def floyd_warshall(adj):
    """
    Floyd-Warshall algorithm for all-pairs shortest paths.
    Works on weighted graphs represented as adjacency lists of {neighbor: weight} dictionaries.

    Args:
        adj: List of dictionaries where adj[i] = {j: weight} for edge (i,j)

    Returns:
        dist: 2D list where dist[i][j] is the shortest distance from node i to j
        next: 2D list for path reconstruction where next[i][j] is the next node on shortest path from i to j
    """
    n = len(adj)

    # Initialize distance matrix
    dist = [[float('inf')] * n for _ in range(n)]
    next = [[None] * n for _ in range(n)]

    # Set diagonal distances to 0
    for i in range(n):
        dist[i][i] = 0

    # Initialize with direct edge weights
    for i in range(n):
        for j, weight in adj[i].items():
            dist[i][j] = weight
            next[i][j] = j

    # Floyd-Warshall main algorithm
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] != float('inf') and dist[k][j] != float('inf'):
                    if dist[i][j] > dist[i][k] + dist[k][j]:
                        dist[i][j] = dist[i][k] + dist[k][j]
                        next[i][j] = next[i][k]

    return dist, next


def measure_floyd_warshall_performance(adj):
    """
    Measure Floyd-Warshall algorithm performance and collect metrics

    Args:
        adj: Graph represented as adjacency list of dictionaries

    Returns:
        metrics: Dictionary of performance metrics
    """
    # Start timing
    start_time = time.time()

    # Run Floyd-Warshall algorithm
    distances, next_matrix = floyd_warshall(adj)

    # End timing
    execution_time = time.time() - start_time

    # Calculate metrics
    n = len(adj)

    # Calculate average distance
    total_distance = 0
    reachable_pairs = 0

    for i in range(n):
        for j in range(n):
            if i != j and distances[i][j] != float('inf'):
                total_distance += distances[i][j]
                reachable_pairs += 1

    avg_distance = total_distance / reachable_pairs if reachable_pairs > 0 else 0

    # Calculate maximum distance
    max_distance = 0
    for i in range(n):
        for j in range(n):
            if i != j and distances[i][j] != float('inf') and distances[i][j] > max_distance:
                max_distance = distances[i][j]

    # Calculate coverage (percentage of reachable node pairs)
    total_pairs = n * (n - 1)
    coverage = reachable_pairs / total_pairs * 100 if total_pairs > 0 else 100

    return {
        "distances": distances,
        "next_matrix": next_matrix,
        "avg_distance": avg_distance,
        "max_distance": max_distance,
        "coverage": coverage,
        "reachable_pairs": reachable_pairs,
        "execution_time": execution_time * 1000  # Convert to milliseconds
    }


def get_path(next_matrix, start_node, end_node):
    """
    Reconstruct shortest path from start_node to end_node using the next matrix

    Args:
        next_matrix: Next node matrix from Floyd-Warshall
        start_node: Starting node
        end_node: Target node

    Returns:
        path: List representing the shortest path (empty if no path)
    """
    if next_matrix[start_node][end_node] is None:
        return []  # No path exists

    path = [start_node]
    current = start_node

    while current != end_node:
        current = next_matrix[current][end_node]
        if current is None:
            return []  # No path exists (should not happen if initialized correctly)
        path.append(current)

    return path