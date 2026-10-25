/**
 * TaskFlow — Modern To-Do & Productivity Dashboard
 * Vanilla JavaScript implementation
 */

// ==========================================
// 1. Initial State & Data Store
// ==========================================
const STORAGE_KEY_TASKS = 'taskflow_tasks_v1';
const STORAGE_KEY_THEME = 'taskflow_theme_v1';

// Starter tasks if user visits for the first time
const INITIAL_DEMO_TASKS = [
  {
    id: 'demo-1',
    title: 'Complete project proposal report',
    description: 'Finalize project scope, milestones, and deliverable timeline for the client review.',
    category: 'Work',
    priority: 'High',
    dueDate: getFormattedDateOffset(0), // Today
    dueTime: '17:00',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-2',
    title: 'Review lecture notes on Operating Systems',
    description: 'Read Chapter 4 on Process Synchronization and prepare questions for seminar.',
    category: 'College',
    priority: 'Medium',
    dueDate: getFormattedDateOffset(1), // Tomorrow
    dueTime: '14:30',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'demo-3',
    title: 'Weekly grocery restock',
    description: 'Almond milk, whole grain bread, Greek yogurt, fresh berries, and olive oil.',
    category: 'Shopping',
    priority: 'Low',
    dueDate: getFormattedDateOffset(2),
    dueTime: '11:00',
    status: 'completed',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'demo-4',
    title: 'Refactor UI design tokens and typography',
    description: 'Update CSS variables for dark and light theme consistency across components.',
    category: 'Projects',
    priority: 'Urgent',
    dueDate: getFormattedDateOffset(-1), // Overdue for demonstration
    dueTime: '18:00',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

let tasks = [];
let currentFilter = 'all'; // all, today, upcoming, pending, completed
let currentCategory = 'all'; // all, Personal, College, Work, Projects, Shopping, Other
let currentSort = 'dueDateAsc';
let currentSearchQuery = '';
let taskToDeleteId = null;

// ==========================================
// 2. DOM Elements Cache
// ==========================================
const DOM = {
  // Theme toggles
  themeToggleSidebar: document.getElementById('themeToggleSidebar'),
  themeToggleMobile: document.getElementById('themeToggleMobile'),

  // Mobile navigation
  mobileMenuToggle: document.getElementById('mobileMenuToggle'),
  sidebar: document.getElementById('sidebar'),
  sidebarBackdrop: document.getElementById('sidebarBackdrop'),

  // Greetings and Date
  welcomeGreeting: document.getElementById('welcomeGreeting'),
  currentDateDisplay: document.getElementById('currentDateDisplay'),

  // Statistics
  statTotal: document.getElementById('statTotal'),
  statPending: document.getElementById('statPending'),
  statCompleted: document.getElementById('statCompleted'),
  statOverdue: document.getElementById('statOverdue'),
  statPercentage: document.getElementById('statPercentage'),
  progressBarFill: document.getElementById('progressBarFill'),
  progressRingCircle: document.getElementById('progressRingCircle'),
  productivityHeadline: document.getElementById('productivityHeadline'),
  productivitySummary: document.getElementById('productivitySummary'),
  overdueHelperText: document.getElementById('overdueHelperText'),

  // Sidebar Counts
  countAll: document.getElementById('countAll'),
  countToday: document.getElementById('countToday'),
  countUpcoming: document.getElementById('countUpcoming'),
  countPending: document.getElementById('countPending'),
  countCompleted: document.getElementById('countCompleted'),

  // Controls
  filterTabs: document.querySelectorAll('.filter-tab'),
  sidebarNavItems: document.querySelectorAll('.sidebar-nav .nav-item'),
  categoryNavBtns: document.querySelectorAll('.category-nav-btn'),
  categorySelectFilter: document.getElementById('categorySelectFilter'),
  sortSelect: document.getElementById('sortSelect'),
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  clearCompletedBtn: document.getElementById('clearCompletedBtn'),

  // Active view header
  currentViewTitle: document.getElementById('currentViewTitle'),
  tasksMatchedCount: document.getElementById('tasksMatchedCount'),

  // Quick Add
  quickTaskInput: document.getElementById('quickTaskInput'),
  quickAddBtn: document.getElementById('quickAddBtn'),

  // Task List & Empty State
  taskList: document.getElementById('taskList'),
  emptyState: document.getElementById('emptyState'),
  emptyTitle: document.getElementById('emptyTitle'),
  emptyDescription: document.getElementById('emptyDescription'),

  // Modal Create / Edit
  taskModal: document.getElementById('taskModal'),
  taskForm: document.getElementById('taskForm'),
  modalHeading: document.getElementById('modalHeading'),
  modalIconAdd: document.getElementById('modalIconAdd'),
  modalIconEdit: document.getElementById('modalIconEdit'),
  taskIdInput: document.getElementById('taskId'),
  taskTitleInput: document.getElementById('taskTitle'),
  taskDescriptionInput: document.getElementById('taskDescription'),
  taskCategorySelect: document.getElementById('taskCategory'),
  taskDueDateInput: document.getElementById('taskDueDate'),
  taskDueTimeInput: document.getElementById('taskDueTime'),
  saveBtnText: document.getElementById('saveBtnText'),
  titleError: document.getElementById('titleError'),
  dueDateError: document.getElementById('dueDateError'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  newTaskTriggers: document.querySelectorAll('.new-task-trigger'),

  // Delete Confirmation Modal
  deleteModal: document.getElementById('deleteModal'),
  deleteConfirmMessage: document.getElementById('deleteConfirmMessage'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

  // Clear Completed Confirmation Modal
  clearCompletedModal: document.getElementById('clearCompletedModal'),
  cancelClearCompletedBtn: document.getElementById('cancelClearCompletedBtn'),
  confirmClearCompletedBtn: document.getElementById('confirmClearCompletedBtn'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer'),

  // Pomodoro
  pomodoroTimer: document.getElementById('pomodoroTimer'),
  pomodoroModeLabel: document.getElementById('pomodoroModeLabel'),
  pomoStartPauseBtn: document.getElementById('pomoStartPauseBtn'),
  pomoResetBtn: document.getElementById('pomoResetBtn'),
  pomoModeBtns: document.querySelectorAll('.pomo-mode-btn')
};

// ==========================================
// 3. Application Initialization
// ==========================================
function initApp() {
  initTheme();
  updateGreetingAndDate();
  loadTasks();
  setupEventListeners();
  initPomodoro();
  renderApp();
}

// Helper to format date offset from today (YYYY-MM-DD)
function getFormattedDateOffset(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==========================================
// 4. LocalStorage Management
// ==========================================
function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TASKS);
    if (stored) {
      tasks = JSON.parse(stored);
    } else {
      // First visit: initialize with demo data
      tasks = [...INITIAL_DEMO_TASKS];
      saveTasksToStorage();
    }
  } catch (error) {
    console.error('LocalStorage error loading tasks:', error);
    showToast('Failed to load tasks from local storage', 'danger');
    tasks = [...INITIAL_DEMO_TASKS];
  }
}

function saveTasksToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('LocalStorage error saving tasks:', error);
    showToast('LocalStorage is full or disabled', 'danger');
  }
}

// ==========================================
// 5. Theme Management
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  try {
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
  } catch (e) {
    console.warn('Could not persist theme preference', e);
  }
  showToast(`Switched to ${newTheme} theme`, 'info');
}

