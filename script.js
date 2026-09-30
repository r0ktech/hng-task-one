const STORAGE_KEY = "todo-app-items";
const FILTERS = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
};

const todoInput = document.getElementById("todo-input");
const todoForm = document.getElementById("todo-form");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const taskCount = document.getElementById("task-count");
const clearCompletedButton = document.getElementById("clear-completed");
const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
const template = document.getElementById("todo-item-template");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function updateTaskCount() {
  const remaining = todos.filter((todo) => !todo.completed).length;
  const taskLabel = remaining === 1 ? "task left" : "tasks left";
  taskCount.textContent = `${remaining} ${taskLabel}`;
}

function getVisibleTodos() {
  return todos.filter(FILTERS[currentFilter] || FILTERS.all);
}

function renderTodos() {
  const visibleTodos = getVisibleTodos();
  todoList.innerHTML = "";

  visibleTodos.forEach((todo) => {
    const fragment = template.content.cloneNode(true);
    const item = fragment.querySelector(".todo-item");
    const checkbox = fragment.querySelector('input[type="checkbox"]');
    const text = fragment.querySelector(".todo-text");
    const deleteButton = fragment.querySelector(".delete-btn");

    item.dataset.id = String(todo.id);
    if (todo.completed) {
      item.classList.add("completed");
    }

    checkbox.checked = todo.completed;
    text.textContent = todo.text;

    checkbox.addEventListener("change", () => toggleTodo(todo.id));
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));

    todoList.appendChild(fragment);
  });

  const hasTodos = todos.length > 0;
  emptyState.classList.toggle("hidden", hasTodos || currentFilter !== "all");

  if (!hasTodos) {
    emptyState.innerHTML =
      "<p>No tasks yet.</p><span>Add your first task above to get started.</span>";
  } else if (visibleTodos.length === 0) {
    emptyState.innerHTML =
      "<p>No tasks match this filter.</p><span>Try another filter or add a new task.</span>";
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  updateTaskCount();
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    todoInput.focus();
    return;
  }

  todos.unshift({
    id: Date.now() + Math.random(),
    text: trimmed,
    completed: false,
  });

  saveTodos();
  renderTodos();
  todoInput.value = "";
  todoInput.focus();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );

  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("active", isActive);
  });
  renderTodos();
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo(todoInput.value);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

clearCompletedButton.addEventListener("click", clearCompleted);

renderTodos();
