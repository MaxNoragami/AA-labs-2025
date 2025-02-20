import sys
from decimal import Decimal, Context, ROUND_HALF_EVEN
from prettytable import PrettyTable
import time
import matplotlib.pyplot as plt

# ------------------------------------------------------------------------------------------

# Auxiliary setup

# Memo for memoization implementation
memo = {0: 0, 1: 1}

# Multiplies two 2x2 matrices
def multiply(mat1, mat2):
    # Perform matrix multiplication
    x = (mat1[0][0] * mat2[0][0] +
         mat1[0][1] * mat2[1][0])
    y = (mat1[0][0] * mat2[0][1] +
         mat1[0][1] * mat2[1][1])
    z = (mat1[1][0] * mat2[0][0] +
         mat1[1][1] * mat2[1][0])
    w = (mat1[1][0] * mat2[0][1] +
         mat1[1][1] * mat2[1][1])

    # Update matrix mat1 with the result
    mat1[0][0], mat1[0][1] = x, y
    mat1[1][0], mat1[1][1] = z, w

# Performs matrix exponentiation
def power(mat1, n):
    if n <= 1:
        return

    # Initialize helper matrix
    mat2 = [[1, 1],
            [1, 0]]

    power(mat1, n // 2)
    multiply(mat1, mat1)

    # Recursively compute mat1^(n // 2)
    if n % 2 != 0:
        multiply(mat1, mat2)

# ------------------------------------------------------------------------------------------

# Methods to find 'n'th term of Fibonacci

# Using the Recursive method
def recursive(n):
    if n <= 1:
        return n
    else:
        return recursive(n-1) + recursive(n-2)

# Dynamic Programming implementation
def dynamic_programming(n):
    if n <= 1:
        return n

    # List to store Fibonacci nums
    li = [0] * (n + 1)

    # Initialize first two Fibonacci nums
    li[0] = 0
    li[1] = 1

    # Fill rest the list iteratively
    for i in range(2, n + 1):
        li[i] = li[i - 1] + li[i - 2]

    # Return the 'n' Fibonacci
    return li[n]

# Matrix Exponentiation implementation
def matrix_power(n):
    if n <= 1:
        return n

    # Initialize transformation matrix
    mat1 = [[1, 1],
            [1, 0]]

    # Raise the matrix 'mat1' to the power (n - 1)
    power(mat1, n - 1)

    return mat1[0][0]

# Binet Formula implementation
def binet_formula(n):
    ctx = Context(prec=60, rounding=ROUND_HALF_EVEN)
    phi = Decimal((1 + Decimal(5**(1/2))))
    psi = Decimal((1 - Decimal(5**(1/2))))

    return int((ctx.power(phi, Decimal(n)) - ctx.power(psi, Decimal(n))) / (2 ** n * Decimal(5 ** (1/2))))

# Memoization implementation
def memo_recursive(n):
    if n in memo:
        return memo[n]

    # Compute and memo the Fibonacci num
    memo[n] = memo_recursive(n - 1) + memo_recursive(n - 2)
    return memo[n]

# Iterative Space Optimized implementation
def space_optimized(n):
    if n <= 1:
        return n

    # To store current Fibonacci num
    current = 0

    # To store the previous Fibonacci num
    prev1 = 1
    prev2 = 0

    # Loop to compute the Fibonacci from 2 to n
    for i in range(2, n + 1):
        # Compute the current Fibonacci num
        current = prev1 + prev2

        # Update prev num
        prev2 = prev1
        prev1 = current
    return current

# The main method for Fast Doubling implementation
def fast_doubling(n):
    return _fib(n)[0]

# Auxiliary method for Fast Doubling
def _fib(n):
    if n == 0:
        return 0, 1
    else:
        a, b = _fib(n // 2)
        c = a * (b * 2 - a)
        d = a * a + b * b
        if n % 2 == 0:
            return c, d
        else:
            return d, c + d

# ------------------------------------------------------------------------------------------

# Methods for collecting the statistics regarding the algorithms

# Register execution time for an implementation when computing a specific 'n' term
def measure_execution_time(func, n):
    start_time = time.time()
    func(n)
    end_time = time.time()
    return end_time - start_time

# Method to create a comparison table
def create_fibonacci_comparison_table(n_terms_list, methods_dict):
    # Create table
    table = PrettyTable()

    # Set up headers
    headers = ["Method / n"] + [str(n) for n in n_terms_list]
    table.field_names = headers

    # Set alignment
    table.align["Method / n"] = "l"  # Left align method names
    for n in n_terms_list:
        table.align[str(n)] = "r"  # Right align numbers

    # Add rows for each method
    for method_num, (func, method_name) in methods_dict.items():
        row = [f"{method_num}. {method_name}"]

        # Measure time for each n
        for n in n_terms_list:
            try:
                execution_time = measure_execution_time(func, n)
                row.append(f"{execution_time:.6f}")
            except (RecursionError, MemoryError) as e:
                row.append("Error")
            except Exception as e:
                row.append(f"Error: {str(e)}")

        table.add_row(row)

    return table

# Method to extract the computed data from tables, so it will be used to plot the graphs
def extract_data_from_table(table):
    # Extract n terms from headers (skip first column which is "Method / n")
    n_terms = [int(header) for header in table.field_names[1:]]

    methods_data = {}
    # Process each row
    for row in table.rows:
        # Extract method name (remove the number prefix)
        method_name = row[0].split('. ')[1]
        # Convert execution times to float, handle 'Error' values
        times = []
        for time_str in row[1:]:
            try:
                times.append(float(time_str))
            except ValueError:
                times.append(None)  # Use None for error values
        methods_data[method_name] = times

    return n_terms, methods_data

# Method used to plot the graph for a specified implementation
def plot_single_method_from_table(table, method_name, type_list_n_terms, save_plot=False):
    n_terms, methods_data = extract_data_from_table(table)

    if method_name not in methods_data:
        print(f"Method {method_name} not found in table data")
        return

    # Filter out None values (errors)
    times = methods_data[method_name]
    valid_points = [(n, t) for n, t in zip(n_terms, times) if t is not None]
    if not valid_points:
        print(f"No valid data points for {method_name}")
        return

    valid_n, valid_times = zip(*valid_points)

    plt.figure(figsize=(10, 6))
    plt.plot(valid_n, valid_times, 'o-', label=method_name)

    plt.title(f'Execution Time: {method_name}')
    plt.xlabel(f'n, from {type_list_n_terms} list')
    plt.ylabel('Execution Time (s)')
    plt.grid(True, alpha=0.8)
    plt.grid(which='minor', linestyle=':', linewidth=0.6)
    plt.minorticks_on()
    plt.legend()

    # Check for valid time values before deciding on log scale
    min_time = min(valid_times)
    max_time = max(valid_times)

    # Use logarithmic scale if there's high variance in times and no zero values
    if min_time > 0 and max_time / min_time > 100:
        plt.yscale('log')

    if save_plot:
        plt.savefig(f'fibonacci_{method_name.lower().replace(" ", "_")}.png')

    plt.show()

# Method used to plot all the data regarding each implementation into a single graph
def plot_all_methods_comparison_from_table(table, type_list_n_terms, save_plot=False):
    n_terms, methods_data = extract_data_from_table(table)

    plt.figure(figsize=(12, 8))

    # Colors for different methods
    colors = ['b', 'g', 'r', 'c', 'm', 'y', 'k']

    # Keep track of whether we have any valid data points
    has_valid_points = False
    min_time = float('inf')
    max_time = float('-inf')

    # Plot each method
    for (method_name, times), color in zip(methods_data.items(), colors):
        # Filter out None values (errors)
        valid_points = [(n, t) for n, t in zip(n_terms, times) if t is not None]
        if valid_points:
            has_valid_points = True
            valid_n, valid_times = zip(*valid_points)
            plt.plot(valid_n, valid_times, 'o-', label=method_name, color=color)

            # Update min and max times
            min_time = min(min_time, min(valid_times))
            max_time = max(max_time, max(valid_times))

    if not has_valid_points:
        print("No valid data points found for any method")
        plt.close()
        return

    plt.title('Comparison of Fibonacci Methods')
    plt.xlabel(f'n, from {type_list_n_terms} list')
    plt.ylabel('Execution Time (s)')
    plt.grid(True, alpha=0.8)
    plt.grid(which='minor', linestyle=':', linewidth=0.6)
    plt.minorticks_on()
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')

    # Use logarithmic scale only if we have valid non-zero times with high variance
    if min_time > 0 and max_time / min_time > 100:
        plt.yscale('log')

    # Adjust layout to prevent legend cutoff
    plt.tight_layout()

    if save_plot:
        plt.savefig('fibonacci_methods_comparison.png', bbox_inches='tight')

    plt.show()

# ------------------------------------------------------------------------------------------

methods = {
    1: (recursive, "Recursive"),
    2: (dynamic_programming, "Dynamic Programming"),
    3: (matrix_power, "Matrix Power"),
    4: (binet_formula, "Binet Formula"),
    5: (memo_recursive, "Memoization"),
    6: (space_optimized, "Space Optimized"),
    7: (fast_doubling, "Fast Doubling")
}

low_n_terms = [5, 7, 10, 12, 15, 17, 20, 22, 25, 27, 30, 32, 35, 37, 40, 42, 45]
medium_n_terms = [501, 631, 794, 1000, 1259, 1585, 1995, 2512, 3162, 3981, 5012, 6310, 7943, 10000, 12589, 15849]
high_n_terms = [0, 4000, 8000,  24000, 31000,50000, 60000, 72000, 84000, 95000, 105000, 117000, 124000, 140000, 160000, 170000, 190000, 220000, 250000, 300000, 350000, 400000, 450000, 500000]
sys.setrecursionlimit(99999)

# For low 'n' terms:
# table_low = create_fibonacci_comparison_table(low_n_terms, methods)
# print("Comparison for Low N Terms:")
# print(table_low)
#
# # Plot single method using table data
# for implementation in methods.values():
#     plot_single_method_from_table(table_low, implementation[1], "low")
#
# # Plot all methods comparison using table data
# plot_all_methods_comparison_from_table(table_low, "low")


# For medium 'n' terms:
methods_ex_recursive = {k: v for k, v in methods.items() if k != 1}
# table_medium = create_fibonacci_comparison_table(medium_n_terms, methods_ex_recursive)
# print("Comparison for Medium N Terms:")
# print(table_medium)
#
# # Plot single method using table data
# for implementation in methods_ex_recursive.values():
#     plot_single_method_from_table(table_medium, implementation[1], "medium")
#
# # Plot all methods comparison using table data
# plot_all_methods_comparison_from_table(table_medium, "medium")

# # For high 'n' terms:
table_high = create_fibonacci_comparison_table(high_n_terms, methods_ex_recursive)
print("Comparison for High N Terms:")
print(table_high)

# Plot single method using table data
for implementation in methods_ex_recursive.values():
    plot_single_method_from_table(table_high, implementation[1], "high")

# Plot all methods comparison using table data
plot_all_methods_comparison_from_table(table_high, "high")