// ==========================================
// 6. Greetings & Date Logic
// ==========================================
function updateGreetingAndDate() {
  const now = new Date();
  const hours = now.getHours();
  let greeting = 'Welcome back!';

  if (hours >= 5 && hours < 12) {
    greeting = 'Good morning!';
  } else if (hours >= 12 && hours < 17) {
    greeting = 'Good afternoon!';
  } else if (hours >= 17 && hours < 22) {
    greeting = 'Good evening!';
  } else {
    greeting = 'Working late? Keep it up!';
  }

  DOM.welcomeGreeting.textContent = greeting;

  // Format date: "Sunday, Oct 25, 2026"
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  DOM.currentDateDisplay.textContent = now.toLocaleDateString(undefined, options);
}

// ==========================================
// 7. Date & Overdue Calculation Helpers
// ==========================================
function isToday(dateString) {
  if (!dateString) return false;
  const todayStr = getFormattedDateOffset(0);
  return dateString === todayStr;
}

function isOverdue(task) {
  if (task.status === 'completed' || !task.dueDate) return false;

  const now = new Date();
  const [year, month, day] = task.dueDate.split('-').map(Number);
  let taskDateTime;

  if (task.dueTime) {
    const [hours, mins] = task.dueTime.split(':').map(Number);
    taskDateTime = new Date(year, month - 1, day, hours, mins, 0);
  } else {
    // End of that day (23:59:59)
    taskDateTime = new Date(year, month - 1, day, 23, 59, 59);
  }

  return taskDateTime < now;
}

