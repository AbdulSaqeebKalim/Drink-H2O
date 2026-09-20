/**
 * Drink H2O - Daily Hydration Tracker
 * Realistic Dual-Wave Fluid Physics & Hydrodynamics:
 * 1. Dual-wave SVG horizontal continuous translation
 * 2. 1-second cubic-bezier smooth height transition
 * 3. Dynamic surface disturbance / splash rippling on new intake
 * 4. Perfect glassmorphism circular clipping with high-contrast text pill
 * 5. Water intake presets, streak tracking, browser reminders & interactive calendar
 */

(() => {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    GOAL: 'drink_h2o_goal',
    INTAKE: 'drink_h2o_intake',
    LOGS: 'drink_h2o_logs',
    LAST_DATE: 'drink_h2o_last_date',
    THEME: 'drink_h2o_theme',
    PROFILE: 'drink_h2o_user_profile',
    STREAK: 'drink_h2o_streak',
    LAST_COMPLETED_DATE: 'drink_h2o_last_completed_date',
    HISTORY: 'drink_h2o_history',
    REMINDERS_ENABLED: 'drink_h2o_reminders_enabled',
    REMINDER_INTERVAL: 'drink_h2o_reminder_interval'
  };

  // Default Profile Configuration
  const defaultProfile = {
    age: 26,
    gender: 'male',
    weight: 70,
    weightUnit: 'kg',
    heightCm: 175,
    heightFt: 5,
    heightIn: 9,
    heightUnit: 'cm',
    activity: 'moderate',
    steps: 7500,
    isOverridden: false,
    customGoal: 2500,
    calculatedGoal: 2500
  };

  // Application State
  let state = {
    dailyGoal: 2500,
    currentIntake: 0,
    logs: [],
    theme: 'light',
    profile: { ...defaultProfile },
    streak: 0,
    lastCompletedDate: null,
    celebratedToday: false,
    history: {},
    calendarViewDate: new Date(),
    selectedCalendarDate: null,
    remindersEnabled: false,
    reminderIntervalMinutes: 60
  };

  let reminderTimerId = null;
  let rippleTimeoutId = null;

  // DOM Elements
  const elements = {
    // Header & Theme
    currentDateDisplay: document.getElementById('currentDateDisplay'),
    streakBadge: document.getElementById('streakBadge'),
    streakCount: document.getElementById('streakCount'),
    quickStreakResetBtn: document.getElementById('quickStreakResetBtn'),
    profileModalBtn: document.getElementById('profileModalBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    pwaInstallBtn: document.getElementById('pwaInstallBtn'),
    confettiCanvas: document.getElementById('confettiCanvas'),

    // Goal & Circular Wave Tracker
    goalDisplay: document.getElementById('goalDisplay'),
    goalFormulaNote: document.getElementById('goalFormulaNote'),
    completionBadge: document.getElementById('completionBadge'),
    editGoalBtn: document.getElementById('editGoalBtn'),
    goalEditForm: document.getElementById('goalEditForm'),
    goalInput: document.getElementById('goalInput'),
    recalcFromProfileBtn: document.getElementById('recalcFromProfileBtn'),
    cancelGoalBtn: document.getElementById('cancelGoalBtn'),
    circularMeter: document.getElementById('circularMeter'),
    waveContainer: document.getElementById('waveContainer'),
    waterWaves: document.getElementById('waterWaves'),
    percentText: document.getElementById('percentText'),
    currentIntakeText: document.getElementById('currentIntakeText'),
    remainingText: document.getElementById('remainingText'),
    glassesCount: document.getElementById('glassesCount'),
    statusMessage: document.getElementById('statusMessage'),
    logCount: document.getElementById('logCount'),

    // Action Logging
    presetButtons: document.querySelectorAll('.btn-preset'),
    customLogForm: document.getElementById('customLogForm'),
    customAmountInput: document.getElementById('customAmountInput'),
    addCustomBtn: document.getElementById('addCustomBtn'),
    undoBtn: document.getElementById('undoBtn'),
    resetDayBtn: document.getElementById('resetDayBtn'),

    // Calendar
    calPrevMonthBtn: document.getElementById('calPrevMonthBtn'),
    calNextMonthBtn: document.getElementById('calNextMonthBtn'),
    calTodayBtn: document.getElementById('calTodayBtn'),
    calMonthYearLabel: document.getElementById('calMonthYearLabel'),
    calendarDaysGrid: document.getElementById('calendarDaysGrid'),
    calDetailDate: document.getElementById('calDetailDate'),
    calDetailStats: document.getElementById('calDetailStats'),
    calDetailBadge: document.getElementById('calDetailBadge'),

    // Log History
    logList: document.getElementById('logList'),
    emptyLogState: document.getElementById('emptyLogState'),
    totalLoggedBadge: document.getElementById('totalLoggedBadge'),
    toast: document.getElementById('toast'),

    // Congratulations Modal
    congratsModal: document.getElementById('congratsModal'),
    closeCongratsBtn: document.getElementById('closeCongratsBtn'),
    congratsStreakDisplay: document.getElementById('congratsStreakDisplay'),
    congratsIntakeText: document.getElementById('congratsIntakeText'),

    // Reset Streak Confirmation Modal
    resetStreakModal: document.getElementById('resetStreakModal'),
    modalCurrentStreakCount: document.getElementById('modalCurrentStreakCount'),
    cancelResetStreakBtn: document.getElementById('cancelResetStreakBtn'),
    confirmResetStreakBtn: document.getElementById('confirmResetStreakBtn'),

    // Profile & Settings Modal
    profileModal: document.getElementById('profileModal'),
    closeProfileModalBtn: document.getElementById('closeProfileModalBtn'),
    cancelProfileBtn: document.getElementById('cancelProfileBtn'),
    profileForm: document.getElementById('profileForm'),
    profileModalStreakCount: document.getElementById('profileModalStreakCount'),
    modalResetStreakBtn: document.getElementById('modalResetStreakBtn'),

    // Browser Reminders Controls
    reminderToggle: document.getElementById('reminderToggle'),
    reminderOptions: document.getElementById('reminderOptions'),
    reminderIntervalSelect: document.getElementById('reminderIntervalSelect'),
    testReminderBtn: document.getElementById('testReminderBtn'),
    reminderStatusText: document.getElementById('reminderStatusText'),
    reminderPermStatus: document.getElementById('reminderPermStatus'),

    // Profile Inputs & Calculation Previews
    previewGoalMl: document.getElementById('previewGoalMl'),
    previewGoalLiters: document.getElementById('previewGoalLiters'),
    previewGlasses: document.getElementById('previewGlasses'),
    profAge: document.getElementById('profAge'),
    profGender: document.getElementById('profGender'),
    profWeight: document.getElementById('profWeight'),
    unitKgBtn: document.getElementById('unitKgBtn'),
    unitLbsBtn: document.getElementById('unitLbsBtn'),
    profHeightCm: document.getElementById('profHeightCm'),
    profHeightFt: document.getElementById('profHeightFt'),
    profHeightIn: document.getElementById('profHeightIn'),
    heightCmWrapper: document.getElementById('heightCmWrapper'),
    heightFtWrapper: document.getElementById('heightFtWrapper'),
    unitCmBtn: document.getElementById('unitCmBtn'),
    unitFtBtn: document.getElementById('unitFtBtn'),
    profActivity: document.getElementById('profActivity'),
    profSteps: document.getElementById('profSteps'),
    overrideGoalCheck: document.getElementById('overrideGoalCheck'),
    customGoalFieldWrapper: document.getElementById('customGoalFieldWrapper'),
    customGoalInput: document.getElementById('customGoalInput')
  };

  // Web Audio Context & Synthesized Sound Feedback
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playWaterDropSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(1450, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.18);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  function playCelebrationSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);

        gain.gain.setValueAtTime(0.25, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.4);
      });
    } catch (e) {}
  }

  // Toast Notification Helper
  let toastTimeout;
  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 2500);
  }

  // Date Formatting Helpers (YYYY-MM-DD)
  function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getTodayDateString() {
    return getFormattedDate(new Date());
  }

  function getYesterdayDateString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getFormattedDate(d);
  }

  // Calculate Hydration Goal based on Profile Formula
  function calculateHydrationGoal(profile) {
    let weightInKg = parseFloat(profile.weight) || 70;
    if (profile.weightUnit === 'lbs') {
      weightInKg = weightInKg * 0.453592;
    }

    let goal = weightInKg * 35;

    if (profile.gender === 'male') {
      goal += 200;
    } else if (profile.gender === 'other') {
      goal += 100;
    }

    const age = parseInt(profile.age, 10) || 26;
    if (age < 30) {
      goal += 100;
    } else if (age > 55) {
      goal -= 100;
    }

    switch (profile.activity) {
      case 'sedentary':
        goal += 0;
        break;
      case 'light':
        goal += 300;
        break;
      case 'moderate':
        goal += 600;
        break;
      case 'very':
        goal += 950;
        break;
      default:
        goal += 500;
    }

    const steps = parseInt(profile.steps, 10) || 0;
    if (steps > 5000) {
      const extraSteps = steps - 5000;
      goal += Math.min(800, (extraSteps / 500) * 25);
    }

    goal = Math.max(1200, Math.min(5500, goal));
    return Math.round(goal / 50) * 50;
  }

  // ==========================================================================
  // Surface Disturbance & Ripple Animations
  // ==========================================================================
  function triggerWaterDisturbance() {
    if (!elements.circularMeter || !elements.waterWaves) return;

    elements.circularMeter.classList.remove('rippling');
    elements.waterWaves.classList.remove('rippling');

    // Force reflow
    void elements.circularMeter.offsetWidth;

    elements.circularMeter.classList.add('rippling');
    elements.waterWaves.classList.add('rippling');

    clearTimeout(rippleTimeoutId);
    rippleTimeoutId = setTimeout(() => {
      elements.circularMeter.classList.remove('rippling');
      elements.waterWaves.classList.remove('rippling');
    }, 1100);
  }

  function createRipple(event) {
    const button = event.currentTarget;
    if (!button) return;

    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple-circle');

    const existingRipple = button.querySelector('.ripple-circle');
    if (existingRipple) {
      existingRipple.remove();
    }

    button.appendChild(circle);
    setTimeout(() => {
      circle.remove();
    }, 600);
  }

  function setupRipples() {
    const buttons = document.querySelectorAll('.ripple-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', createRipple);
    });
  }

  // ==========================================================================
  // Lightweight Canvas Confetti Particle System
  // ==========================================================================
  let confettiParticles = [];
  let confettiAnimFrame = null;

  function launchConfetti() {
    const canvas = elements.confettiCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    confettiParticles = [];
    const colors = ['#0284c7', '#38bdf8', '#06b6d4', '#f97316', '#fbbf24', '#10b981', '#ec4899', '#8b5cf6'];
    const particleCount = 95;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      confettiParticles.push({
        x: width / 2,
        y: height / 2 - 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    if (confettiAnimFrame) {
      cancelAnimationFrame(confettiAnimFrame);
    }

    const startTime = performance.now();

    function renderConfetti(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      let activeParticles = 0;

      confettiParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // Gravity
        p.vx *= 0.985; // Drag
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        if (elapsed > 1800) {
          p.opacity = Math.max(0, p.opacity - 0.025);
        }

        if (p.opacity > 0 && p.y < height + 40) {
          activeParticles++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          const wobbleScale = Math.sin(p.wobble);

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, (-p.size / 2) * wobbleScale, p.size, p.size * wobbleScale);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      if (activeParticles > 0 && elapsed < 3500) {
        confettiAnimFrame = requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    confettiAnimFrame = requestAnimationFrame(renderConfetti);
  }

  // ==========================================================================
  // Browser Hydration Reminders
  // ==========================================================================
  function initReminderControls() {
    const isSupported = 'Notification' in window;
    if (!isSupported) {
      elements.reminderPermStatus.textContent = 'Not supported in browser';
      elements.reminderToggle.disabled = true;
      return;
    }

    const savedEnabled = localStorage.getItem(STORAGE_KEYS.REMINDERS_ENABLED) === 'true';
    const savedInterval = parseInt(localStorage.getItem(STORAGE_KEYS.REMINDER_INTERVAL), 10) || 60;

    state.remindersEnabled = savedEnabled;
    state.reminderIntervalMinutes = savedInterval;

    elements.reminderToggle.checked = savedEnabled;
    elements.reminderIntervalSelect.value = savedInterval;

    updateReminderUI();

    if (savedEnabled && Notification.permission === 'granted') {
      scheduleReminders();
    }
  }

  function updateReminderUI() {
    const isGranted = Notification.permission === 'granted';
    const isDenied = Notification.permission === 'denied';

    if (state.remindersEnabled && isGranted) {
      elements.reminderOptions.classList.remove('hidden');
      elements.reminderStatusText.textContent = `Active every ${state.reminderIntervalMinutes}m`;
      elements.reminderPermStatus.textContent = 'Active 🔔';
    } else if (state.remindersEnabled && !isGranted) {
      elements.reminderOptions.classList.remove('hidden');
      elements.reminderStatusText.textContent = 'Permission needed';
      elements.reminderPermStatus.textContent = isDenied ? 'Permission denied' : 'Awaiting prompt';
    } else {
      elements.reminderOptions.classList.add('hidden');
      elements.reminderStatusText.textContent = 'Get periodic browser alerts';
      elements.reminderPermStatus.textContent = isGranted ? 'Granted' : 'Inactive';
    }
  }

  async function handleReminderToggleChange() {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported by your browser.');
      elements.reminderToggle.checked = false;
      return;
    }

    if (elements.reminderToggle.checked) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          state.remindersEnabled = true;
          localStorage.setItem(STORAGE_KEYS.REMINDERS_ENABLED, 'true');
          scheduleReminders();
          updateReminderUI();
          showToast('Hydration reminders enabled! 🔔');
          sendBrowserNotification('Drink H2O Reminders On! 💧', 'We will gently remind you to drink water regularly.');
        } else {
          state.remindersEnabled = false;
          elements.reminderToggle.checked = false;
          localStorage.setItem(STORAGE_KEYS.REMINDERS_ENABLED, 'false');
          updateReminderUI();
          showToast('Notification permission was not granted.');
        }
      } else if (Notification.permission === 'granted') {
        state.remindersEnabled = true;
        localStorage.setItem(STORAGE_KEYS.REMINDERS_ENABLED, 'true');
        scheduleReminders();
        updateReminderUI();
        showToast('Hydration reminders activated! 🔔');
      } else {
        state.remindersEnabled = false;
        elements.reminderToggle.checked = false;
        localStorage.setItem(STORAGE_KEYS.REMINDERS_ENABLED, 'false');
        updateReminderUI();
        showToast('Notifications are blocked in browser settings.');
      }
    } else {
      state.remindersEnabled = false;
      localStorage.setItem(STORAGE_KEYS.REMINDERS_ENABLED, 'false');
      if (reminderTimerId) {
        clearInterval(reminderTimerId);
        reminderTimerId = null;
      }
      updateReminderUI();
      showToast('Hydration reminders turned off.');
    }
  }

  function scheduleReminders() {
    if (reminderTimerId) {
      clearInterval(reminderTimerId);
      reminderTimerId = null;
    }

    if (!state.remindersEnabled || Notification.permission !== 'granted') return;

    const intervalMs = state.reminderIntervalMinutes * 60 * 1000;
    reminderTimerId = setInterval(() => {
      const remaining = Math.max(0, state.dailyGoal - state.currentIntake);
      if (remaining > 0) {
        sendBrowserNotification(
          'Time to Hydrate! 💧',
          `Stay refreshed! You have ${remaining} ml left to reach today's goal.`
        );
      }
    }, intervalMs);
  }

  function sendBrowserNotification(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
      new Notification(title, {
        body: body,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230284c7"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>'
      });
    } catch (e) {}
  }

  function triggerTestReminder() {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported in this environment.');
      return;
    }

    if (Notification.permission === 'granted') {
      sendBrowserNotification('Drink H2O Test Reminder 💧', 'Hydration reminders are working great!');
      showToast('Test notification dispatched! Check your desktop/banner.');
    } else {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          sendBrowserNotification('Drink H2O Test Reminder 💧', 'Hydration alerts are active!');
          showToast('Test notification dispatched!');
          state.remindersEnabled = true;
          elements.reminderToggle.checked = true;
          localStorage.setItem(STORAGE_KEYS.REMINDERS_ENABLED, 'true');
          scheduleReminders();
          updateReminderUI();
        } else {
          showToast('Please enable notifications in your browser.');
        }
      });
    }
  }

  // ==========================================================================
  // Daily Rollover & State Synchronization
  // ==========================================================================
  function checkAndHandleDateRollover() {
    const today = getTodayDateString();
    const storedDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);
    const yesterday = getYesterdayDateString();

    if (!storedDate) {
      localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
      return;
    }

    if (storedDate !== today) {
      if (storedDate && !state.history[storedDate] && state.currentIntake > 0) {
        state.history[storedDate] = {
          intake: state.currentIntake,
          goal: state.dailyGoal,
          completed: state.currentIntake >= state.dailyGoal
        };
      }

      const lastCompleted = localStorage.getItem(STORAGE_KEYS.LAST_COMPLETED_DATE);
      const yesterdayRecord = state.history[yesterday];
      const reachedYesterday = (lastCompleted === yesterday) || (yesterdayRecord && yesterdayRecord.completed);

      if (!reachedYesterday) {
        state.streak = 0;
        localStorage.setItem(STORAGE_KEYS.STREAK, '0');
      }

      state.currentIntake = 0;
      state.logs = [];
      state.celebratedToday = false;

      localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
      localStorage.setItem(STORAGE_KEYS.INTAKE, '0');
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));

      saveState();
      updateUI();
      renderCalendar();
      showToast('A new day has started! Intake reset to 0 ml 💧');
    }
  }

  function syncTodayHistory() {
    const today = getTodayDateString();
    state.history[today] = {
      intake: state.currentIntake,
      goal: state.dailyGoal,
      completed: state.currentIntake >= state.dailyGoal
    };
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
  }

  function loadState() {
    const today = getTodayDateString();
    const storedDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);

    // Profile
    const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (savedProfile) {
      try {
        state.profile = { ...defaultProfile, ...JSON.parse(savedProfile) };
      } catch (e) {
        state.profile = { ...defaultProfile };
      }
    } else {
      state.profile = { ...defaultProfile };
    }
    state.profile.calculatedGoal = calculateHydrationGoal(state.profile);

    // Goal
    const savedGoal = localStorage.getItem(STORAGE_KEYS.GOAL);
    if (savedGoal && !isNaN(parseInt(savedGoal, 10))) {
      state.dailyGoal = parseInt(savedGoal, 10);
    } else {
      state.dailyGoal = state.profile.isOverridden && state.profile.customGoal
        ? state.profile.customGoal
        : state.profile.calculatedGoal;
    }

    // Theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) {
      state.theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      state.theme = 'dark';
    }

    // History
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistory) {
      try {
        state.history = JSON.parse(savedHistory) || {};
      } catch (e) {
        state.history = {};
      }
    } else {
      state.history = {};
    }

    // Streak
    const savedStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK), 10) || 0;
    const lastCompleted = localStorage.getItem(STORAGE_KEYS.LAST_COMPLETED_DATE);
    state.streak = savedStreak;
    state.lastCompletedDate = lastCompleted;

    if (storedDate && storedDate !== today) {
      checkAndHandleDateRollover();
    } else {
      const savedIntake = localStorage.getItem(STORAGE_KEYS.INTAKE);
      state.currentIntake = savedIntake ? parseInt(savedIntake, 10) || 0 : 0;

      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      try {
        const parsed = savedLogs ? JSON.parse(savedLogs) : [];
        state.logs = Array.isArray(parsed)
          ? parsed.map(item => ({
              id: item.id || Date.now(),
              amount: typeof item.amount === 'number' ? item.amount : parseInt(item.amount, 10) || 0,
              time: item.time || ''
            }))
          : [];
      } catch (e) {
        state.logs = [];
      }

      if (lastCompleted === today) {
        state.celebratedToday = true;
      }
    }

    localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
    syncTodayHistory();
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEYS.GOAL, state.dailyGoal.toString());
    localStorage.setItem(STORAGE_KEYS.INTAKE, state.currentIntake.toString());
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
    localStorage.setItem(STORAGE_KEYS.LAST_DATE, getTodayDateString());
    localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
    localStorage.setItem(STORAGE_KEYS.STREAK, state.streak.toString());
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
    if (state.lastCompletedDate) {
      localStorage.setItem(STORAGE_KEYS.LAST_COMPLETED_DATE, state.lastCompletedDate);
    } else {
      localStorage.removeItem(STORAGE_KEYS.LAST_COMPLETED_DATE);
    }
  }

  function checkGoalMilestone() {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    syncTodayHistory();
    renderCalendar();

    if (state.currentIntake >= state.dailyGoal) {
      if (state.lastCompletedDate !== today) {
        if (state.lastCompletedDate === yesterday) {
          state.streak += 1;
        } else {
          state.streak = 1;
        }
        state.lastCompletedDate = today;
        saveState();
      }

      if (!state.celebratedToday) {
        state.celebratedToday = true;
        showCongratsModal();
      }
    }
  }

  function showCongratsModal() {
    elements.congratsStreakDisplay.textContent = `${state.streak} ${state.streak === 1 ? 'Day' : 'Days'}`;
    elements.congratsIntakeText.textContent = `${state.currentIntake} ml`;

    playCelebrationSound();
    elements.congratsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    launchConfetti();
  }

  function closeCongratsModal() {
    elements.congratsModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ==========================================================================
  // Manual Streak Reset
  // ==========================================================================
  function promptResetStreak() {
    elements.modalCurrentStreakCount.textContent = state.streak;
    elements.resetStreakModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeResetStreakModal() {
    elements.resetStreakModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function executeStreakReset() {
    state.streak = 0;
    state.lastCompletedDate = null;
    localStorage.setItem(STORAGE_KEYS.STREAK, '0');
    localStorage.removeItem(STORAGE_KEYS.LAST_COMPLETED_DATE);

    closeResetStreakModal();
    updateUI();
    renderCalendar();
    showToast('Streak reset back to 0 days.');
  }

  // ==========================================================================
  // Water Logging & Fluid Hydrodynamics
  // ==========================================================================
  function addWater(amount) {
    if (amount <= 0) return;

    state.currentIntake += amount;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    state.logs.unshift({
      id: Date.now(),
      amount: amount,
      time: timeStr
    });

    syncTodayHistory();
    saveState();
    updateUI();
    triggerWaterDisturbance(); // Wave crest disturbance & liquid container bounce
    playWaterDropSound();
    showToast(`+${amount} ml water logged! 💧`);

    checkGoalMilestone();
  }

  function undoLastLog() {
    if (state.logs.length === 0) {
      if (state.currentIntake > 0) {
        state.currentIntake = Math.max(0, state.currentIntake - 250);
        syncTodayHistory();
        saveState();
        updateUI();
        triggerWaterDisturbance();
        renderCalendar();
        showToast('Subtracted 250 ml.');
      } else {
        showToast('No logs to undo.');
      }
      return;
    }

    const removed = state.logs.shift();
    state.currentIntake = Math.max(0, state.currentIntake - removed.amount);
    syncTodayHistory();
    saveState();
    updateUI();
    triggerWaterDisturbance();
    renderCalendar();
    showToast(`Undid +${removed.amount} ml water`);
  }

  function deleteLog(id) {
    const index = state.logs.findIndex(item => item.id === id);
    if (index !== -1) {
      const removed = state.logs.splice(index, 1)[0];
      state.currentIntake = Math.max(0, state.currentIntake - removed.amount);
      syncTodayHistory();
      saveState();
      updateUI();
      triggerWaterDisturbance();
      renderCalendar();
      showToast(`Deleted ${removed.amount} ml entry.`);
    }
  }

  function resetDay() {
    if (state.currentIntake === 0 && state.logs.length === 0) {
      showToast("Today's progress is already empty.");
      return;
    }

    const confirmReset = confirm("Reset today's water intake back to 0 ml?");
    if (confirmReset) {
      state.currentIntake = 0;
      state.logs = [];
      state.celebratedToday = false;
      syncTodayHistory();
      saveState();
      updateUI();
      triggerWaterDisturbance();
      renderCalendar();
      showToast("Today's intake reset to 0 ml.");
    }
  }

  // ==========================================================================
  // Calendar Rendering
  // ==========================================================================
  function renderCalendar() {
    const viewYear = state.calendarViewDate.getFullYear();
    const viewMonth = state.calendarViewDate.getMonth();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    elements.calMonthYearLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`;

    elements.calendarDaysGrid.innerHTML = '';

    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const todayStr = getTodayDateString();

    // 1. Previous month padding
    for (let x = firstDayIndex; x > 0; x--) {
      const dayNum = prevMonthDays - x + 1;
      const prevDate = new Date(viewYear, viewMonth - 1, dayNum);
      const dateStr = getFormattedDate(prevDate);
      const cell = createCalendarCell(dayNum, dateStr, true);
      elements.calendarDaysGrid.appendChild(cell);
    }

    // 2. Current month
    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(viewYear, viewMonth, day);
      const dateStr = getFormattedDate(thisDate);
      const cell = createCalendarCell(day, dateStr, false);
      elements.calendarDaysGrid.appendChild(cell);
    }

    // 3. Next month padding
    const totalCells = firstDayIndex + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(viewYear, viewMonth + 1, i);
      const dateStr = getFormattedDate(nextDate);
      const cell = createCalendarCell(i, dateStr, true);
      elements.calendarDaysGrid.appendChild(cell);
    }

    updateCalendarInspector(state.selectedCalendarDate || todayStr);
  }

  function createCalendarCell(dayNum, dateStr, isOtherMonth) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cal-day';
    cell.setAttribute('data-date', dateStr);
    cell.setAttribute('aria-label', `Date ${dateStr}`);

    if (isOtherMonth) {
      cell.classList.add('other-month');
    }

    const todayStr = getTodayDateString();
    const isToday = dateStr === todayStr;
    if (isToday) {
      cell.classList.add('today');
    }

    if (state.selectedCalendarDate === dateStr) {
      cell.classList.add('selected');
    }

    const dayData = (dateStr === todayStr)
      ? { intake: state.currentIntake, goal: state.dailyGoal, completed: state.currentIntake >= state.dailyGoal }
      : state.history[dateStr];

    let iconHtml = '';
    let subtext = '';

    if (dayData && dayData.intake > 0) {
      if (dayData.completed) {
        cell.classList.add('completed');
        iconHtml = '<span class="cal-day-fire" title="Goal Met! 🔥">🔥</span>';
        subtext = '<span class="cal-day-sub">100%</span>';
      } else {
        cell.classList.add('partial');
        iconHtml = '<span class="cal-day-drop" title="In Progress 💧">💧</span>';
        const percent = Math.round((dayData.intake / dayData.goal) * 100);
        subtext = `<span class="cal-day-sub">${percent}%</span>`;
      }
    } else {
      cell.classList.add('empty');
    }

    cell.innerHTML = `
      <span class="cal-day-num">${dayNum}</span>
      <div class="cal-day-badge">${iconHtml}</div>
      ${subtext}
    `;

    cell.addEventListener('click', () => {
      state.selectedCalendarDate = dateStr;
      document.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
      cell.classList.add('selected');
      updateCalendarInspector(dateStr);
    });

    return cell;
  }

  function updateCalendarInspector(dateStr) {
    if (!dateStr) return;

    const todayStr = getTodayDateString();
    const isToday = dateStr === todayStr;
    const parts = dateStr.split('-');
    const displayDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const formattedDate = displayDate.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    elements.calDetailDate.textContent = isToday ? `Today (${formattedDate})` : formattedDate;

    const dayData = (dateStr === todayStr)
      ? { intake: state.currentIntake, goal: state.dailyGoal, completed: state.currentIntake >= state.dailyGoal }
      : state.history[dateStr];

    if (dayData && dayData.intake > 0) {
      elements.calDetailStats.textContent = `${dayData.intake} ml logged / ${dayData.goal} ml target`;
      if (dayData.completed) {
        elements.calDetailBadge.textContent = 'Goal Reached 🔥';
        elements.calDetailBadge.className = 'badge success';
      } else {
        const percent = Math.round((dayData.intake / dayData.goal) * 100);
        elements.calDetailBadge.textContent = `${percent}% Completed`;
        elements.calDetailBadge.className = 'badge';
      }
    } else {
      elements.calDetailStats.textContent = isToday ? '0 ml logged today' : 'No water logged for this day';
      elements.calDetailBadge.textContent = isToday ? 'In Progress' : 'No Data';
      elements.calDetailBadge.className = 'badge';
    }
  }

  // ==========================================================================
  // Update UI Elements with Fluid Waves & 1s Cubic-Bezier Transition
  // ==========================================================================
  function updateUI() {
    const goal = state.dailyGoal;
    const intake = state.currentIntake;
    const percent = goal > 0 ? Math.round((intake / goal) * 100) : 0;
    const remaining = Math.max(0, goal - intake);
    const glasses = (intake / 250).toFixed(1);

    // Goal Display
    elements.goalDisplay.textContent = `${goal} ml`;
    if (state.profile.isOverridden) {
      elements.goalFormulaNote.textContent = 'Custom manual goal override';
    } else {
      elements.goalFormulaNote.textContent = 'Personalized target based on profile';
    }
    elements.completionBadge.textContent = `${percent}%`;

    // Streak UI
    elements.streakCount.textContent = state.streak;
    elements.profileModalStreakCount.textContent = `${state.streak} ${state.streak === 1 ? 'Day' : 'Days'} Consecutive`;

    if (state.streak > 0) {
      elements.streakBadge.classList.add('active-streak');
      elements.streakBadge.setAttribute('title', `${state.streak} consecutive days goal reached!`);
    } else {
      elements.streakBadge.classList.remove('active-streak');
      elements.streakBadge.setAttribute('title', "Complete today's goal to build your streak!");
    }

    // Dynamic Central Readouts
    elements.percentText.textContent = `${percent}%`;
    elements.currentIntakeText.textContent = `${intake} ml`;
    elements.remainingText.textContent = remaining > 0 ? `${remaining} ml left` : 'Goal achieved! 🎉';

    // Realistic Wave Hydrodynamics: 0-100% height clamp
    const targetHeight = Math.min(100, Math.max(0, percent));
    elements.waveContainer.style.height = `${targetHeight}%`;

    if (targetHeight <= 0) {
      elements.waveContainer.classList.add('is-empty');
    } else {
      elements.waveContainer.classList.remove('is-empty');
    }

    if (percent >= 100) {
      elements.circularMeter.classList.add('goal-achieved');
    } else {
      elements.circularMeter.classList.remove('goal-achieved');
    }

    // Stats Row
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

    elements.totalLoggedBadge.textContent = `${intake} ml Total`;
    renderLogs();
  }

  // Render Log History Items with Clean Water Formatting & Individual Delete Buttons
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
            <div class="log-amount">+${log.amount} ml</div>
            <div class="log-time">${log.time}</div>
          </div>
          <div class="log-item-actions">
            <button class="log-delete-btn ripple-btn" data-id="${log.id}" aria-label="Delete entry of ${log.amount} ml" title="Delete entry">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        `;

        const deleteBtn = li.querySelector('.log-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          li.classList.add('deleting');
          setTimeout(() => {
            deleteLog(log.id);
          }, 200);
        });

        elements.logList.appendChild(li);
      });
    }
  }

  // ==========================================================================
  // Profile Modal & Live Calculations
  // ==========================================================================
  function openProfileModal() {
    const prof = state.profile;
    elements.profAge.value = prof.age || 26;
    elements.profGender.value = prof.gender || 'male';
    elements.profWeight.value = prof.weight || 70;
    elements.profActivity.value = prof.activity || 'moderate';
    elements.profSteps.value = prof.steps || 7500;

    setWeightUnit(prof.weightUnit || 'kg');

    elements.profHeightCm.value = prof.heightCm || 175;
    elements.profHeightFt.value = prof.heightFt || 5;
    elements.profHeightIn.value = prof.heightIn || 9;
    setHeightUnit(prof.heightUnit || 'cm');

    elements.overrideGoalCheck.checked = Boolean(prof.isOverridden);
    elements.customGoalInput.value = prof.customGoal || state.dailyGoal;
    toggleCustomGoalVisibility(prof.isOverridden);

    updateProfilePreview();
    updateReminderUI();

    elements.profileModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeProfileModal() {
    elements.profileModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function setWeightUnit(unit) {
    state.profile.weightUnit = unit;
    if (unit === 'kg') {
      elements.unitKgBtn.classList.add('active');
      elements.unitLbsBtn.classList.remove('active');
    } else {
      elements.unitLbsBtn.classList.add('active');
      elements.unitKgBtn.classList.remove('active');
    }
    updateProfilePreview();
  }

  function setHeightUnit(unit) {
    state.profile.heightUnit = unit;
    if (unit === 'cm') {
      elements.unitCmBtn.classList.add('active');
      elements.unitFtBtn.classList.remove('active');
      elements.heightCmWrapper.classList.remove('hidden');
      elements.heightFtWrapper.classList.add('hidden');
    } else {
      elements.unitFtBtn.classList.add('active');
      elements.unitCmBtn.classList.remove('active');
      elements.heightCmWrapper.classList.add('hidden');
      elements.heightFtWrapper.classList.remove('hidden');
    }
    updateProfilePreview();
  }

  function toggleCustomGoalVisibility(isCustom) {
    if (isCustom) {
      elements.customGoalFieldWrapper.classList.remove('hidden');
    } else {
      elements.customGoalFieldWrapper.classList.add('hidden');
    }
  }

  function getCurrentFormProfile() {
    return {
      age: parseInt(elements.profAge.value, 10) || 26,
      gender: elements.profGender.value,
      weight: parseFloat(elements.profWeight.value) || 70,
      weightUnit: elements.unitLbsBtn.classList.contains('active') ? 'lbs' : 'kg',
      heightCm: parseInt(elements.profHeightCm.value, 10) || 175,
      heightFt: parseInt(elements.profHeightFt.value, 10) || 5,
      heightIn: parseInt(elements.profHeightIn.value, 10) || 9,
      heightUnit: elements.unitFtBtn.classList.contains('active') ? 'ft' : 'cm',
      activity: elements.profActivity.value,
      steps: parseInt(elements.profSteps.value, 10) || 7500,
      isOverridden: elements.overrideGoalCheck.checked,
      customGoal: parseInt(elements.customGoalInput.value, 10) || 2500
    };
  }

  function updateProfilePreview() {
    const tempProfile = getCurrentFormProfile();
    const calculated = calculateHydrationGoal(tempProfile);

    let displayGoal = calculated;
    if (tempProfile.isOverridden && tempProfile.customGoal >= 500) {
      displayGoal = tempProfile.customGoal;
    }

    elements.previewGoalMl.textContent = displayGoal;
    elements.previewGoalLiters.textContent = `(${(displayGoal / 1000).toFixed(2)} L)`;
    const glasses = (displayGoal / 250).toFixed(0);
    elements.previewGlasses.textContent = `≈ ${glasses} glasses (250ml each)`;
  }

  function handleProfileSubmit(e) {
    e.preventDefault();
    const updated = getCurrentFormProfile();
    const calculated = calculateHydrationGoal(updated);

    updated.calculatedGoal = calculated;
    state.profile = updated;

    if (updated.isOverridden && updated.customGoal >= 500) {
      state.dailyGoal = updated.customGoal;
    } else {
      state.dailyGoal = calculated;
    }

    syncTodayHistory();
    saveState();
    updateUI();
    renderCalendar();
    closeProfileModal();
    showToast(`Hydration target updated to ${state.dailyGoal} ml! 💧`);

    checkGoalMilestone();
  }

  // ==========================================================================
  // Theme Handling (Light / Dark)
  // ==========================================================================
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);

    if (elements.themeIcon) {
      if (theme === 'dark') {
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
        elements.themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
      } else {
        elements.themeIcon.innerHTML = `
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
        elements.themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
      }
    }
    saveState();
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // ==========================================================================
  // Event Listeners Setup
  // ==========================================================================
  function setupEventListeners() {
    // Preset Water Buttons
    elements.presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseInt(btn.dataset.amount, 10);
        addWater(amount);
      });
    });

    // Custom Log Form Submission
    elements.customLogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = parseInt(elements.customAmountInput.value, 10);
      if (amount && amount > 0) {
        addWater(amount);
        elements.customAmountInput.value = '';
      }
    });

    // Undo & Reset Day
    elements.undoBtn.addEventListener('click', undoLastLog);
    elements.resetDayBtn.addEventListener('click', resetDay);

    // Streak Reset Prompts
    elements.quickStreakResetBtn.addEventListener('click', promptResetStreak);
    elements.streakBadge.addEventListener('click', promptResetStreak);
    elements.modalResetStreakBtn.addEventListener('click', promptResetStreak);

    elements.cancelResetStreakBtn.addEventListener('click', closeResetStreakModal);
    elements.confirmResetStreakBtn.addEventListener('click', executeStreakReset);
    elements.resetStreakModal.addEventListener('click', (e) => {
      if (e.target === elements.resetStreakModal) closeResetStreakModal();
    });

    // Calendar Navigation
    elements.calPrevMonthBtn.addEventListener('click', () => {
      state.calendarViewDate.setMonth(state.calendarViewDate.getMonth() - 1);
      renderCalendar();
    });

    elements.calNextMonthBtn.addEventListener('click', () => {
      state.calendarViewDate.setMonth(state.calendarViewDate.getMonth() + 1);
      renderCalendar();
    });

    elements.calTodayBtn.addEventListener('click', () => {
      state.calendarViewDate = new Date();
      state.selectedCalendarDate = getTodayDateString();
      renderCalendar();
    });

    // Inline Goal Editing
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
      if (newGoal >= 500 && newGoal <= 8000) {
        state.dailyGoal = newGoal;
        state.profile.isOverridden = true;
        state.profile.customGoal = newGoal;
        syncTodayHistory();
        saveState();
        updateUI();
        renderCalendar();
        elements.goalEditForm.classList.add('hidden');
        showToast(`Target set to ${newGoal} ml!`);
        checkGoalMilestone();
      }
    });

    elements.recalcFromProfileBtn.addEventListener('click', () => {
      const calculated = calculateHydrationGoal(state.profile);
      state.dailyGoal = calculated;
      state.profile.isOverridden = false;
      state.profile.calculatedGoal = calculated;
      syncTodayHistory();
      saveState();
      updateUI();
      renderCalendar();
      elements.goalEditForm.classList.add('hidden');
      showToast(`Target reset to profile recommendation (${calculated} ml)! 💧`);
      checkGoalMilestone();
    });

    // Congratulations Modal
    elements.closeCongratsBtn.addEventListener('click', closeCongratsModal);
    elements.congratsModal.addEventListener('click', (e) => {
      if (e.target === elements.congratsModal) closeCongratsModal();
    });

    // Profile Modal
    elements.profileModalBtn.addEventListener('click', openProfileModal);
    elements.closeProfileModalBtn.addEventListener('click', closeProfileModal);
    elements.cancelProfileBtn.addEventListener('click', closeProfileModal);
    elements.profileModal.addEventListener('click', (e) => {
      if (e.target === elements.profileModal) closeProfileModal();
    });

    // Browser Reminders Events
    elements.reminderToggle.addEventListener('change', handleReminderToggleChange);
    elements.reminderIntervalSelect.addEventListener('change', (e) => {
      const interval = parseInt(e.target.value, 10) || 60;
      state.reminderIntervalMinutes = interval;
      localStorage.setItem(STORAGE_KEYS.REMINDER_INTERVAL, interval.toString());
      if (state.remindersEnabled) {
        scheduleReminders();
        updateReminderUI();
        showToast(`Reminder interval set to ${interval} mins.`);
      }
    });
    elements.testReminderBtn.addEventListener('click', triggerTestReminder);

    // Escape Key Handler for Modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!elements.congratsModal.classList.contains('hidden')) {
          closeCongratsModal();
        } else if (!elements.profileModal.classList.contains('hidden')) {
          closeProfileModal();
        } else if (!elements.resetStreakModal.classList.contains('hidden')) {
          closeResetStreakModal();
        }
      }
    });

    // Unit Toggles
    elements.unitKgBtn.addEventListener('click', () => setWeightUnit('kg'));
    elements.unitLbsBtn.addEventListener('click', () => setWeightUnit('lbs'));
    elements.unitCmBtn.addEventListener('click', () => setHeightUnit('cm'));
    elements.unitFtBtn.addEventListener('click', () => setHeightUnit('ft'));

    // Override Checkbox
    elements.overrideGoalCheck.addEventListener('change', (e) => {
      toggleCustomGoalVisibility(e.target.checked);
      updateProfilePreview();
    });

    // Modal Live Preview Inputs
    const liveInputs = [
      elements.profAge,
      elements.profGender,
      elements.profWeight,
      elements.profHeightCm,
      elements.profHeightFt,
      elements.profHeightIn,
      elements.profActivity,
      elements.profSteps,
      elements.customGoalInput
    ];

    liveInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', updateProfilePreview);
        input.addEventListener('change', updateProfilePreview);
      }
    });

    elements.profileForm.addEventListener('submit', handleProfileSubmit);

    // Theme Toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // PWA BeforeInstallPrompt (Native Android & Desktop Install Flow)
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (elements.pwaInstallBtn) {
        elements.pwaInstallBtn.classList.remove('hidden');
      }
    });

    if (elements.pwaInstallBtn) {
      elements.pwaInstallBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        try {
          const choiceResult = await deferredPrompt.userChoice;
          if (choiceResult && choiceResult.outcome === 'accepted') {
            showToast('Installing Drink H2O... 💧');
          }
        } catch (err) {
          console.warn('Install prompt error:', err);
        }
        deferredPrompt = null;
        elements.pwaInstallBtn.classList.add('hidden');
      });
    }

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (elements.pwaInstallBtn) {
        elements.pwaInstallBtn.classList.add('hidden');
      }
      showToast('Drink H2O is installed and ready for offline use! 📱');
    });

    // Offline / Online Connection State Listeners
    window.addEventListener('offline', () => {
      showToast('Offline mode active — your logs and streaks are saved locally! 💧');
    });

    window.addEventListener('online', () => {
      showToast('Connection restored! 💧');
    });

    // Window Events for Date Rollover
    window.addEventListener('focus', checkAndHandleDateRollover);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkAndHandleDateRollover();
      }
    });

    setInterval(checkAndHandleDateRollover, 60000);

    // Setup active ripples on all clickable action buttons
    setupRipples();
  }

  function initHeaderDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    elements.currentDateDisplay.textContent = new Date().toLocaleDateString(undefined, options);
  }

  // Progressive Web App Service Worker Registration
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./sw.js')
          .then((registration) => {
            console.log('[Drink H2O] Service Worker active:', registration.scope);
          })
          .catch((err) => {
            console.warn('[Drink H2O] Service Worker registration failed:', err);
          });
      });
    }
  }

  // App Initialization
  function init() {
    initHeaderDate();
    loadState();
    applyTheme(state.theme);
    initReminderControls();
    setupEventListeners();
    updateUI();
    renderCalendar();
    registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
