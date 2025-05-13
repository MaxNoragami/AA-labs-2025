import time


class DisjointSet:
    """Disjoint Set data structure for efficient Union-Find operations"""

    def __init__(self, n):
        """Initialize n disjoint sets"""
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        """Find the parent of x with path compression"""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        """Union by rank to keep tree balanced"""
        root_x = self.find(x)
        root_y = self.find(y)

        if root_x == root_y:
            return False

        # Union by rank - attach smaller tree under root of larger tree
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1

        return True


def kruskal(adj):
    """
    Kruskal's algorithm for finding Minimum Spanning Tree

    Args:
        adj: Weighted graph as adjacency list of {neighbor: weight} dictionaries

    Returns:
        mst_edges: List of (u, v, weight) tuples in the MST
        total_weight: Total weight of the MST
    """
    n = len(adj)
    edges = []

    # Extract all edges from adjacency list
    for u in range(n):
        for v, weight in adj[u].items():
            if u < v:  # Add each edge only once
                edges.append((u, v, weight))

    # Sort edges by weight
    edges.sort(key=lambda x: x[2])

    # Initialize disjoint set
    ds = DisjointSet(n)

    # Build MST
    mst_edges = []
    total_weight = 0

    for u, v, weight in edges:
        if ds.union(u, v):  # If u and v are in different components
            mst_edges.append((u, v, weight))
            total_weight += weight

            # Stop when MST is complete for the connected component
            if len(mst_edges) == n - 1:
                break

    return mst_edges, total_weight


def measure_kruskal_performance(adj):
    """
    Measure Kruskal's algorithm performance

    Args:
        adj: Weighted adjacency list

    Returns:
        Dictionary of performance metrics
    """
    # Start timing
    start_time = time.time()

    # Run Kruskal's algorithm
    mst_edges, total_weight = kruskal(adj)

    # End timing
    execution_time = time.time() - start_time

    # Calculate metrics
    n = len(adj)

    # Check connectivity of the graph
    vertices_in_mst = set()
    for u, v, _ in mst_edges:
        vertices_in_mst.add(u)
        vertices_in_mst.add(v)

    # Check components through Union-Find
    ds = DisjointSet(n)
    for u, v, _ in mst_edges:
        ds.union(u, v)

    components = set()
    for i in range(n):
        components.add(ds.find(i))

    return {
        "mst_edges": mst_edges,
        "total_weight": total_weight,
        "execution_time": execution_time * 1000,  # Convert to milliseconds
        "vertices_covered": len(vertices_in_mst),
        "component_count": len(components)
    }


def test_kruskal(adj):
    """Test function that matches the style in minimum_spanning_tree.py"""
    start = time.time()
    _, total_weight = kruskal(adj)
    return time.time() - start