function isUpcoming(task) {
  if (task.status === 'completed' || !task.dueDate) return false;
  const todayStr = getFormattedDateOffset(0);
  return task.dueDate > todayStr;
}

function formatDisplayDate(dateString, timeString) {
  if (!dateString) return 'No due date';

  const [y, m, d] = dateString.split('-').map(Number);
  const taskDate = new Date(y, m - 1, d);
  const todayStr = getFormattedDateOffset(0);
  const tomorrowStr = getFormattedDateOffset(1);

  let dateLabel = '';
  if (dateString === todayStr) {
    dateLabel = 'Today';
  } else if (dateString === tomorrowStr) {
    dateLabel = 'Tomorrow';
  } else {
    dateLabel = taskDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  if (timeString) {
    // Format 24h to 12h nicely
    const [hh, mm] = timeString.split(':');
    const hour = parseInt(hh, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${dateLabel} at ${formattedHour}:${mm} ${ampm}`;
  }

  return dateLabel;
}

// ==========================================
// 8. Stats & Dashboard Updates
// ==========================================
function updateDashboardStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const overdue = tasks.filter(t => isOverdue(t)).length;
  const todayTasks = tasks.filter(t => isToday(t.dueDate)).length;
  const upcomingTasks = tasks.filter(t => isUpcoming(t)).length;

  // Counts update
  DOM.statTotal.textContent = total;
  DOM.statCompleted.textContent = completed;
  DOM.statPending.textContent = pending;
  DOM.statOverdue.textContent = overdue;

  // Overdue helper warning
  if (overdue > 0) {
    DOM.overdueHelperText.textContent = `${overdue} require immediate attention!`;
    DOM.overdueHelperText.style.color = 'var(--color-rose)';
  } else {
    DOM.overdueHelperText.textContent = 'All deadlines on track';
    DOM.overdueHelperText.style.color = 'var(--text-dim)';
  }

  // Sidebar count badges
  DOM.countAll.textContent = total;
  DOM.countToday.textContent = todayTasks;
  DOM.countUpcoming.textContent = upcomingTasks;
  DOM.countPending.textContent = pending;
  DOM.countCompleted.textContent = completed;

  // Percentage & Progress Circle
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  DOM.statPercentage.textContent = `${percentage}%`;
  DOM.progressBarFill.style.width = `${percentage}%`;

  // Circular ring offset: circumference = 2 * PI * 34 ≈ 213.62
  const circumference = 213.62;
  const offset = circumference - (percentage / 100) * circumference;
  DOM.progressRingCircle.style.strokeDashoffset = offset;

  // Dynamic productivity summary headline & message
  if (total === 0) {
    DOM.productivityHeadline.textContent = 'Start your day with purpose!';
    DOM.productivitySummary.textContent = 'Add your first task using the button above to begin tracking.';
  } else if (percentage === 100) {
    DOM.productivityHeadline.textContent = 'Spectacular! All tasks done! 🎉';
    DOM.productivitySummary.textContent = `You completed all ${total} tasks. Take a well-deserved break!`;
  } else if (percentage >= 70) {
    DOM.productivityHeadline.textContent = 'Almost at the finish line! 🚀';
    DOM.productivitySummary.textContent = `Great pace! ${completed} of ${total} tasks completed (${percentage}%).`;
  } else if (overdue > 0) {
    DOM.productivityHeadline.textContent = 'Attention needed on overdue items';
    DOM.productivitySummary.textContent = `You have ${overdue} overdue task${overdue > 1 ? 's' : ''}. Prioritize them first!`;
  } else if (todayTasks > 0) {
    DOM.productivityHeadline.textContent = 'Make today count!';
    DOM.productivitySummary.textContent = `You have ${todayTasks} task${todayTasks > 1 ? 's' : ''} scheduled for today.`;
  } else {
    DOM.productivityHeadline.textContent = 'Stay steady and productive!';
    DOM.productivitySummary.textContent = `${pending} pending task${pending > 1 ? 's' : ''} waiting in your queue.`;
  }
}

// ==========================================
// 9. Task Filtering, Sorting & Rendering
// ==========================================
function getFilteredAndSortedTasks() {
  let result = [...tasks];

  // 1. Text Search Filter (Title & Description)
  if (currentSearchQuery.trim()) {
    const q = currentSearchQuery.toLowerCase().trim();
    result = result.filter(task => 
      task.title.toLowerCase().includes(q) ||
      (task.description && task.description.toLowerCase().includes(q))
    );
  }

  // 2. View/Status Filter
  if (currentFilter === 'today') {
    result = result.filter(task => isToday(task.dueDate));
  } else if (currentFilter === 'upcoming') {
    result = result.filter(task => isUpcoming(task));
  } else if (currentFilter === 'pending') {
    result = result.filter(task => task.status === 'pending');
  } else if (currentFilter === 'completed') {
    result = result.filter(task => task.status === 'completed');
  } else if (currentFilter === 'overdue') {
    result = result.filter(task => isOverdue(task));
  }

  // 3. Category Filter
  if (currentCategory !== 'all') {
    result = result.filter(task => task.category === currentCategory);
  }

  // 4. Sorting
  result.sort((a, b) => {
    switch (currentSort) {
      case 'dueDateAsc':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const dtA = `${a.dueDate} ${a.dueTime || '23:59'}`;
        const dtB = `${b.dueDate} ${b.dueTime || '23:59'}`;
        return dtA.localeCompare(dtB);

      case 'dueDateDesc':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const dtA2 = `${a.dueDate} ${a.dueTime || '23:59'}`;
        const dtB2 = `${b.dueDate} ${b.dueTime || '23:59'}`;
        return dtB2.localeCompare(dtA2);

      case 'priorityDesc': {
        const priorityWeight = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }

      case 'priorityAsc': {
        const priorityWeight = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
      }

      case 'createdDesc':
        return new Date(b.createdAt) - new Date(a.createdAt);

      case 'titleAsc':
        return a.title.localeCompare(b.title);

      default:
        return 0;
    }
  });

  return result;
}

function renderTasks() {
  const filteredTasks = getFilteredAndSortedTasks();
  DOM.taskList.innerHTML = '';

  // Update section heading
  const filterNames = {
    all: 'All Tasks',
    today: "Today's Tasks",
    upcoming: 'Upcoming Tasks',
    pending: 'Pending Tasks',
    completed: 'Completed Tasks',
    overdue: 'Overdue Tasks'
  };

  let title = filterNames[currentFilter] || 'Tasks';
  if (currentCategory !== 'all') {
    title += ` &bull; ${currentCategory}`;
  }
  if (currentSearchQuery) {
    title += ` (Search: "${currentSearchQuery}")`;
  }
  DOM.currentViewTitle.innerHTML = title;
  DOM.tasksMatchedCount.textContent = `${filteredTasks.length} task${filteredTasks.length === 1 ? '' : 's'}`;

  // Empty state handling
  if (filteredTasks.length === 0) {
    DOM.emptyState.style.display = 'flex';
    DOM.taskList.style.display = 'none';

    if (currentSearchQuery) {
      DOM.emptyTitle.textContent = 'No matching tasks';
      DOM.emptyDescription.textContent = `No tasks matched your search query "${currentSearchQuery}".`;
    } else if (currentFilter === 'completed') {
      DOM.emptyTitle.textContent = 'No completed tasks yet';
      DOM.emptyDescription.textContent = 'Check off tasks from your list as you complete them!';
    } else if (currentFilter === 'today') {
      DOM.emptyTitle.textContent = 'No tasks due today';
      DOM.emptyDescription.textContent = 'Enjoy your free day or plan ahead by adding new tasks.';
    } else if (currentFilter === 'overdue') {
      DOM.emptyTitle.textContent = 'Zero overdue tasks!';
      DOM.emptyDescription.textContent = "You're completely on top of all your scheduled deadlines.";
    } else {
      DOM.emptyTitle.textContent = 'No tasks found';
      DOM.emptyDescription.textContent = 'Your task list for this view is empty. Create a task to get started!';
    }
    return;
  }

  DOM.emptyState.style.display = 'none';
  DOM.taskList.style.display = 'flex';

  // Render each task card
  filteredTasks.forEach(task => {
    const card = createTaskCardElement(task);
    DOM.taskList.appendChild(card);
  });
}

function createTaskCardElement(task) {
  const card = document.createElement('div');
  const taskOverdue = isOverdue(task);
  const taskDueToday = isToday(task.dueDate);

  card.className = `task-card ${task.status === 'completed' ? 'completed' : ''}`;
  card.setAttribute('data-id', task.id);

  // Due date badge status
  let dueClass = 'meta-due';
  let dueIcon = '';
  if (taskOverdue) {
    dueClass += ' overdue';
    dueIcon = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    `;
  } else if (taskDueToday) {
    dueClass += ' today';
    dueIcon = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    `;
  } else {
    dueIcon = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    `;
  }

  const createdFormatted = new Date(task.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  card.innerHTML = `
    <div class="task-checkbox-wrap">
      <button class="task-custom-checkbox toggle-task-btn" title="${task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}" aria-label="Toggle task status">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </button>
    </div>

    <div class="task-content">
      <div class="task-top-meta">
        <span class="category-badge cat-badge-${escapeHtml(task.category)}">${escapeHtml(task.category)}</span>
        <span class="priority-badge priority-badge-${escapeHtml(task.priority)}">${escapeHtml(task.priority)}</span>
      </div>

      <h3 class="task-title">${escapeHtml(task.title)}</h3>
      ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}

      <div class="task-bottom-meta">
        <div class="meta-item ${dueClass}">
          ${dueIcon}
          <span>${taskOverdue ? 'Overdue: ' : ''}${formatDisplayDate(task.dueDate, task.dueTime)}</span>
        </div>
        <div class="meta-item meta-created" title="Creation Date">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/>
          </svg>
          <span>Added ${createdFormatted}</span>
        </div>
      </div>
    </div>

    <div class="task-actions">
      <button class="task-action-btn edit-btn" title="Edit task" aria-label="Edit task">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        </svg>
      </button>
      <button class="task-action-btn delete-btn" title="Delete task" aria-label="Delete task">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
      </button>
    </div>
  `;

  // Attach card specific event listeners
  const toggleBtn = card.querySelector('.toggle-task-btn');
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTaskStatus(task.id);
  });

  const editBtn = card.querySelector('.edit-btn');
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditTaskModal(task.id);
  });

  const deleteBtn = card.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openDeleteConfirmation(task.id);
  });

  return card;
}

