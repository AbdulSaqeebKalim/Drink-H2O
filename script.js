/**
 * Drink H2O - Daily Hydration Tracker with Dynamic Profile Calculator
 * Handles state, profile calculations, unit conversions, sound synthesis, and UI reactivity.
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
    PROFILE: 'drink_h2o_user_profile'
  };

  // Default Profile Configuration
  const defaultProfile = {
    age: 26,
    gender: 'male', // 'male', 'female', 'other'
    weight: 70,
    weightUnit: 'kg', // 'kg' or 'lbs'
    heightCm: 175,
    heightFt: 5,
    heightIn: 9,
    heightUnit: 'cm', // 'cm' or 'ft'
    activity: 'moderate', // 'sedentary', 'light', 'moderate', 'very'
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
    profile: { ...defaultProfile }
  };

  // DOM Elements
  const elements = {
    currentDateDisplay: document.getElementById('currentDateDisplay'),
    goalDisplay: document.getElementById('goalDisplay'),
    goalFormulaNote: document.getElementById('goalFormulaNote'),
    completionBadge: document.getElementById('completionBadge'),
    editGoalBtn: document.getElementById('editGoalBtn'),
    goalEditForm: document.getElementById('goalEditForm'),
    goalInput: document.getElementById('goalInput'),
    recalcFromProfileBtn: document.getElementById('recalcFromProfileBtn'),
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
    presetButtons: document.querySelectorAll('.btn-preset'),

    // Profile Modal Elements
    profileModalBtn: document.getElementById('profileModalBtn'),
    profileModal: document.getElementById('profileModal'),
    closeProfileModalBtn: document.getElementById('closeProfileModalBtn'),
    cancelProfileBtn: document.getElementById('cancelProfileBtn'),
    profileForm: document.getElementById('profileForm'),

    // Profile Inputs & Previews
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

  // Sound Synthesizer via Web Audio API (Zero external assets required)
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

      // Realistic droplet pitch sweep: rise rapidly then decay
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
      // Audio context might be restricted before first user interaction
    }
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
    }, 2400);
  }

  // Today string: YYYY-MM-DD
  function getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ==========================================================================
  // Dynamic Hydration Goal Calculation Logic
  // Formula:
  // - Base Intake = Weight in kg * 35 ml
  // - Biological Sex adjustment (+200ml for male metabolic baseline)
  // - Age adjustment (<30 +100ml, >55 -100ml)
  // - Activity factor (Sedentary: 0ml, Light: +300ml, Moderate: +600ml, Very: +950ml)
  // - Step bonus: for steps over 5,000, +25ml per 500 steps
  // ==========================================================================
  function calculateHydrationGoal(profile) {
    // 1. Convert weight to kg if entered in lbs
    let weightInKg = parseFloat(profile.weight) || 70;
    if (profile.weightUnit === 'lbs') {
      weightInKg = weightInKg * 0.453592;
    }

    // 2. Base weight intake (35 ml per kg)
    let goal = weightInKg * 35;

    // 3. Gender baseline factor
    if (profile.gender === 'male') {
      goal += 200;
    } else if (profile.gender === 'other') {
      goal += 100;
    }

    // 4. Age factor
    const age = parseInt(profile.age, 10) || 26;
    if (age < 30) {
      goal += 100;
    } else if (age > 55) {
      goal -= 100;
    }

    // 5. Activity level bonus
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

    // 6. Step count bonus (above sedentary baseline of 5,000 steps)
    const steps = parseInt(profile.steps, 10) || 0;
    if (steps > 5000) {
      const extraSteps = steps - 5000;
      goal += Math.min(800, (extraSteps / 500) * 25);
    }

    // 7. Clamp to healthy recommended bounds and round to nearest 50ml
    goal = Math.max(1200, Math.min(5500, goal));
    return Math.round(goal / 50) * 50;
  }

  // Load state from localStorage
  function loadState() {
    const today = getTodayDateString();
    const storedDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);

    // Load Profile
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

    // Recalculate recommendation
    state.profile.calculatedGoal = calculateHydrationGoal(state.profile);

    // Stored goal resolution
    const savedGoal = localStorage.getItem(STORAGE_KEYS.GOAL);
    if (savedGoal && !isNaN(parseInt(savedGoal, 10))) {
      state.dailyGoal = parseInt(savedGoal, 10);
    } else {
      state.dailyGoal = state.profile.isOverridden && state.profile.customGoal
        ? state.profile.customGoal
        : state.profile.calculatedGoal;
    }

    // Stored theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) {
      state.theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      state.theme = 'dark';
    }

    // Date Rollover Check
    if (storedDate !== today) {
      state.currentIntake = 0;
      state.logs = [];
      localStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
      saveState();
    } else {
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
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
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

  // Subtract water (undo last intake)
  function subtractWater(amount = 250) {
    if (state.currentIntake <= 0) {
      showToast('Intake is already 0 ml.');
      return;
    }

    const actualReduction = Math.min(state.currentIntake, amount);
    state.currentIntake -= actualReduction;

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

  // Update UI Elements
  function updateUI() {
    const goal = state.dailyGoal;
    const intake = state.currentIntake;
    const percent = goal > 0 ? Math.round((intake / goal) * 100) : 0;
    const remaining = Math.max(0, goal - intake);
    const glasses = (intake / 250).toFixed(1);

    // Goal Display & Note
    elements.goalDisplay.textContent = `${goal} ml`;
    if (state.profile.isOverridden) {
      elements.goalFormulaNote.textContent = 'Custom manual goal override';
    } else {
      elements.goalFormulaNote.textContent = 'Personalized target based on your profile';
    }
    elements.completionBadge.textContent = `${percent}%`;

    // Meter & Waves
    elements.percentText.textContent = `${percent}%`;
    elements.currentIntakeText.textContent = `${intake} ml`;
    elements.remainingText.textContent = remaining > 0 ? `${remaining} ml left` : 'Goal reached! 🎉';

    // Wave height clamped between 0 and 100%
    const waveHeight = Math.min(100, Math.max(0, percent));
    elements.waveContainer.style.height = `${waveHeight}%`;

    // Stats row
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

  // ==========================================================================
  // Profile Modal & Live Calculation Handling
  // ==========================================================================
  function openProfileModal() {
    // Populate form with current state
    const prof = state.profile;
    elements.profAge.value = prof.age || 26;
    elements.profGender.value = prof.gender || 'male';
    elements.profWeight.value = prof.weight || 70;
    elements.profActivity.value = prof.activity || 'moderate';
    elements.profSteps.value = prof.steps || 7500;

    // Weight Unit
    setWeightUnit(prof.weightUnit || 'kg');

    // Height Unit
    elements.profHeightCm.value = prof.heightCm || 175;
    elements.profHeightFt.value = prof.heightFt || 5;
    elements.profHeightIn.value = prof.heightIn || 9;
    setHeightUnit(prof.heightUnit || 'cm');

    // Override State
    elements.overrideGoalCheck.checked = Boolean(prof.isOverridden);
    elements.customGoalInput.value = prof.customGoal || state.dailyGoal;
    toggleCustomGoalVisibility(prof.isOverridden);

    // Update real-time preview
    updateProfilePreview();

    // Show modal
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

  // Update real-time modal preview values
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

  // Apply and save profile changes
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

    saveState();
    updateUI();
    closeProfileModal();
    showToast(`Hydration goal updated to ${state.dailyGoal} ml! 💧`);
  }

  // Theme Handling
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
      } else {
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
    // Presets
    elements.presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseInt(btn.dataset.amount, 10);
        const desc = btn.querySelector('.preset-desc')?.textContent || 'Water';
        addWater(amount, desc);
      });
    });

    // Custom Log Form
    elements.customLogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = parseInt(elements.customAmountInput.value, 10);
      if (amount && amount > 0) {
        addWater(amount, 'Custom intake');
        elements.customAmountInput.value = '';
      }
    });

    // Secondary Actions
    elements.undoBtn.addEventListener('click', () => {
      subtractWater(250);
    });

    elements.resetDayBtn.addEventListener('click', () => {
      resetDay();
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
        saveState();
        updateUI();
        elements.goalEditForm.classList.add('hidden');
        showToast(`Target updated to ${newGoal} ml!`);
      }
    });

    elements.recalcFromProfileBtn.addEventListener('click', () => {
      const calculated = calculateHydrationGoal(state.profile);
      state.dailyGoal = calculated;
      state.profile.isOverridden = false;
      state.profile.calculatedGoal = calculated;
      saveState();
      updateUI();
      elements.goalEditForm.classList.add('hidden');
      showToast(`Target reset to profile recommendation (${calculated} ml)! 💧`);
    });

    // Profile Modal Open & Close
    elements.profileModalBtn.addEventListener('click', openProfileModal);
    elements.closeProfileModalBtn.addEventListener('click', closeProfileModal);
    elements.cancelProfileBtn.addEventListener('click', closeProfileModal);

    // Close on backdrop click
    elements.profileModal.addEventListener('click', (e) => {
      if (e.target === elements.profileModal) {
        closeProfileModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !elements.profileModal.classList.contains('hidden')) {
        closeProfileModal();
      }
    });

    // Weight unit switch
    elements.unitKgBtn.addEventListener('click', () => setWeightUnit('kg'));
    elements.unitLbsBtn.addEventListener('click', () => setWeightUnit('lbs'));

    // Height unit switch
    elements.unitCmBtn.addEventListener('click', () => setHeightUnit('cm'));
    elements.unitFtBtn.addEventListener('click', () => setHeightUnit('ft'));

    // Override checkbox
    elements.overrideGoalCheck.addEventListener('change', (e) => {
      toggleCustomGoalVisibility(e.target.checked);
      updateProfilePreview();
    });

    // Live calculation listeners for modal inputs
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

    // Profile Form Submit
    elements.profileForm.addEventListener('submit', handleProfileSubmit);

    // Theme Toggle
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
