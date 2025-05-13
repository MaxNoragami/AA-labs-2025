from collections import deque
import time


def bfs(adj):
    """
    Breadth-First Search algorithm for a graph.

    Args:
        adj: A graph represented as an adjacency list

    Returns:
        result: List of nodes in the order they were visited
    """
    n = len(adj)
    visited = [False] * n
    result = []

    for start in range(n):
        if not visited[start]:
            queue = deque([start])
            visited[start] = True

            while queue:
                vertex = queue.popleft()
                result.append(vertex)

                for neighbor in adj[vertex]:
                    if not visited[neighbor]:
                        visited[neighbor] = True
                        queue.append(neighbor)

    return result


def bfs_from_source(adj, start):
    """BFS from a specific source node"""
    n = len(adj)
    visited = [False] * n
    result = []
    distances = [-1] * n

    queue = deque([start])
    visited[start] = True
    distances[start] = 0

    while queue:
        vertex = queue.popleft()
        result.append(vertex)

        for neighbor in adj[vertex]:
            if not visited[neighbor]:
                visited[neighbor] = True
                distances[neighbor] = distances[vertex] + 1
                queue.append(neighbor)

    return result, distances


def measure_bfs_performance(adj, start_node=0):
    """Measure BFS performance and collect metrics"""
    # Run BFS and time it
    start_time = time.time()
    visited_nodes, distances = bfs_from_source(adj, start_node)
    execution_time = time.time() - start_time

    # Calculate metrics
    n = len(adj)
    reachable_nodes = [i for i in range(n) if distances[i] != -1 and i != start_node]

    if not reachable_nodes:
        avg_distance = 0
        max_distance = 0
    else:
        avg_distance = sum(distances[i] for i in reachable_nodes) / len(reachable_nodes)
        max_distance = max(distances[i] for i in reachable_nodes)

    coverage = len(visited_nodes) / n * 100

    return {
        "visited_nodes": visited_nodes,
        "distances": distances,
        "avg_distance": avg_distance,
        "max_distance": max_distance,
        "coverage": coverage,
        "reachable_count": len(reachable_nodes) + 1,  # +1 for start node
        "execution_time": execution_time * 1000  # Convert to milliseconds
    }