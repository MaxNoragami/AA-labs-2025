import time


def dfs(adj):
    """
    Depth-First Search algorithm for a graph.

    Args:
        adj: A graph represented as an adjacency list

    Returns:
        result: List of nodes in the order they were visited
    """
    n = len(adj)
    visited = [False] * n
    result = []

    def dfs_visit(u):
        visited[u] = True
        result.append(u)
        for neighbor in adj[u]:
            if not visited[neighbor]:
                dfs_visit(neighbor)

    for i in range(n):
        if not visited[i]:
            dfs_visit(i)

    return result


def dfs_from_source(adj, start):
    """DFS from a specific source node"""
    n = len(adj)
    visited = [False] * n
    result = []
    depths = [0] * n

    def dfs_visit(u, depth=0):
        visited[u] = True
        result.append(u)
        depths[u] = depth

        for neighbor in adj[u]:
            if not visited[neighbor]:
                dfs_visit(neighbor, depth + 1)

    dfs_visit(start)
    return result, depths, visited


def measure_dfs_performance(adj, start_node=0):
    """Measure DFS performance and collect metrics"""
    # Run DFS and time it
    start_time = time.time()
    visited_nodes, depths, visited = dfs_from_source(adj, start_node)
    execution_time = time.time() - start_time

    # Calculate metrics
    n = len(adj)
    reachable_nodes = [i for i in range(n) if visited[i] and i != start_node]

    if not reachable_nodes:
        avg_depth = 0
        max_depth = 0
    else:
        avg_depth = sum(depths[i] for i in reachable_nodes) / len(reachable_nodes)
        max_depth = max(depths[i] for i in reachable_nodes) if reachable_nodes else 0

    coverage = len(visited_nodes) / n * 100

    # Check for cycles (simplified approach)
    has_cycle = False
    cycle_visited = [False] * n
    rec_stack = [False] * n

    def check_cycle(u):
        cycle_visited[u] = True
        rec_stack[u] = True

        for neighbor in adj[u]:
            if not cycle_visited[neighbor]:
                if check_cycle(neighbor):
                    return True
            elif rec_stack[neighbor]:
                return True

        rec_stack[u] = False
        return False

    for i in range(n):
        if not cycle_visited[i]:
            if check_cycle(i):
                has_cycle = True
                break

    return {
        "visited_nodes": visited_nodes,
        "depths": depths,
        "avg_depth": avg_depth,
        "max_depth": max_depth,
        "coverage": coverage,
        "reachable_count": len(reachable_nodes) + 1,
        "has_cycle": has_cycle,
        "execution_time": execution_time * 1000  # Convert to milliseconds
    }