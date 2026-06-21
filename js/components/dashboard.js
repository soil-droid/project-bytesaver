/**
 * dashboard.js — Digital Cleanup Dashboard Component
 * Project ByteSaver
 *
 * Handles:
 * - Data input form with unit toggle, category selector, tooltips
 * - Live CO₂ preview while typing
 * - Log management (add/delete entries, persist to localStorage)
 * - Running total display + equivalency cards update
 * - Leaderboard score submission
 */

import { gbToCO2Kg, mbToCO2Kg, emailsToCO2Kg, totalCO2Kg } from '../utils/carbon.js';
import { formatCO2, formatNumber, getCO2Tier, sanitize } from '../utils/format.js';
import { createTooltip } from './tooltip.js';
import { renderEquivalency } from './equivalency.js';
import { renderShareCard } from './shareCard.js';
import { addScore, renderLeaderboard } from './leaderboard.js';

const LOG_KEY   = 'bytesaver_log';
const USER_KEY  = 'bytesaver_user';

const CATEGORY_ICONS = {
  cloud:   '☁️',
  email:   '📧',
  photos:  '📷',
  videos:  '🎬',
  cache:   '🗂️',
  backup:  '💾',
  other:   '📁',
};

const TOOLTIP_FACTS = {
  amount:   "Data centers consume over 200 TWh of electricity per year — roughly 1% of global electricity demand. Every GB you delete reduces the load.",
  category: "Cloud backups and duplicate photos are among the biggest culprits. The average person has 3x more data stored than they actively use.",
  unit:     "1 GB of stored data generates approximately 250 g (0.25 kg) of CO₂ per year through data center energy use and cooling. That's ~120 smartphone charges worth of CO₂ annually.",
};

let state = {
  entries: [],
  unit: 'GB',
  user: { name: 'You', club: 'Solo Cleaner' },
};

/** Load state from localStorage. */
function loadState() {
  try {
    const log = localStorage.getItem(LOG_KEY);
    if (log) state.entries = JSON.parse(log);
    const user = localStorage.getItem(USER_KEY);
    if (user) state.user = JSON.parse(user);
  } catch (_) {}
}

/** Persist log to localStorage. */
function saveLog() {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(state.entries));
  } catch (_) {}
}

/**
 * Mounts the full dashboard into the given container.
 * @param {string|HTMLElement} container
 * @param {object} refs - { equivContainer, shareContainer, leaderContainer }
 */
export function mountDashboard(container, refs = {}) {
  const root = typeof container === 'string'
    ? document.querySelector(container)
    : container;
  if (!root) return;

  loadState();
  root.innerHTML = buildDashboardHTML();
  attachTooltips(root);
  wireForm(root, refs);
  renderLog(root);
  updateTotals(root, refs);
}

/**
 * Builds the static HTML skeleton for the dashboard panel.
 * @returns {string} HTML string
 */
