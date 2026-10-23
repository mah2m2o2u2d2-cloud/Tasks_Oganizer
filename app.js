// Helper: Local Date string YYYY-MM-DD
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Storage Management
function getInitialUsers() {
  return {};
}

function loadUsers() {
  try {
    const stored = localStorage.getItem('habit_tracker_users_v2');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.warn('localStorage not accessible, using in-memory state');
  }
  return getInitialUsers();
}

function saveUsers(users) {
  try {
    localStorage.setItem('habit_tracker_users_v2', JSON.stringify(users));
  } catch (e) {
    console.warn('Unable to save to localStorage');
  }
}

function loadActiveSession() {
  try {
    return localStorage.getItem('habit_tracker_session_v2');
  } catch (e) {
    return null;
  }
}

function saveActiveSession(username) {
  try {
    if (username) {
      localStorage.setItem('habit_tracker_session_v2', username);
    } else {
      localStorage.removeItem('habit_tracker_session_v2');
    }
  } catch (e) {}
}

// App State
let users = loadUsers();
let currentUsername = loadActiveSession();
let authMode = 'login';
let currentTab = 'habits';
let selectedCategoryFilter = 'all';
let selectedMood = '😄';
let selectedAvatarEmoji = '🦊';

// Focus Timer State
let timerSeconds = 25 * 60;
let timerRunning = false;
let timerInterval = null;
let timerMode = 'focus'; // 'focus' or 'break'

// DOM Elements - Auth
const authView = document.getElementById('auth-view');
const trackerView = document.getElementById('tracker-view');
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authAlert = document.getElementById('auth-alert');

// DOM Elements - Header & Tabs
const userAvatar = document.getElementById('user-avatar');
const currentUserDisplay = document.getElementById('current-user-display');
const streakCount = document.getElementById('streak-count');
const logoutBtn = document.getElementById('logout-btn');

const navHabits = document.getElementById('nav-habits');
const navAnalytics = document.getElementById('nav-analytics');
const navFocus = document.getElementById('nav-focus');
const navJournal = document.getElementById('nav-journal');
const navBadges = document.getElementById('nav-badges');
const navSettings = document.getElementById('nav-settings');

const sectionHabits = document.getElementById('section-habits');
const sectionAnalytics = document.getElementById('section-analytics');
const sectionFocus = document.getElementById('section-focus');
const sectionJournal = document.getElementById('section-journal');
const sectionBadges = document.getElementById('section-badges');
const sectionSettings = document.getElementById('section-settings');

// DOM Elements - Habits
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitCategorySelect = document.getElementById('habit-category-select');
const habitList = document.getElementById('habit-list');
const emptyState = document.getElementById('empty-state');
const categoryFilters = document.getElementById('category-filters');

// DOM Elements - Analytics
const statTotalCompleted = document.getElementById('stat-total-completed');
const statCurrentStreak = document.getElementById('stat-current-streak');
const statPerfectDays = document.getElementById('stat-perfect-days');
const statFocusMinutes = document.getElementById('stat-focus-minutes');
const weeklyHeatmap = document.getElementById('weekly-heatmap');

// DOM Elements - Focus Timer
const timerDisplay = document.getElementById('timer-display');
const timerStatus = document.getElementById('timer-status');
const timerStartBtn = document.getElementById('timer-start-btn');
const timerResetBtn = document.getElementById('timer-reset-btn');
const timerModeFocus = document.getElementById('timer-mode-focus');
const timerModeBreak = document.getElementById('timer-mode-break');

// DOM Elements - Journal
const journalForm = document.getElementById('journal-form');
const moodPicker = document.getElementById('mood-picker');
const journalWinInput = document.getElementById('journal-win-input');
const journalNoteInput = document.getElementById('journal-note-input');
const journalLogsList = document.getElementById('journal-logs-list');

// DOM Elements - Badges
const badgesGrid = document.getElementById('badges-grid');

