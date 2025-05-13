import os
import time
import sys
import matplotlib.pyplot as plt
import random
import numpy as np

# Import the helpers
from helpers.kruskal import kruskal, measure_kruskal_performance, test_kruskal
from helpers.prim import prim, measure_prim_performance, test_prim, find_largest_component
from helpers.graph_builders import (
    generate_complete_graph,
    generate_dense_graph,
    generate_sparse_graph,
    generate_tree_graph,
    generate_connected_graph,
    generate_disconnected_graph,
    generate_cyclic_graph,
    generate_acyclic_graph,
    generate_grid_graph
)

# Increase recursion limit for large graphs
sys.setrecursionlimit(16000)

# Create output directory
os.makedirs("graphs/lab5", exist_ok=True)

# Graph sizes to test
SIZES = [i for i in range(1, 2400, 150)]

# Define graph types with their generator functions
GRAPH_TYPES = {
    "Complete Graph": generate_complete_graph,
    "Dense Graph": generate_dense_graph,
    "Sparse Graph": generate_sparse_graph,
    "Tree Graph": generate_tree_graph,
    "Connected Graph": generate_connected_graph,
    "Disconnected Graph": generate_disconnected_graph,
    "Cyclic Graph": generate_cyclic_graph,
    "Acyclic Graph": generate_acyclic_graph,
    "Grid Graph": generate_grid_graph
}


def add_weights(adj, min_weight=1, max_weight=10):
    """Convert an unweighted adjacency list to a weighted one"""
    weighted_adj = [{} for _ in range(len(adj))]
    for u in range(len(adj)):
        for v in adj[u]:
            if v not in weighted_adj[u]:  # Avoid duplicating edges
                weight = random.randint(min_weight, max_weight)
                weighted_adj[u][v] = weight
                weighted_adj[v][u] = weight  # Ensure graph is undirected for MST
    return weighted_adj


def make_undirected(adj):
    """Make a directed graph undirected for MST algorithms"""
    n = len(adj)
    undirected = [[] for _ in range(n)]

    for u in range(n):
        for v in adj[u]:
            undirected[u].append(v)
            undirected[v].append(u)  # Add reverse edge

    # Remove duplicates
    for i in range(n):
        undirected[i] = list(set(undirected[i]))

    return undirected


def run_tests():
    """Run MST tests on all graph types and collect metrics"""
    results_kruskal = {graph_type: [] for graph_type in GRAPH_TYPES}
    results_prim = {graph_type: [] for graph_type in GRAPH_TYPES}

    for size in SIZES:
        print(f"Testing graphs with {size} nodes...")

        for graph_type, generator_func in GRAPH_TYPES.items():
            print(f"  {graph_type}...")

            # Generate graph
            graph = generator_func(size)

            # Handle directed acyclic graphs by making them undirected
            if graph_type == "Acyclic Graph":
                print("    Making acyclic graph undirected for MST")
                graph = make_undirected(graph)

            # Convert to weighted
            weighted_graph = add_weights(graph)

            # Handle disconnected graphs
            if graph_type == "Disconnected Graph":
                # Find the largest connected component for testing
                component = find_largest_component(weighted_graph)
                print(f"    Using largest component ({len(component)} nodes) of disconnected graph")
                start_node = component[0] if component else 0
            else:
                start_node = 0

            # Test Kruskal's algorithm
            try:
                kruskal_time = test_kruskal(weighted_graph)
                results_kruskal[graph_type].append(kruskal_time * 1000)  # Convert to ms
                print(f"    Kruskal: {kruskal_time * 1000:.2f}ms")
            except Exception as e:
                print(f"    Error in Kruskal: {e}")
                results_kruskal[graph_type].append(float('nan'))

            # Test Prim's algorithm
            try:
                prim_time = test_prim(weighted_graph, start_node)
                results_prim[graph_type].append(prim_time * 1000)  # Convert to ms
                print(f"    Prim: {prim_time * 1000:.2f}ms")
            except Exception as e:
                print(f"    Error in Prim: {e}")
                results_prim[graph_type].append(float('nan'))

    return results_kruskal, results_prim


def plot_results(results_kruskal, results_prim):
    """Generate performance comparison plots"""
    # Create a figure with two vertically stacked subplots
    plt.figure(figsize=(15, 10))

    # Plot 1: Kruskal performance (top)
    plt.subplot(2, 1, 1)
    for graph_type, times in results_kruskal.items():
        # Handle NaN values for plotting
        times_clean = [t if not np.isnan(t) else None for t in times]
        valid_times = [(s, t) for s, t in zip(SIZES, times_clean) if t is not None]

        if valid_times:
            sizes_valid, times_valid = zip(*valid_times)
            plt.plot(sizes_valid, times_valid, marker='o', label=graph_type)

    plt.title("Kruskal's Algorithm Performance Across Graph Types")
    plt.xlabel('Number of Nodes')
    plt.ylabel('Time (ms)')
    plt.grid(True, alpha=0.3)
    plt.legend(loc='upper left')

    # Plot 2: Prim performance (bottom)
    plt.subplot(2, 1, 2)
    for graph_type, times in results_prim.items():
        # Handle NaN values for plotting
        times_clean = [t if not np.isnan(t) else None for t in times]
        valid_times = [(s, t) for s, t in zip(SIZES, times_clean) if t is not None]

        if valid_times:
            sizes_valid, times_valid = zip(*valid_times)
            plt.plot(sizes_valid, times_valid, marker='o', label=graph_type)

    plt.title("Prim's Algorithm Performance Across Graph Types")
    plt.xlabel('Number of Nodes')
    plt.ylabel('Time (ms)')
    plt.grid(True, alpha=0.3)
    plt.legend(loc='upper left')

    plt.tight_layout()
    plt.savefig("graphs/lab5/algorithm_comparison.png")
    plt.close()

    # Individual plots for each graph type
    for graph_type in GRAPH_TYPES:
        plt.figure(figsize=(10, 6))

        # Get Kruskal times for this graph type
        kruskal_times = results_kruskal[graph_type]
        kruskal_times_clean = [t if not np.isnan(t) else None for t in kruskal_times]
        valid_kruskal = [(s, t) for s, t in zip(SIZES, kruskal_times_clean) if t is not None]

        # Get Prim times for this graph type
        prim_times = results_prim[graph_type]
        prim_times_clean = [t if not np.isnan(t) else None for t in prim_times]
        valid_prim = [(s, t) for s, t in zip(SIZES, prim_times_clean) if t is not None]

        # Plot Kruskal times
        if valid_kruskal:
            sizes_valid, times_valid = zip(*valid_kruskal)
            plt.plot(sizes_valid, times_valid, marker='o', label='Kruskal', color='cornflowerblue')

        # Plot Prim times
        if valid_prim:
            sizes_valid, times_valid = zip(*valid_prim)
            plt.plot(sizes_valid, times_valid, marker='+', label='Prim', color='seagreen')

        plt.title(f'MST Algorithms on {graph_type}')
        plt.xlabel('Number of Nodes')
        plt.ylabel('Time (ms)')
        plt.grid(True)
        plt.legend()
        plt.tight_layout()
        plt.savefig(f"graphs/lab5/{graph_type.replace(' ', '_').lower()}_comparison.png")
        plt.close()


def main():
    """Main function to run tests and generate visualizations"""
    print("Starting MST algorithm tests...")
    results_kruskal, results_prim = run_tests()

    print("Generating performance plots...")
    plot_results(results_kruskal, results_prim)

    print("All tests completed. Results saved to graphs/lab5/")


if __name__ == "__main__":
    main()