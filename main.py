from decimal import Decimal, Context, ROUND_HALF_EVEN

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
    # Initialize helper matrix
    mat2 = [[1, 1],
            [1, 0]]

    # Recursively compute mat1^(n // 2)
    for i in range(2, n + 1):
        multiply(mat1, mat2)


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

low_n_terms = [5, 7, 10, 12, 15, 17, 20, 22, 25, 27, 30, 32, 35, 37, 40, 42, 45]
medium_n_terms = [501, 631, 794, 1000, 1259, 1995, 2512, 3162, 3981, 5012, 6310, 7943, 10000, 12569, 15420, 18000, 23000, 25544, 30000]