// DOM Elements - Settings
const settingsAlert = document.getElementById('settings-alert');
const customAvatarUrl = document.getElementById('custom-avatar-url');
const profileBioInput = document.getElementById('profile-bio-input');
const saveProfileBtn = document.getElementById('save-profile-btn');
const passwordResetForm = document.getElementById('password-reset-form');
const currentPwdInput = document.getElementById('current-pwd-input');
const newPwdInput = document.getElementById('new-pwd-input');
const confirmPwdInput = document.getElementById('confirm-pwd-input');
const themeSelector = document.getElementById('theme-selector');
const avatarPicker = document.getElementById('avatar-picker');

// Alerts
function showAlert(message, isSuccess = false) {
  authAlert.textContent = message;
  authAlert.className = `mb-4 p-3 rounded-xl text-xs font-medium border ${
    isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'
  }`;
  authAlert.classList.remove('hidden');
}

function clearAlert() {
  authAlert.classList.add('hidden');
  authAlert.textContent = '';
}

function showSettingsAlert(message, isSuccess = true) {
  settingsAlert.textContent = message;
  settingsAlert.className = `p-3 rounded-xl text-xs font-medium border ${
    isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'
  }`;
  settingsAlert.classList.remove('hidden');
  setTimeout(() => settingsAlert.classList.add('hidden'), 4000);
}

// Auth Tabs
function setAuthMode(mode) {
  authMode = mode;
  clearAlert();
  if (mode === 'login') {
    tabLogin.className = 'flex-1 py-2 text-sm font-semibold rounded-lg transition bg-white text-slate-900 shadow-xs';
    tabSignup.className = 'flex-1 py-2 text-sm font-medium rounded-lg transition text-slate-500 hover:text-slate-900';
    authSubmitBtn.textContent = 'Log In';
    usernameInput.placeholder = 'Enter your username';
  } else {
    tabSignup.className = 'flex-1 py-2 text-sm font-semibold rounded-lg transition bg-white text-slate-900 shadow-xs';
    tabLogin.className = 'flex-1 py-2 text-sm font-medium rounded-lg transition text-slate-500 hover:text-slate-900';
    authSubmitBtn.textContent = 'Create Account';
    usernameInput.placeholder = 'Choose a new username';
  }
}

tabLogin.addEventListener('click', () => setAuthMode('login'));
tabSignup.addEventListener('click', () => setAuthMode('signup'));

// Theme
function applyTheme(themeName) {
  document.body.className = `${themeName} theme-bg min-h-screen flex flex-col items-center justify-center py-6 px-3 sm:px-4`;
  if (currentUsername && users[currentUsername]) {
    users[currentUsername].theme = themeName;
    saveUsers(users);
  }
  document.querySelectorAll('.theme-opt').forEach(btn => {
    if (btn.dataset.theme === themeName) {
      btn.classList.add('ring-2', 'ring-emerald-500', 'border-transparent');
    } else {
      btn.classList.remove('ring-2', 'ring-emerald-500', 'border-transparent');
    }
  });
}

themeSelector.addEventListener('click', (e) => {
  const btn = e.target.closest('.theme-opt');
  if (btn && btn.dataset.theme) {
    applyTheme(btn.dataset.theme);
    showSettingsAlert(`Theme switched to ${btn.dataset.theme.replace('theme-', '')}!`);
  }
});

// Streaks
function calculateDailyStreak(user) {
  const today = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (!user.lastLoginDate) {
    user.streak = 1;
    user.lastLoginDate = today;
  } else if (user.lastLoginDate === today) {
    if (!user.streak) user.streak = 1;
  } else if (user.lastLoginDate === yesterdayStr) {
    user.streak = (user.streak || 0) + 1;
    user.lastLoginDate = today;
  } else {
    user.streak = 1;
    user.lastLoginDate = today;
  }
  saveUsers(users);
}

// User Init Helper
function ensureUserProperties(user) {
  if (!user.habits) user.habits = [];
  if (!user.journals) user.journals = [];
  if (!user.focusMinutes) user.focusMinutes = 0;
  if (!user.totalCompletedCount) user.totalCompletedCount = 0;
  if (!user.perfectDaysCount) user.perfectDaysCount = 0;
  if (!user.history) user.history = {}; // date -> { completed, total }
  if (!user.badges) user.badges = {};
}

