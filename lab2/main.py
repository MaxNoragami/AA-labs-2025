import sys
import time
import random
from prettytable import PrettyTable
from heap_sort import heap_sort
from insertion_sort import insertion_sort
from merge_sort import merge_sort
from quick_sort import quick_sort
from tim_sort import tim_sort
import matplotlib.pyplot as plt  # Added for plotting


# Define wrappers for sorting functions that require indices
def merge_sort_wrapper(arr):
    merge_sort(arr, 0, len(arr) - 1)


def quick_sort_wrapper(arr):
    quick_sort(arr, 0, len(arr) - 1)


# List of sorting algorithms with names and functions
sort_algorithms = [
    ("Heap Sort", heap_sort),
    ("Insertion Sort", insertion_sort),
    ("Merge Sort", merge_sort_wrapper),
    ("Quick Sort", quick_sort_wrapper),
    ("Tim Sort", tim_sort)
]


# Pattern generation functions (unchanged)
def generate_reversed_sorted(n):
    return list(range(n, 0, -1))


def generate_almost_sorted(n):
    arr = list(range(1, n + 1))
    num_swaps = max(1, n // 20)
    for _ in range(num_swaps):
        i, j = random.sample(range(n), 2)
        arr[i], arr[j] = arr[j], arr[i]
    return arr


def generate_few_unique(n):
    num_unique = max(1, int(n ** 0.5))
    unique_vals = [random.randint(1, n) for _ in range(num_unique)]
    return [random.choice(unique_vals) for _ in range(n)]


def generate_random_int(n):
    return [random.randint(1, n) for _ in range(n)]


def generate_sorted(n):
    return list(range(1, n + 1))


def generate_sawtooth(n):
    arr = []
    for i in range(1, n // 2 + 1):
        arr.append(i)
        arr.append(n - i + 1)
    if n % 2 == 1:
        arr.append(n // 2 + 1)
    return arr


def generate_all_equal_except_one(n):
    arr = [5] * n
    outlier_index = random.randint(0, n - 1)
    arr[outlier_index] = random.choice([-100, 100])
    return arr


def generate_random_float(n):
    return [random.uniform(-100, 100) for _ in range(n)]


def generate_close_values(n):
    return [1.0 + random.uniform(-0.001, 0.001) for _ in range(n)]


# Dictionary mapping pattern names to generators (unchanged)
pattern_generators = {
    "Reversed Sorted Integers": generate_reversed_sorted,
    "Almost Sorted Integers": generate_almost_sorted,
    "Few Unique Integers": generate_few_unique,
    "Random Integers": generate_random_int,
    "Already Sorted Integers": generate_sorted,
    "Sawtooth Pattern Integers": generate_sawtooth,
    "All Elements Equal Except One Integer": generate_all_equal_except_one,
    "Random Floating-Point Numbers": generate_random_float,
    "Elements Very Close in Value Floats": generate_close_values
}

# Array sizes to test (unchanged)
array_sizes = [10, 100, 1000, 10000] # 100000, 1000000


# Function to measure execution time (unchanged)
def measure_time(sort_func, arr):
    arr_copy = arr.copy()
    start = time.perf_counter()
    try:
        sort_func(arr_copy)
        end = time.perf_counter()
        return end - start
    except Exception as e:
        print(f"Error in sorting: {e}")
        return None


# Main benchmarking function with plotting
def benchmark_sorting():
    sys.setrecursionlimit(99999999)

    # Initialize results dictionary to store average times
    results = {
        pattern_name: {sort_name: [] for sort_name, _ in sort_algorithms}
        for pattern_name in pattern_generators
    }

    # Benchmarking loop
    for n in array_sizes:
        print(f"\nArray size: {n}")
        for pattern_name, generator in pattern_generators.items():
            print(f"\nPattern: {pattern_name}")
            arr = generator(n)

            # Create a table for this pattern
            table = PrettyTable()
            table.field_names = ["Sorting Algorithm", "Average Time (s)"]

            # Benchmark each sorting algorithm
            for sort_name, sort_func in sort_algorithms:
                times = []
                for _ in range(5):
                    time_taken = measure_time(sort_func, arr)
                    if time_taken is not None:
                        times.append(time_taken)

                # Compute average time or use nan if no successful runs
                if times:
                    avg_time = sum(times) / len(times)
                else:
                    avg_time = float('nan')

                # Add to table (display "N/A" for nan)
                table.add_row([sort_name, "N/A" if avg_time != avg_time else f"{avg_time:.6f}"])

                # Append average time to results
                results[pattern_name][sort_name].append(avg_time)

            # Print the table
            print(table)

    # Generate plots for each pattern
    for pattern_name, sort_data in results.items():
        plt.figure()
        for sort_name, times in sort_data.items():
            plt.plot(array_sizes, times, marker='o', label=sort_name)
        plt.xscale('log')  # Log scale for x-axis due to exponential array sizes
        plt.xlabel('Array Size')
        plt.ylabel('Average Time (s)')
        plt.title(f'Sorting Algorithms Performance on {pattern_name}')
        plt.legend()
        plt.grid(True)
        # Save the plot with a safe filename
        safe_pattern_name = pattern_name.replace(' ', '_').replace('-', '_')
        plt.savefig(f'{safe_pattern_name}.png')
        plt.close()


# Run the benchmark
if __name__ == "__main__":
    benchmark_sorting()