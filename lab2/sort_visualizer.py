import pygame
import sys
import random

pygame.init()
pygame.font.init()

# Gruvbox color scheme
gruvbox = {
    "bg": (40, 40, 40),  # background
    "fg": (235, 219, 178),  # foreground/text
    "red": (251, 73, 52),
    "green": (184, 187, 38),
    "yellow": (250, 189, 47),
    "blue": (131, 165, 152),
    "purple": (211, 134, 155),
    "orange": (254, 128, 25)
}

# ----- UI ELEMENTS -----
class Dropdown:
    def __init__(self, x, y, w, h, options, font):
        self.rect = pygame.Rect(x, y, w, h)
        self.options = options
        self.font = font
        self.selected = 0
        self.active = False

    def draw(self, surface):
        pygame.draw.rect(surface, gruvbox["blue"], self.rect, 0, border_radius=4)
        text_surf = self.font.render(self.options[self.selected], True, gruvbox["fg"])
        surface.blit(text_surf, (self.rect.x + 5, self.rect.y + 5))
        pygame.draw.polygon(surface, gruvbox["fg"],
                            [(self.rect.right - 15, self.rect.y + 10),
                             (self.rect.right - 5, self.rect.y + 10),
                             (self.rect.right - 10, self.rect.y + 20)])
        if self.active:
            for i, option in enumerate(self.options):
                option_rect = pygame.Rect(self.rect.x, self.rect.y + (i + 1) * self.rect.height,
                                          self.rect.width, self.rect.height)
                pygame.draw.rect(surface, gruvbox["blue"], option_rect, 0, border_radius=4)
                option_surf = self.font.render(option, True, gruvbox["fg"])
                surface.blit(option_surf, (option_rect.x + 5, option_rect.y + 5))

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                self.active = not self.active
            elif self.active:
                for i, option in enumerate(self.options):
                    option_rect = pygame.Rect(self.rect.x, self.rect.y + (i + 1) * self.rect.height,
                                              self.rect.width, self.rect.height)
                    if option_rect.collidepoint(event.pos):
                        self.selected = i
                        self.active = False
                        break
                else:
                    self.active = False

