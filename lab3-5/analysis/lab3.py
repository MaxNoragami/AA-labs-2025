import os
import time
import sys
import matplotlib.pyplot as plt
from collections import deque

# Import the helpers
from helpers.bfs import bfs, measure_bfs_performance
from helpers.dfs import dfs, measure_dfs_performance
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
os.makedirs("graphs/lab3", exist_ok=True)

# Graph sizes to test - match the visualizer sizes
# SIZES = [
#     10, 100, 250, 500, 750,
#     1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000,
#     3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500,
#     8000, 8500, 9000, 9500, 10000
# ]

SIZES = [i for i in range(1, 4500, 250)]

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


def run_tests():
    """Run BFS and DFS tests on all graph types and collect metrics"""
    results_bfs = {graph_type: [] for graph_type in GRAPH_TYPES}
    results_dfs = {graph_type: [] for graph_type in GRAPH_TYPES}

    for size in SIZES:
        print(f"Testing graphs with {size} nodes...")

        for graph_type, generator_func in GRAPH_TYPES.items():
            print(f"  {graph_type}...")

            # Generate graph
            graph = generator_func(size)

            # Test BFS
            bfs_metrics = measure_bfs_performance(graph, start_node=0)
            bfs_time = bfs_metrics["execution_time"]

            # Test DFS
            dfs_metrics = measure_dfs_performance(graph, start_node=0)
            dfs_time = dfs_metrics["execution_time"]

            # Store results
            results_bfs[graph_type].append(bfs_time)
            results_dfs[graph_type].append(dfs_time)

            print(f"    BFS={bfs_time:.2f}ms, DFS={dfs_time:.2f}ms")

    return results_bfs, results_dfs


def plot_results(results_bfs, results_dfs):
    """Generate performance comparison plots"""
    # Create a figure with two vertically stacked subplots (similar to reference image)
    plt.figure(figsize=(15, 10))

    # Plot 1: BFS performance (top)
    plt.subplot(2, 1, 1)
    for graph_type, times in results_bfs.items():
        plt.plot(SIZES, times, marker='o', label=graph_type)

    plt.title('BFS Performance Across Graph Types')
    plt.xlabel('Number of Nodes')
    plt.ylabel('Time (ms)')
    plt.grid(True, alpha=0.3)
    plt.legend(loc='upper left')

    # Plot 2: DFS performance (bottom)
    plt.subplot(2, 1, 2)
    for graph_type, times in results_dfs.items():
        plt.plot(SIZES, times, marker='o', label=graph_type)

    plt.title('DFS Performance Across Graph Types')
    plt.xlabel('Number of Nodes')
    plt.ylabel('Time (ms)')
    plt.grid(True, alpha=0.3)
    plt.legend(loc='upper left')

    plt.tight_layout()
    plt.savefig("graphs/lab3/algorithm_comparison.png")
    plt.close()

    # Individual plots for each graph type (keep these as well)
    for graph_type in GRAPH_TYPES:
        plt.figure(figsize=(10, 6))
        plt.plot(SIZES, results_bfs[graph_type], marker='o', label='BFS', color='magenta')
        plt.plot(SIZES, results_dfs[graph_type], marker='+', label='DFS', color='blue')

        plt.title(f'BFS vs DFS Performance on {graph_type}')
        plt.xlabel('Number of Nodes')
        plt.ylabel('Time (ms)')
        plt.grid(True)
        plt.legend()
        plt.tight_layout()
        plt.savefig(f"graphs/lab3/{graph_type.replace(' ', '_').lower()}_comparison.png")
        plt.close()


def main():
    """Main function to run tests and generate visualizations"""
    print("Starting graph algorithm tests...")
    results_bfs, results_dfs = run_tests()

    print("Generating performance plots...")
    plot_results(results_bfs, results_dfs)

    print("All tests completed. Results saved to graphs/lab3/")


if __name__ == "__main__":
    main()