function renderApp() {
  updateDashboardStats();
  renderTasks();
}

// Security helper against XSS
function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// 10. Task CRUD Operations
// ==========================================
function toggleTaskStatus(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const willBeCompleted = task.status === 'pending';
  task.status = willBeCompleted ? 'completed' : 'pending';
  saveTasksToStorage();
  renderApp();

  if (willBeCompleted) {
    showToast(`Task completed! Keep up the momentum.`, 'success');
  } else {
    showToast(`Task reopened and marked pending.`, 'info');
  }
}

function openCreateTaskModal() {
  DOM.taskForm.reset();
  DOM.taskIdInput.value = '';
  DOM.titleError.textContent = '';
  DOM.dueDateError.textContent = '';
  DOM.modalHeading.textContent = 'Create New Task';
  DOM.modalIconAdd.style.display = 'block';
  DOM.modalIconEdit.style.display = 'none';
  DOM.saveBtnText.textContent = 'Save Task';

  // Set default due date to today
  DOM.taskDueDateInput.value = getFormattedDateOffset(0);

  // Set default priority radio to Medium
  const defaultRadio = document.querySelector('input[name="priority"][value="Medium"]');
  if (defaultRadio) defaultRadio.checked = true;

  // Set default category to current active category if not 'all'
  if (currentCategory !== 'all') {
    DOM.taskCategorySelect.value = currentCategory;
  } else {
    DOM.taskCategorySelect.value = 'Personal';
  }

  openModal(DOM.taskModal);
  setTimeout(() => DOM.taskTitleInput.focus(), 150);
}

function openEditTaskModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  DOM.titleError.textContent = '';
  DOM.dueDateError.textContent = '';
  DOM.modalHeading.textContent = 'Edit Task';
  DOM.modalIconAdd.style.display = 'none';
  DOM.modalIconEdit.style.display = 'block';
  DOM.saveBtnText.textContent = 'Update Task';

  DOM.taskIdInput.value = task.id;
  DOM.taskTitleInput.value = task.title;
  DOM.taskDescriptionInput.value = task.description || '';
  DOM.taskCategorySelect.value = task.category;
  DOM.taskDueDateInput.value = task.dueDate;
  DOM.taskDueTimeInput.value = task.dueTime || '';

  const prioRadio = document.querySelector(`input[name="priority"][value="${task.priority}"]`);
  if (prioRadio) prioRadio.checked = true;

  openModal(DOM.taskModal);
  setTimeout(() => DOM.taskTitleInput.focus(), 150);
}

function handleTaskFormSubmit(e) {
  e.preventDefault();

  const id = DOM.taskIdInput.value.trim();
  const title = DOM.taskTitleInput.value.trim();
  const description = DOM.taskDescriptionInput.value.trim();
  const category = DOM.taskCategorySelect.value;
  const dueDate = DOM.taskDueDateInput.value;
  const dueTime = DOM.taskDueTimeInput.value;

  const priorityEl = document.querySelector('input[name="priority"]:checked');
  const priority = priorityEl ? priorityEl.value : 'Medium';

  // Validation
  let isValid = true;
  DOM.titleError.textContent = '';
  DOM.dueDateError.textContent = '';

  if (!title) {
    DOM.titleError.textContent = 'Please enter a task title.';
    DOM.taskTitleInput.focus();
    isValid = false;
  } else if (title.length < 2) {
    DOM.titleError.textContent = 'Title must be at least 2 characters long.';
    DOM.taskTitleInput.focus();
    isValid = false;
  }

  if (!dueDate) {
    DOM.dueDateError.textContent = 'Please select a due date.';
    isValid = false;
  }

  if (!isValid) return;

  if (id) {
    // Update existing task
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        title,
        description,
        category,
        priority,
        dueDate,
        dueTime
      };
      saveTasksToStorage();
      renderApp();
      closeModal(DOM.taskModal);
      showToast('Task updated successfully!', 'success');
    }
  } else {
    // Add new task
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title,
      description,
      category,
      priority,
      dueDate,
      dueTime,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasksToStorage();
    renderApp();
    closeModal(DOM.taskModal);
    showToast('New task added!', 'success');
  }
}

