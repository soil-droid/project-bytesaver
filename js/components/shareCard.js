/**
 * shareCard.js — Shareable Receipt Summary Card
 * Project ByteSaver
 *
 * Generates a styled receipt card sized for social sharing.
 * Provides a "Copy Image" flow via the native Share API or canvas fallback.
 */

import { formatCO2, formatNumber, getCO2Tier, sanitize } from '../utils/format.js';
import { getEquivalencies } from '../utils/carbon.js';

/**
 * Renders a shareable receipt card into the given container.
 *
 * @param {string|HTMLElement} container
 * @param {object} data
 * @param {string} data.name      - User's display name
 * @param {string} data.club      - Club/community name
 * @param {number} data.co2Kg    - Total CO₂ saved in kg
 * @param {Array}  data.entries  - Array of log entries
 */
export function renderShareCard(container, data) {
  const root = typeof container === 'string'
    ? document.querySelector(container)
    : container;
  if (!root) {return;}

  const { name, club, co2Kg, entries = [] } = data;
  const eq   = getEquivalencies(co2Kg);
  const tier = getCO2Tier(co2Kg);
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  root.innerHTML = `
    <!-- Printable card -->
    <div class="share-card animate-scaleIn" id="share-card-printable" role="region" aria-label="Shareable cleanup summary">

      <div class="share-header">
        <div class="share-logo">🌿 ByteSaver</div>
        <div class="share-date">${date}</div>
      </div>

      <div style="margin-bottom:var(--space-4)">
        <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:2px">Saved by</div>
        <div style="font-size:var(--text-lg);font-weight:700;color:var(--text-primary)">
          ${sanitize(name || 'Anonymous')}
        </div>
        ${club ? `<div class="badge badge-green" style="margin-top:4px">${sanitize(club)}</div>` : ''}
      </div>

      <div class="share-total">
        <div class="share-total-value" aria-label="${formatNumber(co2Kg, 3)} kilograms CO₂ saved">
          ${formatNumber(co2Kg, 3)}
          <span style="font-size:0.4em;color:var(--text-secondary);font-family:var(--font-sans)">kg CO₂</span>
        </div>
        <div class="share-total-label">saved from the atmosphere</div>
        <div class="badge badge-green" style="margin:var(--space-2) auto 0;display:inline-flex">${tier}</div>
      </div>

      <div class="share-equiv">
        <div class="share-equiv-item">
          <div class="share-equiv-emoji">🚗</div>
          <div class="share-equiv-val">${formatNumber(eq.km, 1)}</div>
          <div class="share-equiv-lbl">km saved</div>
        </div>
        <div class="share-equiv-item">
          <div class="share-equiv-emoji">📱</div>
          <div class="share-equiv-val">${formatNumber(eq.phones, 0)}</div>
          <div class="share-equiv-lbl">phones charged</div>
        </div>
        <div class="share-equiv-item">
          <div class="share-equiv-emoji">🌳</div>
          <div class="share-equiv-val">${formatNumber(eq.trees, 3)}</div>
          <div class="share-equiv-lbl">tree-years</div>
        </div>
      </div>

      ${entries.length > 0 ? `
      <hr class="share-divider"/>
      <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-2)">Cleanup log (${entries.length} items)</div>
      <div style="display:flex;flex-direction:column;gap:6px;max-height:100px;overflow:hidden">
        ${entries.slice(0, 4).map((e) => `
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs)">
            <span style="color:var(--text-secondary)">${sanitize(e.label || e.category)}</span>
            <span style="color:var(--green-400);font-family:var(--font-mono)">${formatCO2(e.co2Kg)}</span>
          </div>`).join('')}
        ${entries.length > 4 ? `<div style="font-size:10px;color:var(--text-muted)">+${entries.length - 4} more items</div>` : ''}
      </div>` : ''}

      <hr class="share-divider"/>

      <div class="share-footer">
        <div class="share-hashtag">#ProjectByteSaver #DigitalCarbon</div>
        <div class="share-tier">bytesaver.app</div>
      </div>
    </div>

    <!-- Share actions -->
    <div style="display:flex;gap:var(--space-3);margin-top:var(--space-4);justify-content:center;flex-wrap:wrap">
      <button id="btn-share-native" class="btn btn-primary" aria-label="Share your carbon savings">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        Share
      </button>
      <button id="btn-share-copy" class="btn btn-ghost" aria-label="Copy share text to clipboard">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy text
      </button>
      <button id="btn-share-print" class="btn btn-ghost" aria-label="Print share card">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        Screenshot guide
      </button>
    </div>`;

  // Wire up buttons
  const shareText = buildShareText(name, co2Kg, eq, tier);
  wireShareButtons(root, shareText);
}

