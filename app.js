// =====================================================================
// GLOBAL CLOUD DATABASE CONFIGURATION (FIREBASE)
// ---------------------------------------------------------------------
// To make all real accounts from different phones and computers
// compete on the SAME shared leaderboard, paste your free Firebase config below:
// =====================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBVLVA3j1uVHDQ6gdeMHOhrrezPrjEQYtA",
  authDomain: "habit-tracker-c59f4.firebaseapp.com",
  databaseURL: "https://habit-tracker-c59f4-default-rtdb.firebaseio.com",
  projectId: "habit-tracker-c59f4",
  storageBucket: "habit-tracker-c59f4.firebasestorage.app",
  messagingSenderId: "835372821053",
  appId: "1:835372821053:web:7d0496822eaa8207521854",
  measurementId: "G-D5WMQMQZGF"
};

let db = null;
let isCloudActive = false;

// Check if user filled in their Firebase config
function initCloudSync() {
  if (
    typeof firebase !== 'undefined' &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.databaseURL &&
    !firebaseConfig.databaseURL.includes("YOUR_PROJECT_ID")
  ) {
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.database();
      isCloudActive = true;
      console.log("🌐 Connected to Global Realtime Database!");

      // Listen in real-time to all user accounts across the world
      db.ref('users').on('value', (snapshot) => {
        const cloudData = snapshot.val();
        if (cloudData && typeof cloudData === 'object') {
          users = cloudData;
          saveUsersLocally(users);
          renderLeaderboard();
          if (currentUsername && users[currentUsername] && currentTab === 'habits') {
            renderHabits();
          }
        }
      });
    } catch (e) {
      console.warn("Could not connect to Firebase:", e);
    }
  }
}

function syncUserToCloud(username) {
  if (isCloudActive && db && username && users[username]) {
    try {
      db.ref('users/' + username).set(users[username]);
    } catch (e) {
      console.warn("Cloud sync error:", e);
    }
  }
}

// Helper: Local Date string YYYY-MM-DD
    function getLocalDateString(d = new Date()) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Default Seed Data: Clean slate, NO fake/demo accounts
    function getInitialUsers() {
      return {};
    }

    // Safe Storage Management
    function loadUsers() {
      try {
        const stored = localStorage.getItem('habit_tracker_users_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            // Remove any legacy demo / seeded dummy accounts
            delete parsed['demo'];
            delete parsed['maya_runner'];
            delete parsed['alex_code'];
            delete parsed['sam_mindful'];
            saveUsers(parsed);
            return parsed;
          }
        }
      } catch (e) {
        console.warn('localStorage not accessible, using in-memory state');
      }
      return getInitialUsers();
    }

    function saveUsersLocally(users) {
  try {
    localStorage.setItem('habit_tracker_users_v2', JSON.stringify(users));
  } catch (e) {}
}

