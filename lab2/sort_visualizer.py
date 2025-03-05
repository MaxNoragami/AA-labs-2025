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
        # Draw current selection box
        pygame.draw.rect(surface, gruvbox["blue"], self.rect, 0, border_radius=4)
        text_surf = self.font.render(self.options[self.selected], True, gruvbox["fg"])
        surface.blit(text_surf, (self.rect.x + 5, self.rect.y + 5))
        # Draw a down arrow
        pygame.draw.polygon(surface, gruvbox["fg"],
                            [(self.rect.right - 15, self.rect.y + 10),
                             (self.rect.right - 5, self.rect.y + 10),
                             (self.rect.right - 10, self.rect.y + 20)])
        # Draw options if active
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
            # If the user clicked on the input_box rect.
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
                    # Allow digits, negative sign, and period.
                    if event.unicode.isdigit() or event.unicode in "-.":
                        self.text += event.unicode
                self.txt_surface = self.font.render(self.text, True, gruvbox["fg"])

    def draw(self, surface):
        # Draw the label above the input box
        if self.label:
            label_surf = self.font.render(self.label, True, gruvbox["fg"])
            surface.blit(label_surf, (self.rect.x, self.rect.y - 25))

        # Blit the text.
        surface.blit(self.txt_surface, (self.rect.x + 5, self.rect.y + 5))
        # Blit the rect.
        pygame.draw.rect(surface, self.color, self.rect, 2)

    def get_value(self):
        try:
            # Return as float if possible, else integer
            if '.' in self.text:
                return float(self.text)
            else:
                return int(self.text)
        except:
            return 0


# ----- Sorting algorithm generators (yield array state and indices to highlight + finalized indices) -----

def insertion_sort_visual(arr, left=0, right=None):
    if right is None:
        right = len(arr) - 1

    for i in range(left + 1, right + 1):
        key = arr[i]
        j = i - 1
        while j >= left and arr[j] > key:
            arr[j + 1] = arr[j]
            # Only mark finalized if sorting the entire array
            finalized = list(range(i)) if left == 0 and right == len(arr) - 1 else []
            yield arr, (j, j + 1), finalized.copy()
            j -= 1
        arr[j + 1] = key
        # Update finalized after insertion
        finalized = list(range(i + 1)) if left == 0 and right == len(arr) - 1 else []
        yield arr, (j + 1, i), finalized.copy()

    # Final yield for full array
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
            finalized.append(p)  # Pivot is in its final place
            yield arr, (i + 1, high), finalized.copy()
            stack.append((low, p - 1))
            stack.append((p + 1, high))
        elif low == high and low not in finalized:
            finalized.append(low)  # Single element is in final place
            yield arr, None, finalized.copy()

    # Check if all indices are finalized, if not add them
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
        finalized.append(i)  # Mark this element as in final position
        yield arr, (0, i), finalized.copy()
        yield from heapify_visual(arr, i, 0, finalized)

    # Add index 0 to finalized at the end
    if 0 not in finalized:
        finalized.append(0)
        yield arr, None, finalized

    # Ensure all indices are marked as finalized
    all_indices = set(range(len(arr)))
    if len(finalized) < len(arr):
        finalized = list(all_indices)
        yield arr, None, finalized


def merge_sort_visual(arr):
    # For merge sort, we'll track sorted regions differently
    # Keep a list of indices that are considered "final" after each merge
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

            # Apply merged section back to array
            for k in range(len(merged)):
                arr[left + k] = merged[k]
                yield arr, (left + k, None), finalized.copy()

            # After a merge is complete, mark this section as potentially finalized
            if curr_size * 2 >= n:
                for idx in range(left, min(left + len(merged), n)):
                    if idx not in finalized:
                        finalized.append(idx)

        curr_size *= 2

    # Ensure all indices are marked as finalized at the end
    all_indices = set(range(len(arr)))
    missing = all_indices - set(finalized)
    if missing:
        finalized.extend(missing)
        yield arr, None, finalized

# For TimSort
def merge_visual(arr, left, mid, right):
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
        yield arr, (i if i <= mid else None, j if j <= right else None), []

    while i <= mid:
        merged.append(arr[i])
        i += 1
        yield arr, (i, None), []

    while j <= right:
        merged.append(arr[j])
        j += 1
        yield arr, (None, j), []

    for k, val in enumerate(merged):
        arr[left + k] = val
        yield arr, (left + k, None), []