class Button:
    def __init__(self, x, y, w, h, text, font):
        self.rect = pygame.Rect(x, y, w, h)
        self.text = text
        self.font = font

    def draw(self, surface):
        pygame.draw.rect(surface, gruvbox["purple"], self.rect, 0, border_radius=4)
        text_surf = self.font.render(self.text, True, gruvbox["fg"])
        text_rect = text_surf.get_rect(center=self.rect.center)
        surface.blit(text_surf, text_rect)

    def is_clicked(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                return True
        return False

class Slider:
    def __init__(self, x, y, w, h, min_val, max_val, initial, label, font):
        self.rect = pygame.Rect(x, y, w, h)
        self.min_val = min_val
        self.max_val = max_val
        self.value = initial
        self.knob_radius = h // 2
        self.dragging = False
        self.label = label
        self.font = font

    def draw(self, surface):
        text = self.font.render(f"{self.label}: {self.value}", True, gruvbox["fg"])
        surface.blit(text, (self.rect.x, self.rect.y - 25))
        line_y = self.rect.y + self.rect.height // 2
        pygame.draw.line(surface, gruvbox["fg"], (self.rect.x, line_y), (self.rect.right, line_y), 3)
        proportion = (self.value - self.min_val) / (self.max_val - self.min_val)
        knob_x = int(self.rect.x + proportion * self.rect.width)
        pygame.draw.circle(surface, gruvbox["yellow"], (knob_x, line_y), self.knob_radius)

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                self.dragging = True
                self.update_value(event.pos)
        elif event.type == pygame.MOUSEBUTTONUP:
            self.dragging = False
        elif event.type == pygame.MOUSEMOTION:
            if self.dragging:
                self.update_value(event.pos)

    def update_value(self, pos):
        x = pos[0]
        if x < self.rect.x:
            x = self.rect.x
        elif x > self.rect.right:
            x = self.rect.right
        proportion = (x - self.rect.x) / self.rect.width
        self.value = int(self.min_val + proportion * (self.max_val - self.min_val))

class InputBox:
    def __init__(self, x, y, w, h, text, font, label=""):
        self.rect = pygame.Rect(x, y, w, h)
        self.color_inactive = gruvbox["blue"]
        self.color_active = gruvbox["yellow"]
        self.color = self.color_inactive
        self.text = text
        self.font = font
        self.txt_surface = font.render(text, True, gruvbox["fg"])
        self.active = False
        self.label = label

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                self.active = True
            else:
                self.active = False
            self.color = self.color_active if self.active else self.color_inactive
        if event.type == pygame.KEYDOWN:
            if self.active:
                if event.key == pygame.K_RETURN:
                    self.active = False
                    self.color = self.color_inactive
                elif event.key == pygame.K_BACKSPACE:
                    self.text = self.text[:-1]
                else:
                    if event.unicode.isdigit() or event.unicode in "-.":
                        self.text += event.unicode
                self.txt_surface = self.font.render(self.text, True, gruvbox["fg"])

    def draw(self, surface):
        if self.label:
            label_surf = self.font.render(self.label, True, gruvbox["fg"])
            surface.blit(label_surf, (self.rect.x, self.rect.y - 25))
        surface.blit(self.txt_surface, (self.rect.x + 5, self.rect.y + 5))
        pygame.draw.rect(surface, self.color, self.rect, 2)

class Checkbox:
    def __init__(self, x, y, size, font, label):
        self.rect = pygame.Rect(x, y, size, size)
        self.size = size
        self.font = font
        self.label = label
        self.checked = False
        self.color = gruvbox["fg"]
        self.bg_color = gruvbox["bg"]

    def draw(self, surface):
        pygame.draw.rect(surface, self.bg_color, self.rect)
        pygame.draw.rect(surface, self.color, self.rect, 2)
        if self.checked:
            inner_rect = self.rect.inflate(-4, -4)
            pygame.draw.rect(surface, self.color, inner_rect)
        label_surf = self.font.render(self.label, True, gruvbox["fg"])
        label_x = self.rect.right + 10
        label_y = self.rect.y + (self.size - label_surf.get_height()) // 2
        surface.blit(label_surf, (label_x, label_y))

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                self.checked = not self.checked

# ----- Sorting Algorithm Generators -----
def insertion_sort_visual(arr, left=0, right=None):
    if right is None:
        right = len(arr) - 1
    for i in range(left + 1, right + 1):
        key = arr[i]
        j = i - 1
        while j >= left and arr[j] > key:
            arr[j + 1] = arr[j]
            finalized = list(range(i)) if left == 0 and right == len(arr) - 1 else []
            yield arr, (j, j + 1), finalized.copy()
            j -= 1
        arr[j + 1] = key
        finalized = list(range(i + 1)) if left == 0 and right == len(arr) - 1 else []
        yield arr, (j + 1, i), finalized.copy()
    if left == 0 and right == len(arr) - 1:
        yield arr, None, list(range(len(arr)))

def binary_insertion_sort_visual(arr, left=0, right=None):
    if right is None:
        right = len(arr) - 1
    for i in range(left + 1, right + 1):
        key = arr[i]
        # Binary search to find the insertion position
        low = left
        high = i
        while low < high:
            mid = low + (high - low) // 2
            if arr[mid] < key:
                low = mid + 1
            else:
                high = mid
        pos = low
        # Shift elements from pos to i-1 to the right
        for j in range(i - 1, pos - 1, -1):
            arr[j + 1] = arr[j]
            finalized = list(range(left, i + 1)) if left == 0 and right == len(arr) - 1 else []
            yield arr, (j, j + 1), finalized.copy()
        # Insert the key at pos
        arr[pos] = key
        finalized = list(range(left, i + 1)) if left == 0 and right == len(arr) - 1 else []
        yield arr, (pos, i), finalized.copy()
    # If sorting the entire array, yield with all finalized
    if left == 0 and right == len(arr) - 1:
        yield arr, None, list(range(len(arr)))

def quick_sort_visual(arr):
    finalized = []
    stack = [(0, len(arr) - 1)]
    while stack:
        low, high = stack.pop()
        if low < high:
            pivot = arr[high]
            i = low - 1
            for j in range(low, high):
                if arr[j] <= pivot:
                    i += 1
                    arr[i], arr[j] = arr[j], arr[i]
                    yield arr, (i, j), finalized.copy()
            arr[i + 1], arr[high] = arr[high], arr[i + 1]
            p = i + 1
            finalized.append(p)
            yield arr, (i + 1, high), finalized.copy()
            stack.append((low, p - 1))
            stack.append((p + 1, high))
        elif low == high and low not in finalized:
            finalized.append(low)
            yield arr, None, finalized.copy()
    all_indices = set(range(len(arr)))
    missing = all_indices - set(finalized)
    if missing:
        finalized.extend(missing)
        yield arr, None, finalized

def heapify_visual(arr, n, i, finalized):
    largest = i
    l = 2 * i + 1
    r = 2 * i + 2
    if l < n and arr[l] > arr[largest]:
        largest = l
    if r < n and arr[r] > arr[largest]:
        largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        yield arr, (i, largest), finalized.copy()
        yield from heapify_visual(arr, n, largest, finalized)

def heap_sort_visual(arr):
    n = len(arr)
    finalized = []
    for i in range(n // 2 - 1, -1, -1):
        yield from heapify_visual(arr, n, i, finalized)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        finalized.append(i)
        yield arr, (0, i), finalized.copy()
        yield from heapify_visual(arr, i, 0, finalized)
    if 0 not in finalized:
        finalized.append(0)
        yield arr, None, finalized
    all_indices = set(range(len(arr)))
    if len(finalized) < len(arr):
        finalized = list(all_indices)
        yield arr, None, finalized

def merge_sort_visual(arr):
    n = len(arr)
    finalized = []
    curr_size = 1
    while curr_size < n:
        for left in range(0, n, 2 * curr_size):
            mid = min(n - 1, left + curr_size - 1)
            right = min(n - 1, left + 2 * curr_size - 1)
            merged = []
            i = left
            j = mid + 1
            while i <= mid and j <= right:
                if arr[i] <= arr[j]:
                    merged.append(arr[i])
                    i += 1
                else:
                    merged.append(arr[j])
                    j += 1
                yield arr, None, finalized.copy()
            while i <= mid:
                merged.append(arr[i])
                i += 1
                yield arr, None, finalized.copy()
            while j <= right:
                merged.append(arr[j])
                j += 1
                yield arr, None, finalized.copy()
            for k in range(len(merged)):
                arr[left + k] = merged[k]
                yield arr, (left + k, None), finalized.copy()
            if curr_size * 2 >= n:
                for idx in range(left, min(left + len(merged), n)):
                    if idx not in finalized:
                        finalized.append(idx)
        curr_size *= 2
    all_indices = set(range(len(arr)))
    missing = all_indices - set(finalized)
    if missing:
        finalized.extend(missing)
        yield arr, None, finalized


def merge_visual(left, right):
    result = []
    i, j = 0, 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            # Yield the current state; use None for indices since we're working with copies
            yield result, (i if i < len(left) else None, j if j < len(right) else None), []
            i += 1
        else:
            result.append(right[j])
            yield result, (i if i < len(left) else None, j if j < len(right) else None), []
            j += 1
    # Remaining elements
    while i < len(left):
        result.append(left[i])
        yield result, (i, None), []
        i += 1
    while j < len(right):
        result.append(right[j])
        yield result, (None, j), []
        j += 1
    yield result, None, []


def tim_sort_visual(arr):
    min_run = 32
    n = len(arr)

    # Sort individual subarrays of size min_run
    for i in range(0, n, min_run):
        end = min(i + min_run - 1, n - 1)
        yield from binary_insertion_sort_visual(arr, i, end)

    size = min_run
    while size < n:
        for start in range(0, n, size * 2):
            midpoint = start + size
            end = min((start + size * 2 - 1), (n - 1))
            if midpoint <= end:  # Ensure there’s something to merge
                left = arr[start:midpoint]
                right = arr[midpoint:end + 1]

                # Merge using the visual merge function
                merge_gen = merge_visual(left, right)
                merged = []
                for merged_state, indices, finalized in merge_gen:
                    merged = merged_state
                    # Yield the original array state; indices are illustrative
                    yield arr, indices, []

                # Copy merged result back to arr, yielding each step
                for k, val in enumerate(merged):
                    arr[start + k] = val
                    yield arr, (start + k, None), []

        size *= 2

    # Final yield with all indices finalized
    yield arr, None, list(range(n))

# ----- Array Presets and Custom Generation -----
def generate_array(preset, n, min_val, max_val):
    min_val, max_val = min(min_val, max_val), max(min_val, max_val)
    if preset == "Random":
        return [random.uniform(min_val, max_val) for _ in range(n)]
    elif preset == "Nearly Sorted":
        arr = [min_val + (max_val - min_val) * (i / (n-1)) for i in range(n)]
        for _ in range(max(1, n // 10)):
            i, j = random.sample(range(n), 2)
            arr[i], arr[j] = arr[j], arr[i]
        return arr
    elif preset == "Reversed":
        return [max_val - (max_val - min_val) * (i / (n-1)) for i in range(n)]
    elif preset == "Few Unique":
        num_unique = min(5, int(max_val - min_val + 1))
        choices = [random.uniform(min_val, max_val) for _ in range(num_unique)]
        return [random.choice(choices) for _ in range(n)]
    elif preset == "Already Sorted":
        return [min_val + (max_val - min_val) * (i / (n-1)) for i in range(n)]
    elif preset == "Sawtooth":
        arr = []
        for i in range(n):
            if i % 2 == 0:
                arr.append(min_val + random.uniform(0, 0.1) * (max_val - min_val))
            else:
                arr.append(max_val - random.uniform(0, 0.1) * (max_val - min_val))
        return arr
    elif preset == "All Equal Except One":
        base = (min_val + max_val) / 2
        arr = [base] * n
        if n > 0:
            outlier_index = random.randint(0, n-1)
            arr[outlier_index] = random.choice([min_val, max_val])
        return arr
    elif preset == "Very Close":
        base = (min_val + max_val) / 2
        epsilon = 0.001
        return [base + random.uniform(-epsilon, epsilon) for _ in range(n)]
    else:
        return [random.uniform(min_val, max_val) for _ in range(n)]

# ----- Pygame Setup -----
sys.setrecursionlimit(99999)
infoObject = pygame.display.Info()
WIDTH, HEIGHT = infoObject.current_w, infoObject.current_h
screen = pygame.display.set_mode((WIDTH, HEIGHT), pygame.FULLSCREEN)
pygame.display.set_caption("Sorting Visualizer")
clock = pygame.time.Clock()
font = pygame.font.SysFont("Arial", 20)

# Create UI elements
ui_margin = 30
dropdown_width = 200
dropdown_height = 40
input_width = 160
input_height = 40
button_width = 120
button_height = 40
slider_width = 240

algo_options = ["Quick Sort", "Merge Sort", "Heap Sort", "Insertion Sort", "Tim Sort", "All"]
preset_options = ["Random", "Nearly Sorted", "Reversed", "Few Unique",
                  "Already Sorted", "Sawtooth", "All Equal Except One", "Very Close"]
algorithm_dropdown = Dropdown(ui_margin, 100, dropdown_width, dropdown_height, algo_options, font)
preset_dropdown = Dropdown(ui_margin + dropdown_width + 20, 100, dropdown_width, dropdown_height, preset_options, font)
sort_button = Button(ui_margin + 2 * (dropdown_width + 20), 100, button_width, button_height, "SORT", font)
reset_button = Button(ui_margin + 2 * (dropdown_width + 20) + button_width + 20, 100, button_width, button_height, "RESET", font)
speed_slider = Slider(ui_margin + 2 * (dropdown_width + 20) + 2 * (button_width + 20), 100, slider_width, button_height, 5, 100, 30, "Delay (ms)", font)
num_elements_box = InputBox(ui_margin, 50, input_width, input_height, "50", font, "Array Size")
min_value_box = InputBox(ui_margin + input_width + 20, 50, input_width, input_height, "-10.0", font, "Min Value")
max_value_box = InputBox(ui_margin + 2 * (input_width + 20), 50, input_width, input_height, "100.0", font, "Max Value")
exit_button = Button(WIDTH - button_width - ui_margin, ui_margin, button_width, button_height, "EXIT", font)
checkbox = Checkbox(ui_margin, 150, 20, font, "Show Values")
# Global state for sorting
all_mode = False
arrays = [generate_array(preset_options[preset_dropdown.selected],
                         int(num_elements_box.text),
                         float(min_value_box.text),
                         float(max_value_box.text))]
generators = []
highlight_indices_list = [None]
finalized_indices_list = [[]]
sorting_complete = [False]
sorting_in_progress = False
start_ticks = []
end_ticks = []

# ----- Main Loop -----
while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
            pygame.quit()
            sys.exit()

        algorithm_dropdown.handle_event(event)
        preset_dropdown.handle_event(event)
        speed_slider.handle_event(event)
        num_elements_box.handle_event(event)
        min_value_box.handle_event(event)
        max_value_box.handle_event(event)
        checkbox.handle_event(event)

        if exit_button.is_clicked(event):
            pygame.quit()
            sys.exit()

        if sort_button.is_clicked(event) and not sorting_in_progress:
            try:
                n = int(num_elements_box.text)
                min_val = float(min_value_box.text)
                max_val = float(max_value_box.text)
            except:
                n, min_val, max_val = 50, -10.0, 100.0

            max_elements = WIDTH - 2 * ui_margin
            if n > max_elements:
                n = max_elements
                num_elements_box.text = str(n)
                num_elements_box.txt_surface = font.render(num_elements_box.text, True, gruvbox["fg"])

            base_array = generate_array(preset_options[preset_dropdown.selected], n, min_val, max_val)

            if algorithm_dropdown.selected == 5:  # "All"
                all_mode = True
                arrays = [base_array.copy() for _ in range(5)]
                generators = [
                    quick_sort_visual(arrays[0]),
                    merge_sort_visual(arrays[1]),
                    heap_sort_visual(arrays[2]),
                    insertion_sort_visual(arrays[3]),
                    tim_sort_visual(arrays[4])
                ]
                highlight_indices_list = [None] * 5
                finalized_indices_list = [[] for _ in range(5)]
                sorting_complete = [False] * 5
            else:
                all_mode = False
                arrays = [base_array]
                algo = algo_options[algorithm_dropdown.selected]
                if algo == "Quick Sort":
                    generators = [quick_sort_visual(arrays[0])]
                elif algo == "Merge Sort":
                    generators = [merge_sort_visual(arrays[0])]
                elif algo == "Heap Sort":
                    generators = [heap_sort_visual(arrays[0])]
                elif algo == "Insertion Sort":
                    generators = [insertion_sort_visual(arrays[0])]
                elif algo == "Tim Sort":
                    generators = [tim_sort_visual(arrays[0])]
                highlight_indices_list = [None]
                finalized_indices_list = [[]]
                sorting_complete = [False]
            start_ticks = [pygame.time.get_ticks()] * len(arrays)
            end_ticks = [None] * len(arrays)
            sorting_in_progress = True

        if reset_button.is_clicked(event):
            sorting_in_progress = False
            all_mode = False
            try:
                n = int(num_elements_box.text)
                min_val = float(min_value_box.text)
                max_val = float(max_value_box.text)
            except:
                n, min_val, max_val = 50, -10.0, 100.0
            max_elements = WIDTH - 2 * ui_margin
            if n > max_elements:
                n = max_elements
                num_elements_box.text = str(n)
                num_elements_box.txt_surface = font.render(num_elements_box.text, True, gruvbox["fg"])
            arrays = [generate_array(preset_options[preset_dropdown.selected], n, min_val, max_val)]
            generators = []
            highlight_indices_list = [None]
            finalized_indices_list = [[]]
            sorting_complete = [False]

    screen.fill(gruvbox["bg"])

    # Sorting step
    if sorting_in_progress:
        for i in range(len(generators)):
            if not sorting_complete[i]:
                try:
                    arrays[i], highlight_indices_list[i], finalized_indices_list[i] = next(generators[i])
                    if len(finalized_indices_list[i]) == len(arrays[i]):
                        sorting_complete[i] = True
                        end_ticks[i] = pygame.time.get_ticks()
                except StopIteration:
                    sorting_complete[i] = True
                    end_ticks[i] = pygame.time.get_ticks()
                    highlight_indices_list[i] = None
                    finalized_indices_list[i] = list(range(len(arrays[i])))
        pygame.time.delay(speed_slider.value)
        if all(sorting_complete):
            sorting_in_progress = False

    # ----- Draw Array Visualization -----
    vis_top = 160
    vis_bottom = HEIGHT - ui_margin
    vis_height = vis_bottom - vis_top
    total_width = WIDTH - 2 * ui_margin

    if all_mode:
        spacing = 10
        section_width = (total_width - 4 * spacing) / 5
    else:
        spacing = 0
        section_width = total_width

    for idx in range(len(arrays)):
        section_x = ui_margin + idx * (section_width + spacing)
        if all_mode:
            algo_name = algo_options[idx]
        else:
            algo_name = algo_options[algorithm_dropdown.selected]
        name_surf = font.render(algo_name, True, gruvbox["fg"])
        name_rect = name_surf.get_rect(center=(section_x + section_width / 2, vis_top - 20))
        screen.blit(name_surf, name_rect)

        arr = arrays[idx]
        n = len(arr)
        if n > 0:
            bar_width = section_width / n
            arr_min = min(arr)
            arr_max = max(arr)
            full_range = arr_max - arr_min if arr_max - arr_min != 0 else 1
            baseline = vis_bottom - ((0 - arr_min) / full_range) * vis_height
            pygame.draw.line(screen, gruvbox["fg"], (section_x, baseline), (section_x + section_width, baseline), 2)
            for i, val in enumerate(arr):
                bar_height = abs(val) / full_range * vis_height
                x = section_x + i * bar_width
                if val >= 0:
                    y = baseline - bar_height
                else:
                    y = baseline
                if i in finalized_indices_list[idx]:
                    color = gruvbox["blue"]
                elif highlight_indices_list[idx] is not None and (i == highlight_indices_list[idx][0] or
                                                                  (highlight_indices_list[idx][1] is not None and i == highlight_indices_list[idx][1])):
                    color = gruvbox["red"]
                else:
                    color = gruvbox["green"]
                if sorting_complete[idx]:
                    color = gruvbox["blue"]
                pygame.draw.rect(screen, color, (x, y, max(1, bar_width - 1), bar_height))
                if checkbox.checked:  # Add this block
                    val_text = font.render(f"{val:.2f}", True, gruvbox["fg"])
                    text_x = x + (bar_width - val_text.get_width()) / 2
                    text_y = y - val_text.get_height() - 5 if val >= 0 else y + bar_height + 5
                    screen.blit(val_text, (text_x, text_y))
        if sorting_complete[idx] and end_ticks[idx] is not None:
            elapsed_time = (end_ticks[idx] - start_ticks[idx]) / 1000.0
            time_text = f"Time: {elapsed_time:.2f} s"
            overlay = pygame.Surface((section_width, vis_height), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 128))
            screen.blit(overlay, (section_x, vis_top))
            text_surf = font.render(time_text, True, gruvbox["fg"])
            text_rect = text_surf.get_rect(center=(section_x + section_width / 2, vis_top + vis_height / 2))
            screen.blit(text_surf, text_rect)

    algorithm_dropdown.draw(screen)
    preset_dropdown.draw(screen)
    sort_button.draw(screen)
    reset_button.draw(screen)
    speed_slider.draw(screen)
    num_elements_box.draw(screen)
    min_value_box.draw(screen)
    max_value_box.draw(screen)
    exit_button.draw(screen)
    checkbox.draw(screen)

    pygame.display.flip()
    clock.tick(60)