function buildDashboardHTML() {
  return `
  <div class="dashboard-grid">

    <!-- LEFT: Input Form -->
    <div class="card card-glass">
      <h3 style="font-family:var(--font-display);font-size:var(--text-xl);font-weight:700;margin-bottom:var(--space-6)">
        Log Your Cleanup
      </h3>

      <form id="cleanup-form" novalidate>

        <!-- Unit Toggle -->
        <div class="form-group" style="margin-bottom:var(--space-4)">
          <div class="label" id="unit-lbl">
            Data Unit
            <span data-tooltip="${TOOLTIP_FACTS.unit}" data-tooltip-align="right"></span>
          </div>
          <div class="unit-toggle" role="group" aria-labelledby="unit-lbl">
            <button type="button" class="unit-toggle-btn active" data-unit="GB" aria-pressed="true">GB</button>
            <button type="button" class="unit-toggle-btn" data-unit="MB" aria-pressed="false">MB</button>
            <button type="button" class="unit-toggle-btn" data-unit="EMAIL" aria-pressed="false">Emails</button>
          </div>
        </div>

        <!-- Amount -->
        <div class="form-group" style="margin-bottom:var(--space-4)">
          <label class="label" for="input-amount" id="lbl-amount">
            Amount deleted
            <span data-tooltip="${TOOLTIP_FACTS.amount}" data-tooltip-align="right"></span>
          </label>
          <div class="input-group">
            <input
              id="input-amount"
              class="input"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 4"
              aria-labelledby="lbl-amount"
              aria-describedby="amount-unit-badge preview-text"
              required
            />
            <div class="input-addon" id="amount-unit-badge" aria-live="polite">GB</div>
          </div>
          <!-- Live preview -->
          <div id="preview-text"
               style="font-size:var(--text-xs);color:var(--green-500);min-height:1.2em;transition:all 0.2s"
               aria-live="polite" aria-atomic="true">
          </div>
        </div>

        <!-- Category -->
        <div class="form-group" style="margin-bottom:var(--space-4)">
          <label class="label" for="input-category" id="lbl-cat">
            Category
            <span data-tooltip="${TOOLTIP_FACTS.category}" data-tooltip-align="right"></span>
          </label>
          <select id="input-category" class="select" aria-labelledby="lbl-cat">
            <option value="cloud">☁️  Cloud storage / backups</option>
            <option value="email">📧  Emails &amp; attachments</option>
            <option value="photos">📷  Duplicate photos</option>
            <option value="videos">🎬  Old videos</option>
            <option value="cache">🗂️  App cache / temp files</option>
            <option value="backup">💾  Old device backups</option>
            <option value="other">📁  Other</option>
          </select>
        </div>

        <!-- Label -->
        <div class="form-group" style="margin-bottom:var(--space-6)">
          <label class="label" for="input-label">
            Note <span style="color:var(--text-muted);font-weight:400">(optional)</span>
          </label>
          <input
            id="input-label"
            class="input"
            type="text"
            placeholder="e.g. Cleaned Google Drive"
            maxlength="60"
            aria-label="Optional note for this cleanup entry"
          />
        </div>

        <button type="submit" id="btn-log" class="btn btn-primary" style="width:100%" aria-label="Log this cleanup entry">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
          Log Cleanup
        </button>

        <div id="form-error" role="alert" aria-live="assertive"
             style="display:none;margin-top:var(--space-3);padding:var(--space-3);background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);border-radius:var(--radius-md);font-size:var(--text-sm);color:var(--accent-red)">
        </div>
      </form>
    </div>

    <!-- RIGHT: Stats + Log -->
    <div class="dashboard-stats">

      <!-- Total CO₂ stat -->
      <div class="card card-glass text-center animate-pulse" style="text-align:center;padding:var(--space-8)" aria-live="polite">
        <div style="font-size:var(--text-xs);color:var(--text-muted);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:var(--space-2)">
          Total CO₂ Saved
        </div>
        <div id="total-co2-display" class="stat-big">0 <span class="stat-unit">g</span></div>
        <div id="total-tier" style="margin-top:var(--space-2);font-size:var(--text-sm);color:var(--text-secondary)">
          Start Your Journey
        </div>
        <div style="margin-top:var(--space-4)">
          <div class="progress-track">
            <div id="total-progress-bar" class="progress-bar" style="width:0%" aria-label="Progress to next tier"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">
            <span>0</span><span>10 kg CO₂</span>
          </div>
        </div>
      </div>

      <!-- Log list -->
      <div class="card" style="padding:var(--space-4)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3)">
          <h4 style="font-size:var(--text-sm);font-weight:600;color:var(--text-secondary)">
            Cleanup Log
          </h4>
          <button id="btn-clear-log" class="btn btn-sm btn-danger" aria-label="Clear all log entries"
                  style="display:none">
            Clear all
          </button>
        </div>
        <div id="log-list-container" aria-live="polite" aria-label="Cleanup log entries">
          <div class="empty-state">
            <div class="empty-state-icon">🗂️</div>
            <div class="empty-state-text">No entries yet.<br/>Log your first cleanup above!</div>
          </div>
        </div>
      </div>

      <!-- Share CTA -->
      <button id="btn-show-share" class="btn btn-ghost" style="width:100%;display:none" aria-label="View shareable summary card">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        View &amp; Share Summary Card
      </button>

    </div>
  </div>`;
}

/**
 * Initialises accessible tooltip triggers for all [data-tooltip] spans.
 * @param {HTMLElement} root
 */
function attachTooltips(root) {
  // Tooltip init on [data-tooltip] spans
  root.querySelectorAll('[data-tooltip]').forEach((el) => {
    const text  = el.getAttribute('data-tooltip');
    const align = el.getAttribute('data-tooltip-align') || 'center';
    el.appendChild(createTooltip(text, null, align));
    el.removeAttribute('data-tooltip');
    el.removeAttribute('data-tooltip-align');
  });
}