// Auth Submit
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!username || !password) {
    showAlert('Please fill in both username and password.');
    return;
  }

  if (authMode === 'signup') {
    if (users[username]) {
      showAlert('Username already taken. Please log in or choose another.');
      return;
    }
    if (password.length < 3) {
      showAlert('Password must be at least 3 characters.');
      return;
    }

    const today = getLocalDateString(new Date());
    users[username] = {
      password: password,
      streak: 1,
      lastLoginDate: today,
      avatar: "🦊",
      avatarUrl: "",
      bio: "Ready to build new daily habits!",
      theme: "theme-emerald",
      habits: [
        { id: Date.now(), name: "Drink 2L of water", category: "Health", completed: false },
        { id: Date.now() + 1, name: "15 min book reading", category: "Learn", completed: false }
      ],
      journals: [],
      focusMinutes: 0,
      totalCompletedCount: 0,
      perfectDaysCount: 0,
      history: {},
      badges: { "first_step": true }
    };

    saveUsers(users);
    currentUsername = username;
    saveActiveSession(username);
    authForm.reset();
    clearAlert();
    showApp();
  } else {
    const user = users[username];
    if (!user || user.password !== password) {
      showAlert('Account not found or password incorrect.');
      return;
    }

    ensureUserProperties(user);
    calculateDailyStreak(user);
    currentUsername = username;
    saveActiveSession(username);
    authForm.reset();
    clearAlert();
    showApp();
  }
});

// Tab Navigation
const tabConfig = [
  { btn: navHabits, section: sectionHabits, name: 'habits' },
  { btn: navAnalytics, section: sectionAnalytics, name: 'analytics' },
  { btn: navFocus, section: sectionFocus, name: 'focus' },
  { btn: navJournal, section: sectionJournal, name: 'journal' },
  { btn: navBadges, section: sectionBadges, name: 'badges' },
  { btn: navSettings, section: sectionSettings, name: 'settings' }
];

function switchTab(tab) {
  currentTab = tab;
  tabConfig.forEach(item => {
    if (item.name === tab) {
      item.btn.className = 'nav-tab shrink-0 flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition bg-white text-slate-900 shadow-xs flex items-center justify-center gap-1';
      item.section.classList.remove('hidden');
    } else {
      item.btn.className = 'nav-tab shrink-0 flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition text-slate-500 hover:text-slate-900 flex items-center justify-center gap-1';
      item.section.classList.add('hidden');
    }
  });

  if (tab === 'habits') renderHabits();
  if (tab === 'analytics') renderAnalytics();
  if (tab === 'journal') renderJournal();
  if (tab === 'badges') renderBadges();
  if (tab === 'settings') populateSettingsFields();
}

tabConfig.forEach(item => {
  item.btn.addEventListener('click', () => switchTab(item.name));
});

// Avatar helper
function renderAvatarElement(container, user) {
  container.innerHTML = '';
  if (user.avatarUrl && user.avatarUrl.trim() !== '') {
    const img = document.createElement('img');
    img.src = user.avatarUrl;
    img.alt = 'Avatar';
    img.className = 'w-full h-full object-cover';
    img.onerror = () => { container.textContent = user.avatar || '👤'; };
    container.appendChild(img);
  } else if (user.avatar) {
    container.textContent = user.avatar;
  } else {
    container.textContent = '👤';
  }
}

// Show Dashboard
function showApp() {
  authView.classList.add('hidden');
  trackerView.classList.remove('hidden');

  const user = users[currentUsername];
  if (!user) { logout(); return; }

  ensureUserProperties(user);
  applyTheme(user.theme || 'theme-emerald');

  currentUserDisplay.textContent = currentUsername;
  const streak = user.streak || 1;
  streakCount.textContent = `${streak} ${streak === 1 ? 'Day' : 'Days'}`;
  renderAvatarElement(userAvatar, user);

  switchTab('habits');
}

function logout() {
  currentUsername = null;
  saveActiveSession(null);
  trackerView.classList.add('hidden');
  authView.classList.remove('hidden');
  setAuthMode('login');
  applyTheme('theme-emerald');
}
logoutBtn.addEventListener('click', logout);

