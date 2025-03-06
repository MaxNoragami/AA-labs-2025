def binary_search(arr, key, left, right):
    low = left
    high = right
    while low < high:
        mid = low + (high - low) // 2  # Avoid potential overflow
        if arr[mid] < key:
            low = mid + 1
        else:
            high = mid
    return low

def binary_insertion_sort(arr, left=0, right=None):
    if right is None:
        right = len(arr) - 1

    for i in range(left + 1, right + 1):
        key = arr[i]
        # Find the insertion point in arr[left:i]
        pos = binary_search(arr, key, left, i)
        # Shift elements from pos to i-1 one position to the right
        arr[pos + 1:i + 1] = arr[pos:i]
        # Insert the key at the correct position
        arr[pos] = key
    return arr

def merge(left, right):
    result = []
    i, j = 0, 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result


def tim_sort(arr):
    min_run = 32
    n = len(arr)

    # Sort individual subarrays of size min_run
    for i in range(0, n, min_run):
        binary_insertion_sort(arr, i, min(i + min_run - 1, n - 1))

    size = min_run
    while size < n:
        for start in range(0, n, size * 2):
            midpoint = start + size
            end = min((start + size * 2 - 1), (n - 1))

            left = arr[start:midpoint]
            right = arr[midpoint:end + 1]

            # Merge left and right runs using an iterative merge function
            merged = merge(left, right)
            arr[start:start + len(merged)] = merged  # Modify in place

        size *= 2
    return arr