function saveUsers(users) {
  saveUsersLocally(users);
  if (currentUsername) {
    syncUserToCloud(currentUsername);
  }
}
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
    let authMode = 'login'; // 'login' or 'signup'
    let currentTab = 'habits'; // 'habits', 'leaderboard', 'settings'
    let selectedAvatarEmoji = '🦊';

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

    // DOM Elements - Shell & Nav
    const userAvatar = document.getElementById('user-avatar');
    const currentUserDisplay = document.getElementById('current-user-display');
    const streakCount = document.getElementById('streak-count');
    const logoutBtn = document.getElementById('logout-btn');
    const navHabits = document.getElementById('nav-habits');
    const navLeaderboard = document.getElementById('nav-leaderboard');
    const navSettings = document.getElementById('nav-settings');
    const sectionHabits = document.getElementById('section-habits');
    const sectionLeaderboard = document.getElementById('section-leaderboard');
    const sectionSettings = document.getElementById('section-settings');

    // DOM Elements - Habits
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');
    const habitForm = document.getElementById('habit-form');
    const habitInput = document.getElementById('habit-input');
    const habitList = document.getElementById('habit-list');
    const emptyState = document.getElementById('empty-state');

    // DOM Elements - Leaderboard
    const leaderboardList = document.getElementById('leaderboard-list');
    const leaderboardTotalUsers = document.getElementById('leaderboard-total-users');

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

    // Display Alert in Auth Box
    function showAlert(message, isSuccess = false) {
      authAlert.textContent = message;
      authAlert.className = `mb-4 p-3 rounded-xl text-xs font-medium border ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-rose-50 border-rose-200 text-rose-700'
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
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-rose-50 border-rose-200 text-rose-700'
      }`;
      settingsAlert.classList.remove('hidden');
      setTimeout(() => {
        settingsAlert.classList.add('hidden');
      }, 4000);
    }

    // Toggle Login / Signup Tabs
    function setAuthMode(mode) {
      authMode = mode;
      clearAlert();

      if (mode === 'login') {
        tabLogin.className = 'flex-1 py-2 text-sm font-semibold rounded-lg transition bg-white text-slate-900 shadow-xs';
        tabSignup.className = 'flex-1 py-2 text-sm font-medium rounded-lg transition text-slate-500 hover:text-slate-900';
        authSubmitBtn.textContent = 'Log In';
        authSubmitBtn.className = 'w-full theme-btn-primary font-semibold py-2.5 px-4 rounded-xl shadow-sm transition text-sm mt-2';
        usernameInput.placeholder = 'Enter your username';
      } else {
        tabSignup.className = 'flex-1 py-2 text-sm font-semibold rounded-lg transition bg-white text-slate-900 shadow-xs';
        tabLogin.className = 'flex-1 py-2 text-sm font-medium rounded-lg transition text-slate-500 hover:text-slate-900';
        authSubmitBtn.textContent = 'Create Account';
        authSubmitBtn.className = 'w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm transition text-sm mt-2';
        usernameInput.placeholder = 'Choose a new username';
      }
    }

    tabLogin.addEventListener('click', () => setAuthMode('login'));
    tabSignup.addEventListener('click', () => setAuthMode('signup'));

    // Theme Management
    function applyTheme(themeName) {
      document.body.className = `${themeName} theme-bg min-h-screen flex flex-col items-center justify-center py-6 px-4`;
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

    // Daily Streak Logic
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

    // Authenticate
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
          showAlert('That username is already taken. Try logging in or choose another.');
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
            { id: Date.now(), name: "First habit: Plan tomorrow", completed: false }
          ]
        };

        saveUsers(users);
        currentUsername = username;
        saveActiveSession(username);
        authForm.reset();
        clearAlert();
        showApp();
      } else {
        // Login mode
        const user = users[username];
        if (!user || user.password !== password) {
          showAlert('Account not found or password incorrect. Switch to "Create Account" if you are new!');
          return;
        }

        calculateDailyStreak(user);

        currentUsername = username;
        saveActiveSession(username);
        authForm.reset();
        clearAlert();
        showApp();
      }
    });

    // Navigation Tab Switching
    function switchTab(tab) {
      currentTab = tab;
      const navButtons = [
        { btn: navHabits, section: sectionHabits, name: 'habits' },
        { btn: navLeaderboard, section: sectionLeaderboard, name: 'leaderboard' },
        { btn: navSettings, section: sectionSettings, name: 'settings' }
      ];

      navButtons.forEach(item => {
        if (item.name === tab) {
          item.btn.className = 'flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition bg-white text-slate-900 shadow-xs flex items-center justify-center gap-1.5';
          item.section.classList.remove('hidden');
        } else {
          item.btn.className = 'flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition text-slate-500 hover:text-slate-900 flex items-center justify-center gap-1.5';
          item.section.classList.add('hidden');
        }
      });

      if (tab === 'leaderboard') renderLeaderboard();
      if (tab === 'settings') populateSettingsFields();
      if (tab === 'habits') renderHabits();
    }

    navHabits.addEventListener('click', () => switchTab('habits'));
    navLeaderboard.addEventListener('click', () => switchTab('leaderboard'));
    navSettings.addEventListener('click', () => switchTab('settings'));

    // Display Avatar Helper
    function renderAvatarElement(container, user) {
      container.innerHTML = '';
      if (user.avatarUrl && user.avatarUrl.trim() !== '') {
        const img = document.createElement('img');
        img.src = user.avatarUrl;
        img.alt = 'Avatar';
        img.className = 'w-full h-full object-cover';
        img.onerror = () => {
          container.textContent = user.avatar || user.username?.charAt(0).toUpperCase() || '👤';
        };
        container.appendChild(img);
      } else if (user.avatar) {
        container.textContent = user.avatar;
      } else {
        container.textContent = '👤';
      }
    }

    // Show App Dashboard
    function showApp() {
      authView.classList.add('hidden');
      trackerView.classList.remove('hidden');

      const user = users[currentUsername];
      if (!user) {
        logout();
        return;
      }

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

    // Render Habits
    function renderHabits() {
      if (!currentUsername || !users[currentUsername]) return;

      const user = users[currentUsername];
      const habits = user.habits || [];

      habitList.innerHTML = '';

      if (habits.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }

      habits.forEach((habit) => {
        const li = document.createElement('li');
        li.className = `flex items-center justify-between p-3 rounded-xl border transition-all ${
          habit.completed
            ? 'bg-emerald-50/60 border-emerald-200 text-slate-400'
            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-xs'
        }`;

        const checkContainer = document.createElement('div');
        checkContainer.className = 'flex items-center gap-3 cursor-pointer select-none flex-1';
        checkContainer.addEventListener('click', () => toggleHabit(habit.id));

        const customCheck = document.createElement('div');
        customCheck.className = `w-5 h-5 rounded-md flex items-center justify-center border transition ${
          habit.completed
            ? 'theme-btn-primary border-transparent text-white'
            : 'border-slate-300 bg-white'
        }`;
        customCheck.innerHTML = habit.completed
          ? '<svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>'
          : '';

        const textSpan = document.createElement('span');
        textSpan.className = `text-sm font-medium ${habit.completed ? 'line-through text-slate-400' : 'text-slate-800'}`;
        textSpan.textContent = habit.name;

        checkContainer.appendChild(customCheck);
        checkContainer.appendChild(textSpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-slate-300 hover:text-rose-500 p-1 rounded-lg transition';
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
      const habits = users[currentUsername].habits || [];
      const total = habits.length;
      const completed = habits.filter(h => h.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      progressText.textContent = `${completed} / ${total} completed (${percentage}%)`;
      progressBar.style.width = `${percentage}%`;
    }

    function addHabit(name) {
      const trimmed = name.trim();
      if (!trimmed || !currentUsername || !users[currentUsername]) return;

      const newHabit = {
        id: Date.now(),
        name: trimmed,
        completed: false
      };

      if (!users[currentUsername].habits) {
        users[currentUsername].habits = [];
      }

      users[currentUsername].habits.unshift(newHabit);
      saveUsers(users);
      renderHabits();
    }

    function toggleHabit(id) {
      if (!currentUsername || !users[currentUsername]) return;
      users[currentUsername].habits = users[currentUsername].habits.map(h => {
        if (h.id === id) {
          return { ...h, completed: !h.completed };
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
      addHabit(habitInput.value);
      habitInput.value = '';
      habitInput.focus();
    });

    // ================= LEADERBOARD LOGIC =================
    function renderLeaderboard() {
      const userList = Object.keys(users).map(uname => ({
        username: uname,
        streak: users[uname].streak || 1,
        avatar: users[uname].avatar || '🦊',
        avatarUrl: users[uname].avatarUrl || '',
        bio: users[uname].bio || 'Habit builder'
      }));

      // Sort by streak descending
      userList.sort((a, b) => b.streak - a.streak);

      leaderboardTotalUsers.textContent = `${userList.length} ${userList.length === 1 ? 'Member' : 'Members'}`;
      leaderboardList.innerHTML = '';

      if (userList.length === 0) {
        leaderboardList.innerHTML = `
          <div class="text-center py-8 theme-muted">
            <p class="text-sm font-semibold">No members yet</p>
            <p class="text-xs mt-1 opacity-75">Create an account to join the leaderboard!</p>
          </div>
        `;
        return;
      }

      userList.forEach((item, index) => {
        const rank = index + 1;
        const isCurrent = (item.username === currentUsername);

        let medalBadge = `<span class="text-xs font-bold w-6 text-center text-slate-400">#${rank}</span>`;
        if (rank === 1) medalBadge = `<span class="text-lg w-6 text-center">🥇</span>`;
        else if (rank === 2) medalBadge = `<span class="text-lg w-6 text-center">🥈</span>`;
        else if (rank === 3) medalBadge = `<span class="text-lg w-6 text-center">🥉</span>`;

        const row = document.createElement('div');
        row.className = `flex items-center justify-between p-3 rounded-xl border transition ${
          isCurrent
            ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/50'
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`;

        const left = document.createElement('div');
        left.className = 'flex items-center gap-3 overflow-hidden';

        const rankContainer = document.createElement('div');
        rankContainer.innerHTML = medalBadge;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-slate-100 overflow-hidden shrink-0 border border-slate-200';
        renderAvatarElement(avatarDiv, item);

        const info = document.createElement('div');
        info.className = 'truncate';

        const nameLine = document.createElement('div');
        nameLine.className = 'text-xs font-bold text-slate-900 flex items-center gap-1.5';
        nameLine.textContent = item.username;
        if (isCurrent) {
          const youTag = document.createElement('span');
          youTag.className = 'bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded font-semibold';
          youTag.textContent = 'YOU';
          nameLine.appendChild(youTag);
        }

        const bioLine = document.createElement('div');
        bioLine.className = 'text-[11px] text-slate-500 truncate max-w-[180px] sm:max-w-xs';
        bioLine.textContent = item.bio;

        info.appendChild(nameLine);
        info.appendChild(bioLine);

        left.appendChild(rankContainer);
        left.appendChild(avatarDiv);
        left.appendChild(info);

        const right = document.createElement('div');
        right.className = 'flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold shrink-0';
        right.innerHTML = `<span>🔥</span><span>${item.streak}d</span>`;

        row.appendChild(left);
        row.appendChild(right);
        leaderboardList.appendChild(row);
      });
    }

    // ================= SETTINGS LOGIC =================
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

    // Check Active Session on Page Load
    if (currentUsername && users[currentUsername]) {
      calculateDailyStreak(users[currentUsername]);
      showApp();
    } else {
      setAuthMode('login');
    }
// Initialize Cloud Database Connection if configured
initCloudSync();