def tim_sort_visual(arr):
    min_run = 32
    n = len(arr)

    # Sort runs with insertion sort
    for start in range(0, n, min_run):
        end = min(start + min_run - 1, n - 1)
        yield from insertion_sort_visual(arr, start, end)

    # Merge runs
    size = min_run
    while size < n:
        for left in range(0, n, 2 * size):
            mid = min(n - 1, left + size - 1)
            right = min(n - 1, left + 2 * size - 1)
            if mid < right:
                yield from merge_visual(arr, left, mid, right)
        size *= 2

    # Mark all indices as finalized
    yield arr, None, list(range(n))

# ----- Array presets and custom generation -----

def generate_array(preset, n, min_val, max_val):
    if preset == "Random":
        return [random.randint(min_val, max_val) for _ in range(n)]
    elif preset == "Nearly Sorted":
        arr = list(range(min_val, min_val + n))
        for _ in range(max(1, n // 10)):
            i, j = random.sample(range(n), 2)
            arr[i], arr[j] = arr[j], arr[i]
        return arr
    elif preset == "Reversed":
        return list(range(min_val + n, min_val, -1))
    elif preset == "Few Unique":
        choices = [random.randint(min_val, max_val) for _ in range(5)]
        return [random.choice(choices) for _ in range(n)]
    else:
        return [random.randint(min_val, max_val) for _ in range(n)]


# ----- Pygame setup -----

# Use fullscreen mode
infoObject = pygame.display.Info()
WIDTH, HEIGHT = infoObject.current_w, infoObject.current_h
screen = pygame.display.set_mode((WIDTH, HEIGHT), pygame.FULLSCREEN)
pygame.display.set_caption("Sorting Visualizer")
clock = pygame.time.Clock()
font = pygame.font.SysFont("Arial", 20)

# Create UI elements

# Position elements based on screen size
ui_margin = 30
dropdown_width = 200
dropdown_height = 40
input_width = 160
input_height = 40
button_width = 120
button_height = 40
slider_width = 240

# Dropdowns in the top row
algo_options = ["Quick Sort", "Merge Sort", "Heap Sort", "Insertion Sort", "Tim Sort"]
preset_options = ["Random", "Nearly Sorted", "Reversed", "Few Unique"]
algorithm_dropdown = Dropdown(ui_margin, 100, dropdown_width, dropdown_height, algo_options, font)
preset_dropdown = Dropdown(ui_margin + dropdown_width + 20, 100, dropdown_width, dropdown_height, preset_options, font)

# Buttons and speed slider appear just below dropdowns
sort_button = Button(ui_margin + 2 * (dropdown_width + 20), 100, button_width, button_height, "SORT", font)
reset_button = Button(ui_margin + 2 * (dropdown_width + 20) + button_width + 20, 100, button_width, button_height,
                      "RESET", font)
speed_slider = Slider(ui_margin + 2 * (dropdown_width + 20) + 2 * (button_width + 20), 100, slider_width, button_height,
                      5, 100, 30, "Delay (ms)", font)

# Input boxes for array parameters in a row above the dropdowns with labels
num_elements_box = InputBox(ui_margin, 50, input_width, input_height, "50", font, "Array Size")
min_value_box = InputBox(ui_margin + input_width + 20, 50, input_width, input_height, "-10", font, "Min Value")
max_value_box = InputBox(ui_margin + 2 * (input_width + 20), 50, input_width, input_height, "100", font, "Max Value")

# Add exit button in the top right
exit_button = Button(WIDTH - button_width - ui_margin, ui_margin, button_width, button_height, "EXIT", font)

# Global state for sorting
current_array = generate_array(preset_options[preset_dropdown.selected],
                               int(num_elements_box.text),
                               int(min_value_box.text),
                               int(max_value_box.text))
original_array = current_array.copy()
sorting_generator = None
sorting_in_progress = False
highlight_indices = None
finalized_indices = []  # Track which indices are in their final position
sorting_complete = False  # Flag to track when sorting is complete

# ----- Main Loop -----

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

        # Also check for ESC key to exit
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                pygame.quit()
                sys.exit()

        # UI event handling
        algorithm_dropdown.handle_event(event)
        preset_dropdown.handle_event(event)
        speed_slider.handle_event(event)
        num_elements_box.handle_event(event)
        min_value_box.handle_event(event)
        max_value_box.handle_event(event)

        if exit_button.is_clicked(event):
            pygame.quit()
            sys.exit()

        if sort_button.is_clicked(event) and not sorting_in_progress:
            # Regenerate the array using values from the input boxes
            try:
                n = int(num_elements_box.text)
                min_val = int(min_value_box.text)
                max_val = int(max_value_box.text)
            except:
                n, min_val, max_val = 50, -10, 100

            # Limit n to a reasonable maximum based on screen width
            max_elements = WIDTH - 2 * ui_margin
            if n > max_elements:
                n = max_elements
                num_elements_box.text = str(n)
                num_elements_box.txt_surface = font.render(num_elements_box.text, True, gruvbox["fg"])

            current_array = generate_array(preset_options[preset_dropdown.selected],
                                           n,
                                           min_val,
                                           max_val)
            original_array = current_array.copy()
            algo = algo_options[algorithm_dropdown.selected]
            if algo == "Quick Sort":
                sorting_generator = quick_sort_visual(current_array)
            elif algo == "Merge Sort":
                sorting_generator = merge_sort_visual(current_array)
            elif algo == "Heap Sort":
                sorting_generator = heap_sort_visual(current_array)
            elif algo == "Insertion Sort":
                sorting_generator = insertion_sort_visual(current_array)
            elif algo == "Tim Sort":
                sorting_generator = tim_sort_visual(current_array)
            sorting_in_progress = True
            finalized_indices = []
            sorting_complete = False

        if reset_button.is_clicked(event):
            sorting_in_progress = False
            sorting_generator = None
            sorting_complete = False
            try:
                n = int(num_elements_box.text)
                min_val = int(min_value_box.text)
                max_val = int(max_value_box.text)
            except:
                n, min_val, max_val = 50, -10, 100

            # Limit n to a reasonable maximum based on screen width
            max_elements = WIDTH - 2 * ui_margin
            if n > max_elements:
                n = max_elements
                num_elements_box.text = str(n)
                num_elements_box.txt_surface = font.render(num_elements_box.text, True, gruvbox["fg"])

            current_array = generate_array(preset_options[preset_dropdown.selected],
                                           n,
                                           min_val,
                                           max_val)
            original_array = current_array.copy()
            highlight_indices = None
            finalized_indices = []

    # Fill background
    screen.fill(gruvbox["bg"])

    # Sorting step using delay from slider
    if sorting_in_progress and sorting_generator is not None:
        try:
            current_array, highlight_indices, finalized_indices = next(sorting_generator)
            pygame.time.delay(speed_slider.value)

            # Check if sorting is complete (all indices finalized)
            if finalized_indices and len(finalized_indices) == len(current_array):
                sorting_complete = True

        except StopIteration:
            sorting_in_progress = False
            highlight_indices = None
            # When sorting is complete, mark all indices as finalized
            finalized_indices = list(range(len(current_array)))
            sorting_complete = True

    # ----- Draw array visualization -----
    # Define visualization area below UI elements.
    vis_top = 160
    vis_bottom = HEIGHT - ui_margin
    vis_height = vis_bottom - vis_top
    n = len(current_array)
    if n > 0:
        bar_width = (WIDTH - 2 * ui_margin) / n

        # Calculate range to handle negative values.
        arr_min = min(current_array)
        arr_max = max(current_array)
        full_range = arr_max - arr_min if arr_max - arr_min != 0 else 1

        # Determine baseline y coordinate (where value 0 is drawn)
        baseline = vis_bottom - ((0 - arr_min) / full_range) * vis_height

        # Draw X-axis line at baseline
        pygame.draw.line(screen, gruvbox["fg"], (ui_margin, baseline), (WIDTH - ui_margin, baseline), 2)

        for i, val in enumerate(current_array):
            # Determine bar height relative to baseline
            bar_height = abs(val) / full_range * vis_height
            x = ui_margin + i * bar_width
            if val >= 0:
                y = baseline - bar_height
            else:
                y = baseline

            # Color selection:
            # - Blue for finalized indices
            # - Red for indices being compared/swapped
            # - Green for other indices
            if i in finalized_indices:
                color = gruvbox["blue"]
            elif highlight_indices is not None and (i == highlight_indices[0] or
                                                    (highlight_indices[1] is not None and i == highlight_indices[1])):
                color = gruvbox["red"]
            else:
                color = gruvbox["green"]

            # If sorting is complete, make all bars blue
            if sorting_complete:
                color = gruvbox["blue"]

            pygame.draw.rect(screen, color, (x, y, max(1, bar_width - 1), bar_height))

    # ----- Draw UI elements on top (dropdowns, buttons, input boxes, slider) -----
    algorithm_dropdown.draw(screen)
    preset_dropdown.draw(screen)
    sort_button.draw(screen)
    reset_button.draw(screen)
    speed_slider.draw(screen)
    num_elements_box.draw(screen)
    min_value_box.draw(screen)
    max_value_box.draw(screen)
    exit_button.draw(screen)

    pygame.display.flip()
    clock.tick(60)