// ================= SECTION 1: HABITS =================
categoryFilters.addEventListener('click', (e) => {
  const btn = e.target.closest('.cat-filter');
  if (btn && btn.dataset.filter) {
    selectedCategoryFilter = btn.dataset.filter;
    document.querySelectorAll('.cat-filter').forEach(b => {
      b.className = 'cat-filter px-2.5 py-1 rounded-lg font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition';
    });
    btn.className = 'cat-filter px-2.5 py-1 rounded-lg font-semibold bg-slate-900 text-white transition';
    renderHabits();
  }
});

function renderHabits() {
  if (!currentUsername || !users[currentUsername]) return;
  const user = users[currentUsername];
  ensureUserProperties(user);

  let habits = user.habits || [];
  if (selectedCategoryFilter !== 'all') {
    habits = habits.filter(h => h.category === selectedCategoryFilter);
  }

  habitList.innerHTML = '';
  if (habits.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  const categoryIcons = {
    Health: '🏃',
    Mind: '🧘',
    Work: '⚡',
    Learn: '📚'
  };

  habits.forEach((habit) => {
    const li = document.createElement('li');
    li.className = `flex items-center justify-between p-3 rounded-xl border transition-all ${
      habit.completed
        ? 'bg-emerald-50/60 border-emerald-200 text-slate-400'
        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-xs'
    }`;

    const checkContainer = document.createElement('div');
    checkContainer.className = 'flex items-center gap-2.5 cursor-pointer select-none flex-1 overflow-hidden';
    checkContainer.addEventListener('click', () => toggleHabit(habit.id));

    const customCheck = document.createElement('div');
    customCheck.className = `w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 ${
      habit.completed ? 'theme-btn-primary border-transparent text-white' : 'border-slate-300 bg-white'
    }`;
    customCheck.innerHTML = habit.completed
      ? '<svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>'
      : '';

    const textDiv = document.createElement('div');
    textDiv.className = 'truncate';

    const textSpan = document.createElement('span');
    textSpan.className = `text-sm font-medium ${habit.completed ? 'line-through text-slate-400' : 'text-slate-800'}`;
    textSpan.textContent = habit.name;

    const catBadge = document.createElement('span');
    const cat = habit.category || 'Health';
    catBadge.className = 'ml-2 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold';
    catBadge.textContent = `${categoryIcons[cat] || '✨'} ${cat}`;

    textDiv.appendChild(textSpan);
    textDiv.appendChild(catBadge);

    checkContainer.appendChild(customCheck);
    checkContainer.appendChild(textDiv);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'text-slate-300 hover:text-rose-500 p-1 rounded-lg transition shrink-0';
    deleteBtn.setAttribute('aria-label', 'Delete habit');
    deleteBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteHabit(habit.id);
    });

    li.appendChild(checkContainer);
    li.appendChild(deleteBtn);
    habitList.appendChild(li);
  });

  updateProgress();
}

function updateProgress() {
  if (!currentUsername || !users[currentUsername]) return;
  const user = users[currentUsername];
  const allHabits = user.habits || [];
  const total = allHabits.length;
  const completed = allHabits.filter(h => h.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  progressText.textContent = `${completed} / ${total} completed (${percentage}%)`;
  progressBar.style.width = `${percentage}%`;

  // Update today's record in user history
  const today = getLocalDateString(new Date());
  user.history[today] = { completed, total };
  if (total > 0 && completed === total) {
    user.badges["flawless_day"] = true;
  }
  saveUsers(users);
}

function addHabit(name, category) {
  const trimmed = name.trim();
  if (!trimmed || !currentUsername || !users[currentUsername]) return;

  const newHabit = {
    id: Date.now(),
    name: trimmed,
    category: category || "Health",
    completed: false
  };

  users[currentUsername].habits.unshift(newHabit);
  users[currentUsername].badges["first_step"] = true;
  saveUsers(users);
  renderHabits();
}

function toggleHabit(id) {
  if (!currentUsername || !users[currentUsername]) return;
  const user = users[currentUsername];
  user.habits = user.habits.map(h => {
    if (h.id === id) {
      const nextStatus = !h.completed;
      if (nextStatus) {
        user.totalCompletedCount = (user.totalCompletedCount || 0) + 1;
        if (user.totalCompletedCount >= 10) user.badges["ten_completed"] = true;
      }
      return { ...h, completed: nextStatus };
    }
    return h;
  });
  saveUsers(users);
  renderHabits();
}

function deleteHabit(id) {
  if (!currentUsername || !users[currentUsername]) return;
  users[currentUsername].habits = users[currentUsername].habits.filter(h => h.id !== id);
  saveUsers(users);
  renderHabits();
}

habitForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addHabit(habitInput.value, habitCategorySelect.value);
  habitInput.value = '';
  habitInput.focus();
});

