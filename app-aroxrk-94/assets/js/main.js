const form = document.getElementById('todoForm');
const input = document.getElementById('todoInput');
const list = document.getElementById('todoList');
const activeCountEl = document.getElementById('activeCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterButtons = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('emptyState');
const footerYear = document.getElementById('year');
const themeToggle = document.querySelector('.theme-toggle');

const STORAGE_KEY = 'focusflow_todos';
const THEME_KEY = 'focusflow_theme';

let todos = [];
let filter = 'all';

const init = () => {
  footerYear.textContent = new Date().getFullYear();
  loadTheme();
  loadTodos();
  form.addEventListener('submit', handleAddTodo);
  clearCompletedBtn.addEventListener('click', clearCompleted);
  filterButtons.forEach(btn =>
    btn.addEventListener('click', () => setFilter(btn.dataset.filter))
  );
  themeToggle.addEventListener('click', toggleTheme);
};

const loadTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') document.documentElement.classList.add('dark');
};

const toggleTheme = () => {
  document.documentElement.classList.toggle('dark');
  const mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, mode);
};

const loadTodos = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  todos = stored ? JSON.parse(stored) : [];
  renderTodos();
};

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

const handleAddTodo = event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const todo = {
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.unshift(todo);
  input.value = '';
  persist();
  renderTodos();
};

const toggleTodo = id => {
  todos = todos.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  persist();
  renderTodos();
};

const deleteTodo = id => {
  todos = todos.filter(todo => todo.id !== id);
  persist();
  renderTodos();
};

const editTodo = id => {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  const updated = prompt('Edit task', todo.text);
  if (updated === null) return;
  const trimmed = updated.trim();
  if (!trimmed) {
    deleteTodo(id);
    return;
  }
  todos = todos.map(t => (t.id === id ? { ...t, text: trimmed } : t));
  persist();
  renderTodos();
};

const clearCompleted = () => {
  todos = todos.filter(todo => !todo.completed);
  persist();
  renderTodos();
};

const setFilter = value => {
  filter = value;
  filterButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === value));
  renderTodos();
};

const getFilteredTodos = () => {
  if (filter === 'active') return todos.filter(todo => !todo.completed);
  if (filter === 'completed') return todos.filter(todo => todo.completed);
  return todos;
};

const renderTodos = () => {
  const filtered = getFilteredTodos();
  list.innerHTML = '';
  filtered.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item${todo.completed ? ' completed' : ''}`;
    li.innerHTML = `
      <div class="checkbox-wrapper">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} aria-label="Toggle ${todo.text}">
      </div>
      <p class="todo-text">${escapeHtml(todo.text)}</p>
      <div class="todo-actions">
        <button class="icon-btn" type="button" aria-label="Edit ${todo.text}">✏️</button>
        <button class="icon-btn" type="button" aria-label="Delete ${todo.text}">🗑️</button>
      </div>
    `;
    const checkbox = li.querySelector('input');
    checkbox.addEventListener('change', () => toggleTodo(todo.id));
    li.querySelector('[aria-label^="Edit"]').addEventListener('click', () => editTodo(todo.id));
    li.querySelector('[aria-label^="Delete"]').addEventListener('click', () => deleteTodo(todo.id));
    list.appendChild(li);
  });

  activeCountEl.textContent = todos.filter(todo => !todo.completed).length;
  emptyState.style.display = todos.length ? 'none' : 'block';
};

const escapeHtml = unsafe =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

document.addEventListener('DOMContentLoaded', init);