/**
 * Wires all interactive events for the cleanup form.
 * @param {HTMLElement} root - Dashboard root element
 * @param {object} refs - { equivContainer, shareContainer, leaderContainer }
 */
function wireForm(root, refs) {
  const form        = root.querySelector('#cleanup-form');
  const amountInput = root.querySelector('#input-amount');
  const unitBadge   = root.querySelector('#amount-unit-badge');
  const previewEl   = root.querySelector('#preview-text');
  const errorEl     = root.querySelector('#form-error');
  const unitBtns    = root.querySelectorAll('.unit-toggle-btn');
  const clearBtn    = root.querySelector('#btn-clear-log');
  const shareBtn    = root.querySelector('#btn-show-share');

  // Unit toggle
  unitBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.unit = btn.dataset.unit;
      unitBtns.forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      unitBadge.textContent = state.unit === 'EMAIL' ? 'emails' : state.unit;
      amountInput.step = state.unit === 'EMAIL' ? '1' : '0.1';
      amountInput.placeholder = state.unit === 'EMAIL' ? 'e.g. 500' : 'e.g. 4';
      updatePreview(amountInput.value, previewEl);
    });
  });

  // Live preview
  amountInput.addEventListener('input', () => {
    updatePreview(amountInput.value, previewEl);
  });

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';

    const rawValue = parseFloat(amountInput.value);
    const category = root.querySelector('#input-category').value;
    const label    = root.querySelector('#input-label').value.trim().slice(0, 60);

    // Validation
    if (!amountInput.value || isNaN(rawValue) || rawValue <= 0) {
      showError(errorEl, 'Please enter a positive number for the amount.');
      amountInput.focus();
      return;
    }
    if (rawValue > 100000) {
      showError(errorEl, 'Value seems too large. Please double-check the unit.');
      return;
    }

    const co2Kg = computeCO2(rawValue, state.unit);
    const entry = {
      id:       crypto.randomUUID?.() || Date.now().toString(),
      value:    rawValue,
      unit:     state.unit,
      category,
      label:    label || `${CATEGORY_ICONS[category] || '📁'} ${category}`,
      co2Kg,
      ts:       Date.now(),
    };

    state.entries.unshift(entry);
    saveLog();
    renderLog(root);
    updateTotals(root, refs);

    // Reset form
    amountInput.value = '';
    previewEl.textContent = '';
    amountInput.focus();

    // Show share/clear buttons once there are entries
    clearBtn.style.display = 'flex';
    shareBtn.style.display = 'flex';

    // Submit to leaderboard
    const total = totalCO2Kg(state.entries);
    addScore(state.user.name, state.user.club, total);
    if (refs.leaderContainer) renderLeaderboard(refs.leaderContainer);
  });

  // Clear all — uses an inline confirm instead of the blocking window.confirm()
  clearBtn.addEventListener('click', () => {
    // Show inline confirmation inside the button itself
    const originalHTML = clearBtn.innerHTML;
    clearBtn.textContent = 'Confirm? (click again)';
    clearBtn.style.background = 'rgba(248,113,113,0.2)';
    clearBtn.dataset.confirming = 'true';

    const resetBtn = () => {
      clearBtn.innerHTML = originalHTML;
      clearBtn.style.background = '';
      delete clearBtn.dataset.confirming;
    };

    // Auto-reset after 3 seconds if user doesn’t click again
    const timer = setTimeout(resetBtn, 3000);

    // Second click confirms
    clearBtn.addEventListener('click', function onConfirm() {
      clearTimeout(timer);
      resetBtn();
      clearBtn.removeEventListener('click', onConfirm);
      state.entries = [];
      saveLog();
      renderLog(root);
      updateTotals(root, refs);
      clearBtn.style.display = 'none';
      shareBtn.style.display = 'none';
    }, { once: true });
  });

  // Show share card
  shareBtn.addEventListener('click', () => {
    if (refs.shareContainer) {
      const total = totalCO2Kg(state.entries);
      renderShareCard(refs.shareContainer, {
        name:    state.user.name,
        club:    state.user.club,
        co2Kg:   total,
        entries: state.entries,
      });
      refs.shareContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // Show buttons if there are existing entries
  if (state.entries.length > 0) {
    clearBtn.style.display = 'flex';
    shareBtn.style.display = 'flex';
  }
}

/**
 * Updates the live CO₂ preview text below the amount input.
 * @param {string} val  - Raw input value string
 * @param {HTMLElement} previewEl - Element to write the preview into
 */
function updatePreview(val, previewEl) {
  const n = parseFloat(val);
  if (!val || isNaN(n) || n <= 0) {
    previewEl.textContent = '';
    return;
  }
  const kg = computeCO2(n, state.unit);
  previewEl.textContent = `≈ ${formatCO2(kg)} CO₂ saved per year`;
}

/**
 * Computes kg CO₂ from an amount and unit string.
 * @param {number} value
 * @param {'GB'|'MB'|'EMAIL'} unit
 * @returns {number} kg CO₂
 */
function computeCO2(value, unit) {
  switch (unit) {
    case 'GB':    return gbToCO2Kg(value);
    case 'MB':    return mbToCO2Kg(value);
    case 'EMAIL': return emailsToCO2Kg(value);
    default:      return 0;
  }
}

/**
 * Re-renders the cleanup log list inside the dashboard.
 * @param {HTMLElement} root
 */
function renderLog(root) {
  const container = root.querySelector('#log-list-container');
  if (!container) return;

  if (state.entries.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🗂️</div>
        <div class="empty-state-text">No entries yet.<br/>Log your first cleanup above!</div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="log-list" role="list" aria-label="Cleanup log">
      ${state.entries.map((entry) => `
        <div class="log-entry" role="listitem" data-entry-id="${entry.id}"
             aria-label="${entry.label}: ${formatCO2(entry.co2Kg)} CO₂ saved">
          <div class="log-entry-icon" aria-hidden="true">
            ${CATEGORY_ICONS[entry.category] || '📁'}
          </div>
          <div class="log-entry-info">
            <div class="log-entry-name">${sanitize(entry.label)}</div>
            <div class="log-entry-meta">${formatNumber(entry.value, 2)} ${entry.unit}</div>
          </div>
          <div class="log-entry-co2">${formatCO2(entry.co2Kg)}</div>
          <button class="log-entry-delete btn btn-icon" data-delete-id="${entry.id}"
                  aria-label="Delete log entry: ${sanitize(entry.label)}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>`).join('')}
    </div>`;

  // Wire delete buttons
  container.querySelectorAll('[data-delete-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.deleteId;
      state.entries = state.entries.filter((e) => e.id !== id);
      saveLog();
      renderLog(root);
      // re-find refs and update
      updateTotals(root, {});
    });
  });
}

/**
 * Updates the CO₂ total display, tier badge, progress bar, and equivalency cards.
 * @param {HTMLElement} root
 * @param {object} refs - { equivContainer }
 */
function updateTotals(root, refs) {
  const total   = totalCO2Kg(state.entries);
  const tier    = getCO2Tier(total);
  const pct     = Math.min((total / 10) * 100, 100);

  const display  = root.querySelector('#total-co2-display');
  const tierEl   = root.querySelector('#total-tier');
  const progress = root.querySelector('#total-progress-bar');

  if (display) {
    display.innerHTML = total < 1
      ? `${formatNumber(total * 1000, 1)} <span class="stat-unit">g CO₂</span>`
      : `${formatNumber(total, 3)} <span class="stat-unit">kg CO₂</span>`;
    display.classList.remove('count-animate');
    void display.offsetWidth;
    display.classList.add('count-animate');
  }
  if (tierEl) tierEl.textContent = tier;
  if (progress) progress.style.width = `${pct}%`;

  if (refs.equivContainer) renderEquivalency(refs.equivContainer, total);
}

/**
 * Displays an inline error message, then hides it after 5 seconds.
 * @param {HTMLElement} el  - Error container element
 * @param {string}      msg - Error message text
 */
function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

// Note: HTML escaping delegated to sanitize() from format.js

/** Public: update user profile used in share card & leaderboard */
export function setUser(name, club) {
  state.user = {
    name: String(name).slice(0, 40),
    club: String(club).slice(0, 40),
  };
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(state.user));
  } catch (_) {}
}

/** Public: returns current total CO₂ */
export function getCurrentTotal() {
  return totalCO2Kg(state.entries);
}