// ================= SECTION 2: ANALYTICS & STATS =================
function renderAnalytics() {
  if (!currentUsername || !users[currentUsername]) return;
  const user = users[currentUsername];
  ensureUserProperties(user);

  statTotalCompleted.textContent = user.totalCompletedCount || 0;
  statCurrentStreak.textContent = `${user.streak || 1} ${user.streak === 1 ? 'Day' : 'Days'}`;
  
  // Count perfect days from history
  let perfectDays = 0;
  Object.keys(user.history || {}).forEach(date => {
    const day = user.history[date];
    if (day.total > 0 && day.completed === day.total) perfectDays++;
  });
  statPerfectDays.textContent = perfectDays;
  statFocusMinutes.textContent = `${user.focusMinutes || 0}m`;

  // Render 7-day matrix
  weeklyHeatmap.innerHTML = '';
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayName = dayNames[d.getDay()];

    const rec = user.history[dateStr] || { completed: 0, total: 0 };
    const pct = rec.total > 0 ? (rec.completed / rec.total) : 0;

    let bgClass = 'bg-slate-200 text-slate-400';
    if (pct === 1 && rec.total > 0) bgClass = 'bg-emerald-500 text-white font-bold';
    else if (pct > 0) bgClass = 'bg-emerald-300 text-emerald-950 font-semibold';

    const col = document.createElement('div');
    col.className = 'flex flex-col items-center gap-1';

    const box = document.createElement('div');
    box.className = `w-8 h-8 rounded-lg flex items-center justify-center text-[10px] transition ${bgClass}`;
    box.textContent = rec.completed;

    const label = document.createElement('span');
    label.className = 'text-[10px] theme-muted';
    label.textContent = dayName;

    col.appendChild(box);
    col.appendChild(label);
    weeklyHeatmap.appendChild(col);
  }
}

// ================= SECTION 3: FOCUS TIMER =================
function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

timerModeFocus.addEventListener('click', () => {
  timerMode = 'focus';
  timerSeconds = 25 * 60;
  timerModeFocus.className = 'px-3 py-1 rounded-lg bg-white shadow-xs text-slate-900 transition';
  timerModeBreak.className = 'px-3 py-1 rounded-lg text-slate-500 hover:text-slate-900 transition';
  timerStatus.textContent = 'Focus Session (25 min)';
  pauseTimer();
  updateTimerDisplay();
});

timerModeBreak.addEventListener('click', () => {
  timerMode = 'break';
  timerSeconds = 5 * 60;
  timerModeBreak.className = 'px-3 py-1 rounded-lg bg-white shadow-xs text-slate-900 transition';
  timerModeFocus.className = 'px-3 py-1 rounded-lg text-slate-500 hover:text-slate-900 transition';
  timerStatus.textContent = 'Short Rest Break (5 min)';
  pauseTimer();
  updateTimerDisplay();
});

function startTimer() {
  if (timerRunning) {
    pauseTimer();
    return;
  }
  timerRunning = true;
  timerStartBtn.textContent = 'Pause';
  timerStartBtn.className = 'bg-amber-500 hover:bg-amber-600 px-6 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm transition active:scale-95';
  timerStatus.textContent = timerMode === 'focus' ? 'Deep work in progress...' : 'Relax and recharge...';

  timerInterval = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerRunning = false;
      timerStartBtn.textContent = 'Start';
      timerStartBtn.className = 'theme-btn-primary px-6 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition active:scale-95';
      
      if (timerMode === 'focus') {
        timerStatus.textContent = 'Session complete! 🎉 Take a break.';
        if (currentUsername && users[currentUsername]) {
          users[currentUsername].focusMinutes = (users[currentUsername].focusMinutes || 0) + 25;
          users[currentUsername].badges["focus_master"] = true;
          saveUsers(users);
        }
      } else {
        timerStatus.textContent = 'Break finished! Ready for the next round?';
      }
    }
  }, 1000);
}

function pauseTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
  timerStartBtn.textContent = 'Start';
  timerStartBtn.className = 'theme-btn-primary px-6 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition active:scale-95';
}

function resetTimer() {
  pauseTimer();
  timerSeconds = timerMode === 'focus' ? 25 * 60 : 5 * 60;
  timerStatus.textContent = 'Ready to start';
  updateTimerDisplay();
}

timerStartBtn.addEventListener('click', startTimer);
timerResetBtn.addEventListener('click', resetTimer);

// ================= SECTION 4: DAILY JOURNAL =================
moodPicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.mood-btn');
  if (btn && btn.dataset.mood) {
    selectedMood = btn.dataset.mood;
    document.querySelectorAll('.mood-btn').forEach(b => {
      b.className = 'mood-btn text-xl p-2 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 transition';
    });
    btn.className = 'mood-btn text-xl p-2 rounded-xl border-2 border-emerald-500 bg-emerald-50 transition';
  }
});

journalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUsername || !users[currentUsername]) return;
  const user = users[currentUsername];
  ensureUserProperties(user);

  const win = journalWinInput.value.trim();
  const note = journalNoteInput.value.trim();
  if (!win && !note) return;

  const entry = {
    id: Date.now(),
    date: getLocalDateString(new Date()),
    mood: selectedMood,
    win: win || 'Took time to reflect on my habits.',
    note: note
  };

  user.journals.unshift(entry);
  user.badges["mindful"] = true;
  saveUsers(users);

  journalForm.reset();
  renderJournal();
});

function renderJournal() {
  if (!currentUsername || !users[currentUsername]) return;
  const user = users[currentUsername];
  ensureUserProperties(user);

  journalLogsList.innerHTML = '';
  const logs = user.journals || [];

  if (logs.length === 0) {
    journalLogsList.innerHTML = '<p class="text-xs theme-muted py-3 text-center">No reflection logs yet. Write your daily entry above!</p>';
    return;
  }

  logs.slice(0, 5).forEach(log => {
    const card = document.createElement('div');
    card.className = 'p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1';

    const top = document.createElement('div');
    top.className = 'flex justify-between items-center text-xs';
    top.innerHTML = `<span class="font-bold flex items-center gap-1"><span>${log.mood}</span> ${log.date}</span>`;

    const winP = document.createElement('p');
    winP.className = 'text-xs text-slate-800 font-medium';
    winP.textContent = `🌟 ${log.win}`;

    card.appendChild(top);
    card.appendChild(winP);

    if (log.note) {
      const noteP = document.createElement('p');
      noteP.className = 'text-[11px] theme-muted italic';
      noteP.textContent = `"${log.note}"`;
      card.appendChild(noteP);
    }

    journalLogsList.appendChild(card);
  });
}

// ================= SECTION 5: BADGES & MILESTONES =================
const badgesList = [
  { id: "first_step", icon: "🌱", title: "First Step", desc: "Added your first daily habit" },
  { id: "flawless_day", icon: "💯", title: "Flawless Day", desc: "Completed 100% of habits in one day" },
  { id: "streak_3", icon: "🔥", title: "On Fire", desc: "Maintained a 3-day active streak" },
  { id: "ten_completed", icon: "⚡", title: "Momentum", desc: "Completed 10 total habit tasks" },
  { id: "focus_master", icon: "⏱️", title: "Focus Master", desc: "Completed a 25m Pomodoro session" },
  { id: "mindful", icon: "📖", title: "Mindful", desc: "Wrote your first daily reflection entry" }
];

