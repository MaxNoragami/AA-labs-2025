import os
import time
import sys
import matplotlib.pyplot as plt
import random
import numpy as np

# Import the helpers
from helpers.dijkstra import dijkstra, measure_dijkstra_performance, get_shortest_path
from helpers.floyd_warshall import floyd_warshall, measure_floyd_warshall_performance, get_path
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
os.makedirs("graphs/lab4", exist_ok=True)

# Graph sizes to test
SIZES = [10, 50, 100, 200, 220]

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
            weighted_adj[u][v] = random.randint(min_weight, max_weight)
    return weighted_adj


def run_tests():
    """Run shortest path tests on all graph types and collect metrics"""
    results_dijkstra = {graph_type: [] for graph_type in GRAPH_TYPES}
    results_floyd_warshall = {graph_type: [] for graph_type in GRAPH_TYPES}

    for size in SIZES:
        print(f"Testing graphs with {size} nodes...")

        for graph_type, generator_func in GRAPH_TYPES.items():
            print(f"  {graph_type}...")

            # Generate unweighted graph and convert to weighted
            unweighted_graph = generator_func(size)
            weighted_graph = add_weights(unweighted_graph)

            # Test Dijkstra's algorithm
            try:
                dijkstra_metrics = measure_dijkstra_performance(weighted_graph, start_node=0)
                dijkstra_time = dijkstra_metrics["execution_time"]
            except Exception as e:
                print(f"    Error in Dijkstra: {e}")
                dijkstra_time = float('nan')

            # Test Floyd-Warshall algorithm
            try:
                if size <= 500:  # Limit Floyd-Warshall to smaller graphs due to O(n³) complexity
                    floyd_warshall_metrics = measure_floyd_warshall_performance(weighted_graph)
                    floyd_warshall_time = floyd_warshall_metrics["execution_time"]
                else:
                    print(f"    Skipping Floyd-Warshall for size {size} (too large)")
                    floyd_warshall_time = float('nan')
            except Exception as e:
                print(f"    Error in Floyd-Warshall: {e}")
                floyd_warshall_time = float('nan')

            # Store results
            results_dijkstra[graph_type].append(dijkstra_time)
            results_floyd_warshall[graph_type].append(floyd_warshall_time)

            print(f"    Dijkstra={dijkstra_time:.2f}ms, Floyd-Warshall={floyd_warshall_time:.2f}ms")

    return results_dijkstra, results_floyd_warshall


def plot_results(results_dijkstra, results_floyd_warshall):
    """Generate performance comparison plots"""
    # Create a figure with two vertically stacked subplots
    plt.figure(figsize=(15, 10))

    # Plot 1: Dijkstra performance (top)
    plt.subplot(2, 1, 1)
    for graph_type, times in results_dijkstra.items():
        # Replace NaN values with None for plotting
        times_clean = [t if not np.isnan(t) else None for t in times]
        valid_times = [(s, t) for s, t in zip(SIZES, times_clean) if t is not None]
        if valid_times:
            sizes_valid, times_valid = zip(*valid_times)
            plt.plot(sizes_valid, times_valid, marker='o', label=graph_type)

    plt.title('Dijkstra Algorithm Performance Across Graph Types')
    plt.xlabel('Number of Nodes')
    plt.ylabel('Time (ms)')
    plt.grid(True, alpha=0.3)
    plt.legend(loc='upper left')

    # Plot 2: Floyd-Warshall performance (bottom)
    plt.subplot(2, 1, 2)
    for graph_type, times in results_floyd_warshall.items():
        # Replace NaN values with None for plotting
        times_clean = [t if not np.isnan(t) else None for t in times]
        valid_times = [(s, t) for s, t in zip(SIZES, times_clean) if t is not None]
        if valid_times:
            sizes_valid, times_valid = zip(*valid_times)
            plt.plot(sizes_valid, times_valid, marker='o', label=graph_type)

    plt.title('Floyd-Warshall Algorithm Performance Across Graph Types')
    plt.xlabel('Number of Nodes')
    plt.ylabel('Time (ms)')
    plt.grid(True, alpha=0.3)
    plt.legend(loc='upper left')

    plt.tight_layout()
    plt.savefig("graphs/lab4/algorithm_comparison.png")
    plt.close()

    # Individual plots for each graph type
    for graph_type in GRAPH_TYPES:
        plt.figure(figsize=(10, 6))

        # Get Dijkstra times for this graph type
        dijkstra_times = results_dijkstra[graph_type]
        dijkstra_times_clean = [t if not np.isnan(t) else None for t in dijkstra_times]
        valid_dijkstra = [(s, t) for s, t in zip(SIZES, dijkstra_times_clean) if t is not None]

        # Get Floyd-Warshall times for this graph type
        floyd_warshall_times = results_floyd_warshall[graph_type]
        floyd_warshall_times_clean = [t if not np.isnan(t) else None for t in floyd_warshall_times]
        valid_floyd_warshall = [(s, t) for s, t in zip(SIZES, floyd_warshall_times_clean) if t is not None]

        # Plot Dijkstra times
        if valid_dijkstra:
            sizes_valid, times_valid = zip(*valid_dijkstra)
            plt.plot(sizes_valid, times_valid, marker='o', label='Dijkstra', color='violet')

        # Plot Floyd-Warshall times
        if valid_floyd_warshall:
            sizes_valid, times_valid = zip(*valid_floyd_warshall)
            plt.plot(sizes_valid, times_valid, marker='+', label='Floyd-Warshall', color='slateblue')

        plt.title(f'Shortest Path Algorithms on {graph_type}')
        plt.xlabel('Number of Nodes')
        plt.ylabel('Time (ms)')
        plt.grid(True)
        plt.legend()
        plt.tight_layout()
        plt.savefig(f"graphs/lab4/{graph_type.replace(' ', '_').lower()}_comparison.png")
        plt.close()


def main():
    """Main function to run tests and generate visualizations"""
    print("Starting shortest path algorithm tests...")
    global results_dijkstra, results_floyd_warshall
    results_dijkstra, results_floyd_warshall = run_tests()

    print("Generating performance plots...")
    plot_results(results_dijkstra, results_floyd_warshall)

    print("All tests completed. Results saved to graphs/lab4/")


if __name__ == "__main__":
    main()