/**
 * Drink H2O - Daily Hydration Tracker
 * Vanilla JavaScript implementation for GitHub Pages deployment.
 * Handles state, localStorage persistence, sound synthesis, and UI reactivity.
 */

(() => {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    GOAL: 'drink_h2o_goal',
    INTAKE: 'drink_h2o_intake',
    LOGS: 'drink_h2o_logs',
    LAST_DATE: 'drink_h2o_last_date',
    THEME: 'drink_h2o_theme'
  };

  // State
  let state = {
    dailyGoal: 2500,
    currentIntake: 0,
    logs: [],
    theme: 'light'
  };

  // DOM Elements
  const elements = {
    currentDateDisplay: document.getElementById('currentDateDisplay'),
    goalDisplay: document.getElementById('goalDisplay'),
    completionBadge: document.getElementById('completionBadge'),
    editGoalBtn: document.getElementById('editGoalBtn'),
    goalEditForm: document.getElementById('goalEditForm'),
    goalInput: document.getElementById('goalInput'),
    cancelGoalBtn: document.getElementById('cancelGoalBtn'),
    waveContainer: document.getElementById('waveContainer'),
    percentText: document.getElementById('percentText'),
    currentIntakeText: document.getElementById('currentIntakeText'),
    remainingText: document.getElementById('remainingText'),
    glassesCount: document.getElementById('glassesCount'),
    statusMessage: document.getElementById('statusMessage'),
    logCount: document.getElementById('logCount'),
    customLogForm: document.getElementById('customLogForm'),
    customAmountInput: document.getElementById('customAmountInput'),
    undoBtn: document.getElementById('undoBtn'),
    resetDayBtn: document.getElementById('resetDayBtn'),
    logList: document.getElementById('logList'),
    emptyLogState: document.getElementById('emptyLogState'),
    totalLoggedBadge: document.getElementById('totalLoggedBadge'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    toast: document.getElementById('toast'),
    presetButtons: document.querySelectorAll('.btn-preset')
  };

  // Sound Synthesizer via Web Audio API (No external sound files required)
  let audioCtx = null;
  function playWaterDropSound() {
    try {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      const now = audioCtx.currentTime;

      // Pitch ramp simulating water droplet: quick rise then slight decay
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.18);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  }

  // Toast Notification
  let toastTimeout;
  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 2400);
  }

  // Get formatted today string: YYYY-MM-DD
  function getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Load state from localStorage with midnight date rollover check
  function loadState() {
    const today = getTodayDateString();
    const storedDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);

    // Stored goal
    const savedGoal = localStorage.getItem(STORAGE_KEYS.GOAL);
    if (savedGoal && !isNaN(parseInt(savedGoal, 10))) {
      state.dailyGoal = parseInt(savedGoal, 10);
    }

    // Stored theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) {
      state.theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      state.theme = 'dark';
    }

    // Check if new day
    if (storedDate !== today) {
      // New day: archive or reset today's intake
      state.currentIntake = 0;
      state.logs = [];
      localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
      saveState();
    } else {
      // Same day: load logs and intake
      const savedIntake = localStorage.getItem(STORAGE_KEYS.INTAKE);
      state.currentIntake = savedIntake ? parseInt(savedIntake, 10) || 0 : 0;

      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      try {
        state.logs = savedLogs ? JSON.parse(savedLogs) : [];
      } catch (e) {
        state.logs = [];
      }
    }
  }

  // Save state to localStorage
  function saveState() {
    localStorage.setItem(STORAGE_KEYS.GOAL, state.dailyGoal.toString());
    localStorage.setItem(STORAGE_KEYS.INTAKE, state.currentIntake.toString());
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
    localStorage.setItem(STORAGE_KEYS.LAST_DATE, getTodayDateString());
    localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
  }

  // Add water intake
  function addWater(amount, label = 'Water') {
    if (amount <= 0) return;

    state.currentIntake += amount;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    state.logs.unshift({
      id: Date.now(),
      amount: amount,
      label: label,
      time: timeStr
    });

    saveState();
    updateUI();
    playWaterDropSound();
    showToast(`+${amount} ml logged! Keep going 💧`);
  }

  // Subtract water (undo last intake or subtract specific amount)
  function subtractWater(amount = 250) {
    if (state.currentIntake <= 0) {
      showToast('Intake is already 0 ml.');
      return;
    }

    const actualReduction = Math.min(state.currentIntake, amount);
    state.currentIntake -= actualReduction;

    // Remove the most recent log if it roughly matches or simply log an adjustment
    if (state.logs.length > 0) {
      state.logs.shift();
    }

    saveState();
    updateUI();
    showToast(`-${actualReduction} ml removed.`);
  }

  // Delete individual log entry
  function deleteLog(id) {
    const index = state.logs.findIndex(item => item.id === id);
    if (index !== -1) {
      const removed = state.logs.splice(index, 1)[0];
      state.currentIntake = Math.max(0, state.currentIntake - removed.amount);
      saveState();
      updateUI();
      showToast(`Removed entry of ${removed.amount} ml.`);
    }
  }

  // Reset current day's intake
  function resetDay() {
    if (state.currentIntake === 0 && state.logs.length === 0) {
      showToast("Today's progress is already empty.");
      return;
    }

    const confirmReset = confirm("Are you sure you want to reset today's water intake back to 0 ml?");
    if (confirmReset) {
      state.currentIntake = 0;
      state.logs = [];
      saveState();
      updateUI();
      showToast("Today's intake has been reset.");
    }
  }

  // Update DOM elements to reflect current state
  function updateUI() {
    const goal = state.dailyGoal;
    const intake = state.currentIntake;
    const percent = goal > 0 ? Math.round((intake / goal) * 100) : 0;
    const remaining = Math.max(0, goal - intake);
    const glasses = (intake / 250).toFixed(1);

    // Header & goal displays
    elements.goalDisplay.textContent = `${goal} ml`;
    elements.completionBadge.textContent = `${percent}%`;

    // Meter & Waves
    elements.percentText.textContent = `${percent}%`;
    elements.currentIntakeText.textContent = `${intake} ml`;
    elements.remainingText.textContent = remaining > 0 ? `${remaining} ml left` : 'Goal reached! 🎉';

    // Wave height (capped smoothly at 100%)
    const waveHeight = Math.min(100, Math.max(0, percent));
    elements.waveContainer.style.height = `${waveHeight}%`;

    // Quick stats row
    elements.glassesCount.textContent = glasses;
    elements.logCount.textContent = state.logs.length;

    let statusText = 'Starting';
    if (percent >= 100) {
      statusText = 'Hydrated! ✨';
    } else if (percent >= 75) {
      statusText = 'Almost there';
    } else if (percent >= 50) {
      statusText = 'Halfway done';
    } else if (percent > 0) {
      statusText = 'On track';
    }
    elements.statusMessage.textContent = statusText;

    // Badges & log list
    elements.totalLoggedBadge.textContent = `${intake} ml Total`;
    renderLogs();
  }

  // Render log history items
  function renderLogs() {
    elements.logList.innerHTML = '';

    if (state.logs.length === 0) {
      elements.emptyLogState.classList.remove('hidden');
    } else {
      elements.emptyLogState.classList.add('hidden');

      state.logs.forEach(log => {
        const li = document.createElement('li');
        li.className = 'log-item';

        li.innerHTML = `
          <div class="log-info">
            <span class="log-icon">💧</span>
            <div>
              <div class="log-amount">+${log.amount} ml</div>
              <div class="log-time">${log.label} • ${log.time}</div>
            </div>
          </div>
          <button class="log-delete-btn" data-id="${log.id}" aria-label="Delete log entry" title="Delete log">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        `;

        li.querySelector('.log-delete-btn').addEventListener('click', () => {
          deleteLog(log.id);
        });

        elements.logList.appendChild(li);
      });
    }
  }

  // Theme Handling
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);

    if (elements.themeIcon) {
      if (theme === 'dark') {
        // Show sun icon
        elements.themeIcon.innerHTML = `
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
      } else {
        // Show moon icon
        elements.themeIcon.innerHTML = `
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
      }
    }
    saveState();
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Preset buttons
    elements.presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseInt(btn.dataset.amount, 10);
        const desc = btn.querySelector('.preset-desc')?.textContent || 'Water';
        addWater(amount, desc);
      });
    });

    // Custom log form
    elements.customLogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = parseInt(elements.customAmountInput.value, 10);
      if (amount && amount > 0) {
        addWater(amount, 'Custom intake');
        elements.customAmountInput.value = '';
      }
    });

    // Undo / Subtract button
    elements.undoBtn.addEventListener('click', () => {
      subtractWater(250);
    });

    // Reset day button
    elements.resetDayBtn.addEventListener('click', () => {
      resetDay();
    });

    // Goal editing
    elements.editGoalBtn.addEventListener('click', () => {
      elements.goalInput.value = state.dailyGoal;
      elements.goalEditForm.classList.remove('hidden');
      elements.goalInput.focus();
    });

    elements.cancelGoalBtn.addEventListener('click', () => {
      elements.goalEditForm.classList.add('hidden');
    });

    elements.goalEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newGoal = parseInt(elements.goalInput.value, 10);
      if (newGoal >= 500 && newGoal <= 10000) {
        state.dailyGoal = newGoal;
        saveState();
        updateUI();
        elements.goalEditForm.classList.add('hidden');
        showToast(`Daily goal updated to ${newGoal} ml!`);
      }
    });

    // Theme toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Format today's date in header
  function initHeaderDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    elements.currentDateDisplay.textContent = new Date().toLocaleDateString(undefined, options);
  }

  // Initialize
  function init() {
    initHeaderDate();
    loadState();
    applyTheme(state.theme);
    setupEventListeners();
    updateUI();
  }

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