function renderBadges() {
  if (!currentUsername || !users[currentUsername]) return;
  const user = users[currentUsername];
  ensureUserProperties(user);

  // Auto-check streak 3
  if ((user.streak || 1) >= 3) user.badges["streak_3"] = true;

  badgesGrid.innerHTML = '';
  badgesList.forEach(badge => {
    const unlocked = !!user.badges[badge.id];

    const card = document.createElement('div');
    card.className = `p-3.5 rounded-xl border transition flex items-start gap-3 ${
      unlocked
        ? 'bg-amber-50/70 border-amber-200 text-slate-900 shadow-xs'
        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
    }`;

    const iconDiv = document.createElement('div');
    iconDiv.className = `w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
      unlocked ? 'bg-amber-100 border border-amber-300' : 'bg-slate-200'
    }`;
    iconDiv.textContent = badge.icon;

    const info = document.createElement('div');
    info.className = 'overflow-hidden';

    const titleH = document.createElement('h4');
    titleH.className = 'text-xs font-bold flex items-center gap-1.5';
    titleH.textContent = badge.title;
    if (unlocked) {
      const check = document.createElement('span');
      check.className = 'text-[10px] text-emerald-600';
      check.textContent = '✓';
      titleH.appendChild(check);
    }

    const descP = document.createElement('p');
    descP.className = 'text-[10px] theme-muted mt-0.5 leading-snug';
    descP.textContent = badge.desc;

    info.appendChild(titleH);
    info.appendChild(descP);

    card.appendChild(iconDiv);
    card.appendChild(info);
    badgesGrid.appendChild(card);
  });
}

// ================= SECTION 6: SETTINGS =================
function populateSettingsFields() {
  if (!currentUsername || !users[currentUsername]) return;
  const user = users[currentUsername];

  selectedAvatarEmoji = user.avatar || '🦊';
  customAvatarUrl.value = user.avatarUrl || '';
  profileBioInput.value = user.bio || '';

  document.querySelectorAll('#avatar-picker .avatar-option').forEach(btn => {
    if (btn.dataset.avatar === selectedAvatarEmoji) {
      btn.className = 'avatar-option text-xl w-10 h-10 rounded-xl border-2 border-emerald-500 bg-emerald-50 transition flex items-center justify-center';
    } else {
      btn.className = 'avatar-option text-xl w-10 h-10 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 transition flex items-center justify-center';
    }
  });
}

avatarPicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.avatar-option');
  if (btn && btn.dataset.avatar) {
    selectedAvatarEmoji = btn.dataset.avatar;
    document.querySelectorAll('#avatar-picker .avatar-option').forEach(b => {
      b.className = 'avatar-option text-xl w-10 h-10 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 transition flex items-center justify-center';
    });
    btn.className = 'avatar-option text-xl w-10 h-10 rounded-xl border-2 border-emerald-500 bg-emerald-50 transition flex items-center justify-center';
  }
});

saveProfileBtn.addEventListener('click', () => {
  if (!currentUsername || !users[currentUsername]) return;
  const user = users[currentUsername];
  user.avatar = selectedAvatarEmoji;
  user.avatarUrl = customAvatarUrl.value.trim();
  user.bio = profileBioInput.value.trim() || 'Habit builder';

  saveUsers(users);
  renderAvatarElement(userAvatar, user);
  showSettingsAlert('Profile photo & description updated successfully!');
});

passwordResetForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUsername || !users[currentUsername]) return;
  const user = users[currentUsername];

  const currentVal = currentPwdInput.value;
  const newVal = newPwdInput.value;
  const confirmVal = confirmPwdInput.value;

  if (user.password !== currentVal) {
    showSettingsAlert('Current password incorrect.', false);
    return;
  }
  if (newVal.length < 3) {
    showSettingsAlert('New password must be at least 3 characters long.', false);
    return;
  }
  if (newVal !== confirmVal) {
    showSettingsAlert('New passwords do not match.', false);
    return;
  }

  user.password = newVal;
  saveUsers(users);
  passwordResetForm.reset();
  showSettingsAlert('Password updated successfully! Keep it safe.');
});

// Initialize on Load
if (currentUsername && users[currentUsername]) {
  ensureUserProperties(users[currentUsername]);
  calculateDailyStreak(users[currentUsername]);
  showApp();
} else {
  setAuthMode('login');
}