function buildShareText(name, co2Kg, eq, tier) {
  return `🌿 I just saved ${formatNumber(co2Kg, 2)} kg of CO₂ on #ProjectByteSaver!\n` +
    `That's like not driving ${formatNumber(eq.km, 0)} km 🚗 or charging ${formatNumber(eq.phones, 0)} phones 📱\n` +
    `My rank: ${tier}\n\n` +
    `Join the digital cleanup → bytesaver.app\n#DigitalCarbon #ByteSaver`;
}

function wireShareButtons(root, shareText) {
  root.querySelector('#btn-share-native')?.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My ByteSaver Impact', text: shareText });
      } catch (e) { /* user cancelled */ }
    } else {
      // Fallback: copy text
      await copyToClipboard(shareText, root.querySelector('#btn-share-native'));
    }
  });

  root.querySelector('#btn-share-copy')?.addEventListener('click', async (e) => {
    await copyToClipboard(shareText, e.currentTarget);
  });

  root.querySelector('#btn-share-print')?.addEventListener('click', () => {
    showPrintGuide();
  });
}

async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    const original = btn.innerHTML;
    btn.innerHTML = '✅ Copied!';
    setTimeout(() => { btn.innerHTML = original; }, 2000);
  } catch (_) {
    customAlert(`Could not copy to clipboard. Please copy manually:\n\n${text}`);
  }
}

function showPrintGuide() {
  customAlert(
    '📸 Screenshot Guide\n\n' +
    'Windows: Win + Shift + S, then drag over the card.\n' +
    'Mac: Cmd + Shift + 4, then drag over the card.\n' +
    'Mobile: Use your device\'s screenshot shortcut and crop to the card.'
  );
}

/**
 * Renders a premium, accessible custom modal dialog to replace the native browser alert.
 * @param {string} message - The text content to display
 */
function customAlert(message) {
  let dialog = document.getElementById('custom-alert-dialog');
  if (!dialog) {
    dialog = document.createElement('div');
    dialog.id = 'custom-alert-dialog';
    dialog.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
      opacity: 0;
      transition: opacity var(--transition-base);
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: var(--dark-850);
      border: 1px solid var(--border-hover);
      border-radius: var(--radius-2xl);
      padding: var(--space-6);
      width: 100%;
      max-width: 400px;
      box-shadow: var(--shadow-lg);
      transform: scale(0.9);
      transition: transform var(--transition-spring);
      color: var(--text-primary);
      text-align: left;
    `;

    const textEl = document.createElement('p');
    textEl.id = 'custom-alert-text';
    textEl.style.cssText = `
      font-size: var(--text-sm);
      line-height: 1.6;
      white-space: pre-line;
      margin-bottom: var(--space-6);
    `;

    const btn = document.createElement('button');
    btn.textContent = 'Got it';
    btn.style.cssText = `
      width: 100%;
      padding: var(--space-3);
      background: linear-gradient(135deg, var(--green-600), var(--green-500));
      color: var(--dark-950);
      border-radius: var(--radius-lg);
      font-weight: 600;
      font-size: var(--text-sm);
      transition: all var(--transition-fast);
      cursor: pointer;
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.boxShadow = '0 0 15px rgba(0, 230, 118, 0.4)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.boxShadow = 'none';
    });

    const closeDialog = () => {
      dialog.style.opacity = '0';
      content.style.transform = 'scale(0.9)';
      setTimeout(() => {
        dialog.style.display = 'none';
      }, 250);
    };

    btn.addEventListener('click', closeDialog);
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        closeDialog();
      }
    });

    content.appendChild(textEl);
    content.appendChild(btn);
    dialog.appendChild(content);
    document.body.appendChild(dialog);
  }

  const textEl = dialog.querySelector('#custom-alert-text');
  textEl.textContent = message;

  dialog.style.display = 'flex';
  // Force a layout reflow
  dialog.offsetHeight;
  dialog.style.opacity = '1';
  dialog.querySelector('div').style.transform = 'scale(1)';
}

// Note: HTML escaping is handled by sanitize() imported from format.js
