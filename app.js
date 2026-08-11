/**
 * Mayor of Chicago - Helper / Resource Tracker Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Default values requested: Money at 25, all others at 0
  const DEFAULTS = {
    vote: 0,
    popularity: 0,
    money: 25,
    booze: 0,
    power: 0,
    corruption: 0
  };

  const STORAGE_KEY = 'mayor_of_chicago_state';

  // Load state from localStorage or initialize with defaults
  let state = loadState();

  // Elements
  const resetBtn = document.getElementById('reset-btn');
  const resetModal = document.getElementById('reset-modal');
  const modalCancel = document.getElementById('modal-cancel');
  const modalConfirm = document.getElementById('modal-confirm');

  // Initialize UI display
  updateAllDisplays();

  // Event Listeners for + / - Buttons
  document.querySelectorAll('.btn[data-action]').forEach(button => {
    const action = button.getAttribute('data-action');
    const resource = button.getAttribute('data-target');
    
    let pressTimer = null;
    let repeatInterval = null;

    const handlePressStart = (e) => {
      // Prevent double firing on touch devices
      if (e.type === 'touchstart') {
        e.preventDefault();
      }

      triggerChange(resource, action);
      triggerHaptic();

      // Setup continuous increment/decrement on hold
      pressTimer = setTimeout(() => {
        repeatInterval = setInterval(() => {
          triggerChange(resource, action);
          triggerHaptic();
        }, 120);
      }, 400);
    };

    const handlePressEnd = () => {
      if (pressTimer) clearTimeout(pressTimer);
      if (repeatInterval) clearInterval(repeatInterval);
    };

    // Click / Mouse / Touch bindings
    button.addEventListener('mousedown', handlePressStart);
    button.addEventListener('mouseup', handlePressEnd);
    button.addEventListener('mouseleave', handlePressEnd);

    button.addEventListener('touchstart', handlePressStart, { passive: false });
    button.addEventListener('touchend', handlePressEnd);
    button.addEventListener('touchcancel', handlePressEnd);
  });

  // Modal & Reset logic
  resetBtn.addEventListener('click', () => {
    resetModal.classList.remove('hidden');
  });

  modalCancel.addEventListener('click', () => {
    resetModal.classList.add('hidden');
  });

  modalConfirm.addEventListener('click', () => {
    state = { ...DEFAULTS };
    saveState();
    updateAllDisplays();
    resetModal.classList.add('hidden');
    triggerHaptic(50);
  });

  // Close modal on background click
  resetModal.addEventListener('click', (e) => {
    if (e.target === resetModal) {
      resetModal.classList.add('hidden');
    }
  });

  /**
   * Updates state value and triggers visual animation
   */
  function triggerChange(resource, action) {
    if (!(resource in state)) return;

    if (action === 'increment') {
      state[resource]++;
      animateValue(resource, 'bump-up');
    } else if (action === 'decrement') {
      state[resource]--;
      animateValue(resource, 'bump-down');
    }

    saveState();
    updateDisplay(resource);
  }

  /**
   * Updates single resource element text content
   */
  function updateDisplay(resource) {
    const valElement = document.getElementById(`val-${resource}`);
    if (valElement) {
      valElement.textContent = state[resource];
    }
  }

  /**
   * Updates all resource elements
   */
  function updateAllDisplays() {
    Object.keys(state).forEach(resource => {
      updateDisplay(resource);
    });
  }

  /**
   * Adds temporary CSS class for numeric change animation
   */
  function animateValue(resource, className) {
    const valElement = document.getElementById(`val-${resource}`);
    if (!valElement) return;

    valElement.classList.remove('bump-up', 'bump-down');
    // Force reflow
    void valElement.offsetWidth;
    valElement.classList.add(className);
  }

  /**
   * Haptic vibration feedback for mobile devices
   */
  function triggerHaptic(duration = 10) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (err) {
        // Ignore if restricted by user gesture settings
      }
    }
  }

  /**
   * Load state from localStorage
   */
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with DEFAULTS in case missing properties
        return { ...DEFAULTS, ...parsed };
      }
    } catch (e) {
      console.warn('Could not load saved state from localStorage:', e);
    }
    return { ...DEFAULTS };
  }

  /**
   * Save state to localStorage
   */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save state to localStorage:', e);
    }
  }
});
