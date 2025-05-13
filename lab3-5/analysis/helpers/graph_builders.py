import random
import math

def generate_complete_graph(n):
    """Generate a complete graph with n nodes"""
    adj = [[] for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                adj[i].append(j)
    return adj

def generate_dense_graph(n, edge_ratio=0.8):
    """Generate a dense graph with n nodes"""
    adj = [[] for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j and random.random() < edge_ratio:
                adj[i].append(j)
    return adj

def generate_sparse_graph(n):
    """Generate a sparse graph with n nodes and approximately 2n edges"""
    adj = [[] for _ in range(n)]
    # Create a spanning tree first to ensure connectivity
    for i in range(1, n):
        parent = random.randint(0, i - 1)
        adj[parent].append(i)
        adj[i].append(parent)

    # Add a few more random edges
    extra_edges = n // 2
    for _ in range(extra_edges):
        u = random.randint(0, n - 1)
        v = random.randint(0, n - 1)
        if u != v and v not in adj[u]:
            adj[u].append(v)
            adj[v].append(u)

    return adj

def generate_tree_graph(n):
    """Generate a binary tree with n nodes"""
    adj = [[] for _ in range(n)]
    for i in range(1, n):
        parent = (i - 1) // 2
        adj[parent].append(i)
        adj[i].append(parent)
    return adj

def generate_disconnected_graph(n):
    """Generate a disconnected graph with multiple components"""
    adj = [[] for _ in range(n)]

    # Create approximately sqrt(n) components
    num_components = max(2, int(n ** 0.5))
    nodes_per_component = n // num_components

    for c in range(num_components):
        start = c * nodes_per_component
        end = (c + 1) * nodes_per_component if c < num_components - 1 else n

        # Create a small connected component
        for i in range(start + 1, end):
            parent = random.randint(start, i - 1)
            adj[parent].append(i)
            adj[i].append(parent)

    return adj

def generate_cyclic_graph(n):
    """Generate a graph with at least one cycle"""
    # Start with a cycle
    adj = [[] for _ in range(n)]
    for i in range(n):
        adj[i].append((i + 1) % n)
        adj[(i + 1) % n].append(i)  # Make it undirected

    # Add random extra edges
    for _ in range(n // 2):
        u, v = random.sample(range(n), 2)
        if v not in adj[u]:
            adj[u].append(v)
            adj[v].append(u)
    return adj

def generate_acyclic_graph(n):
    """Generate a directed acyclic graph (DAG)"""
    adj = [[] for _ in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            if random.random() < 0.2:
                adj[i].append(j)
    return adj

def generate_grid_graph(n):
    """Generate a grid graph with approximately n nodes"""
    rows = int(math.sqrt(n))
    cols = int(math.ceil(n / rows))
    adj = [[] for _ in range(n)]

    def node(r, c):
        return r * cols + c

    for r in range(rows):
        for c in range(cols):
            current_node = node(r, c)
            if current_node >= n:
                continue

            # Right neighbor
            if c + 1 < cols:
                right_node = node(r, c + 1)
                if right_node < n:
                    adj[current_node].append(right_node)
                    adj[right_node].append(current_node)

            # Down neighbor
            if r + 1 < rows:
                down_node = node(r + 1, c)
                if down_node < n:
                    adj[current_node].append(down_node)
                    adj[down_node].append(current_node)

    return adj

def generate_connected_graph(n):
    """Generate a connected graph with n nodes"""
    adj = [[] for _ in range(n)]

    # Create a spanning tree to ensure connectivity
    for i in range(1, n):
        parent = random.randint(0, i - 1)
        adj[parent].append(i)
        adj[i].append(parent)

    # Add a few more random edges
    extra_edges = n // 2
    for _ in range(extra_edges):
        u = random.randint(0, n - 1)
        v = random.randint(0, n - 1)
        if u != v and v not in adj[u]:
            adj[u].append(v)
            adj[v].append(u)

    return adj