// Quick Add from active filter bar
function handleQuickAdd() {
  const title = DOM.quickTaskInput.value.trim();
  if (!title) {
    showToast('Please type a task title first', 'warning');
    DOM.quickTaskInput.focus();
    return;
  }

  const newTask = {
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title,
    description: '',
    category: currentCategory !== 'all' ? currentCategory : 'Personal',
    priority: 'Medium',
    dueDate: getFormattedDateOffset(0),
    dueTime: '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  saveTasksToStorage();
  DOM.quickTaskInput.value = '';
  renderApp();
  showToast(`Quick task added for Today!`, 'success');
}

// Delete confirmation handling
function openDeleteConfirmation(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  taskToDeleteId = taskId;
  DOM.deleteConfirmMessage.innerHTML = `Are you sure you want to delete <strong>"${escapeHtml(task.title)}"</strong>? This cannot be undone.`;
  openModal(DOM.deleteModal);
}

function handleConfirmDelete() {
  if (!taskToDeleteId) return;

  tasks = tasks.filter(t => t.id !== taskToDeleteId);
  saveTasksToStorage();
  taskToDeleteId = null;
  closeModal(DOM.deleteModal);
  renderApp();
  showToast('Task deleted.', 'info');
}

// Clear all completed confirmation
function handleConfirmClearCompleted() {
  const beforeCount = tasks.length;
  tasks = tasks.filter(t => t.status !== 'completed');
  const removed = beforeCount - tasks.length;

  saveTasksToStorage();
  closeModal(DOM.clearCompletedModal);
  renderApp();

  if (removed > 0) {
    showToast(`Removed ${removed} completed task${removed > 1 ? 's' : ''}.`, 'info');
  } else {
    showToast('No completed tasks to remove.', 'warning');
  }
}

// ==========================================
// 11. Modal Utilities
// ==========================================
function openModal(modalEl) {
  modalEl.classList.add('active');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalEl) {
  modalEl.classList.remove('active');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ==========================================
// 12. Toast Notification System
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  } else if (type === 'danger') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${escapeHtml(message)}</div>
  `;

  DOM.toastContainer.appendChild(toast);

  // Auto dismiss after 3.2 seconds
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 280);
  }, 3200);
}

// ==========================================
// 13. Pomodoro Focus Timer
// ==========================================
let pomoState = {
  mode: 'pomodoro', // pomodoro, short, long
  durations: {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  },
  timeLeft: 25 * 60,
  timerId: null,
  isRunning: false
};

function initPomodoro() {
  updatePomodoroDisplay();

  DOM.pomoModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      switchPomodoroMode(mode);
    });
  });

  DOM.pomoStartPauseBtn.addEventListener('click', togglePomodoro);
  DOM.pomoResetBtn.addEventListener('click', resetPomodoro);
}

function switchPomodoroMode(mode) {
  if (pomoState.isRunning) {
    clearInterval(pomoState.timerId);
    pomoState.isRunning = false;
    DOM.pomoStartPauseBtn.textContent = 'Start';
  }

  pomoState.mode = mode;
  pomoState.timeLeft = pomoState.durations[mode];

  DOM.pomoModeBtns.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-mode') === mode);
  });

  const labels = {
    pomodoro: 'Focus',
    short: 'Short Break',
    long: 'Long Break'
  };
  DOM.pomodoroModeLabel.textContent = labels[mode];

  updatePomodoroDisplay();
}

function togglePomodoro() {
  if (pomoState.isRunning) {
    // Pause
    clearInterval(pomoState.timerId);
    pomoState.isRunning = false;
    DOM.pomoStartPauseBtn.textContent = 'Start';
    showToast('Focus timer paused.', 'info');
  } else {
    // Start
    pomoState.isRunning = true;
    DOM.pomoStartPauseBtn.textContent = 'Pause';
    showToast(`Focus timer started (${Math.floor(pomoState.timeLeft / 60)}m)!`, 'info');

    pomoState.timerId = setInterval(() => {
      if (pomoState.timeLeft > 0) {
        pomoState.timeLeft--;
        updatePomodoroDisplay();
      } else {
        clearInterval(pomoState.timerId);
        pomoState.isRunning = false;
        DOM.pomoStartPauseBtn.textContent = 'Start';
        playTimerEndTone();
        showToast('Pomodoro session completed! Great focus! 🎉', 'success');
        resetPomodoro();
      }
    }, 1000);
  }
}

function resetPomodoro() {
  clearInterval(pomoState.timerId);
  pomoState.isRunning = false;
  pomoState.timeLeft = pomoState.durations[pomoState.mode];
  DOM.pomoStartPauseBtn.textContent = 'Start';
  updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
  const mins = Math.floor(pomoState.timeLeft / 60);
  const secs = pomoState.timeLeft % 60;
  DOM.pomodoroTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Gentle Web Audio tone on timer complete
function playTimerEndTone() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.log('AudioContext not allowed or not supported yet');
  }
}

// ==========================================
// 14. Event Listeners Setup
// ==========================================
function setupEventListeners() {
  // Theme toggles
  if (DOM.themeToggleSidebar) DOM.themeToggleSidebar.addEventListener('click', toggleTheme);
  if (DOM.themeToggleMobile) DOM.themeToggleMobile.addEventListener('click', toggleTheme);

  // Mobile drawer sidebar
  if (DOM.mobileMenuToggle) {
    DOM.mobileMenuToggle.addEventListener('click', () => {
      DOM.sidebar.classList.toggle('open');
      DOM.sidebarBackdrop.classList.toggle('active');
    });
  }

  if (DOM.sidebarBackdrop) {
    DOM.sidebarBackdrop.addEventListener('click', () => {
      DOM.sidebar.classList.remove('open');
      DOM.sidebarBackdrop.classList.remove('active');
    });
  }

  // Filter tabs (top)
  DOM.filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');
      setFilter(filter);
    });
  });

  // Sidebar navigation items
  DOM.sidebarNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const filter = item.getAttribute('data-filter');
      setFilter(filter);
      // Close mobile drawer on navigation
      DOM.sidebar.classList.remove('open');
      DOM.sidebarBackdrop.classList.remove('active');
    });
  });

  // Category navigation buttons (sidebar)
  DOM.categoryNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      setCategory(cat);
      DOM.sidebar.classList.remove('open');
      DOM.sidebarBackdrop.classList.remove('active');
    });
  });

  // Category select filter (top right)
  DOM.categorySelectFilter.addEventListener('change', (e) => {
    setCategory(e.target.value);
  });

  // Sort select
  DOM.sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTasks();
  });

  // Stat Cards click to filter
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-stat-target');
      if (target) {
        setFilter(target);
      }
    });
  });

  // Search input
  DOM.searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    DOM.clearSearchBtn.style.display = currentSearchQuery ? 'block' : 'none';
    renderTasks();
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    currentSearchQuery = '';
    DOM.clearSearchBtn.style.display = 'none';
    renderTasks();
    DOM.searchInput.focus();
  });

  // Quick Add
  DOM.quickAddBtn.addEventListener('click', handleQuickAdd);
  DOM.quickTaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickAdd();
    }
  });

  // Modal Open Triggers
  DOM.newTaskTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      openCreateTaskModal();
      DOM.sidebar.classList.remove('open');
      DOM.sidebarBackdrop.classList.remove('active');
    });
  });

  // Modal Close Triggers
  DOM.closeModalBtn.addEventListener('click', () => closeModal(DOM.taskModal));
  DOM.cancelModalBtn.addEventListener('click', () => closeModal(DOM.taskModal));

  // Modal background click to close
  DOM.taskModal.addEventListener('click', (e) => {
    if (e.target === DOM.taskModal) closeModal(DOM.taskModal);
  });

  // Task Form Submit
  DOM.taskForm.addEventListener('submit', handleTaskFormSubmit);

  // Clear Completed Trigger
  DOM.clearCompletedBtn.addEventListener('click', () => {
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear.', 'info');
      return;
    }
    openModal(DOM.clearCompletedModal);
  });

  DOM.cancelClearCompletedBtn.addEventListener('click', () => closeModal(DOM.clearCompletedModal));
  DOM.confirmClearCompletedBtn.addEventListener('click', handleConfirmClearCompleted);
  DOM.clearCompletedModal.addEventListener('click', (e) => {
    if (e.target === DOM.clearCompletedModal) closeModal(DOM.clearCompletedModal);
  });

  // Delete Confirmation Modal Triggers
  DOM.cancelDeleteBtn.addEventListener('click', () => {
    taskToDeleteId = null;
    closeModal(DOM.deleteModal);
  });
  DOM.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
  DOM.deleteModal.addEventListener('click', (e) => {
    if (e.target === DOM.deleteModal) {
      taskToDeleteId = null;
      closeModal(DOM.deleteModal);
    }
  });

  // Keyboard Shortcuts: Enter form submit, Escape to close modals, / to search
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (DOM.taskModal.classList.contains('active')) closeModal(DOM.taskModal);
      if (DOM.deleteModal.classList.contains('active')) closeModal(DOM.deleteModal);
      if (DOM.clearCompletedModal.classList.contains('active')) closeModal(DOM.clearCompletedModal);
      if (DOM.sidebar.classList.contains('open')) {
        DOM.sidebar.classList.remove('open');
        DOM.sidebarBackdrop.classList.remove('active');
      }
    }

    // '/' to focus search when not in input
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      DOM.searchInput.focus();
    }
  });
}

function setFilter(filter) {
  currentFilter = filter;

  // Sync filter tabs
  DOM.filterTabs.forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-filter') === filter);
  });

  // Sync sidebar items
  DOM.sidebarNavItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-filter') === filter);
  });

  renderTasks();
}

function setCategory(category) {
  currentCategory = category;

  // Sync sidebar category buttons
  DOM.categoryNavBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === category);
  });

  // Sync select filter dropdown
  if (DOM.categorySelectFilter.value !== category) {
    DOM.categorySelectFilter.value = category;
  }

  renderTasks();
}

// ==========================================
// 15. Bootstrap App on DOMContentLoaded
// ==========================================
document.addEventListener('DOMContentLoaded', initApp);
