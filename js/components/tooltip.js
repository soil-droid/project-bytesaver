/**
 * tooltip.js — Reusable Accessible Tooltip Component
 * Project ByteSaver
 *
 * Usage:
 *   import { createTooltip } from './tooltip.js';
 *   label.appendChild(createTooltip('Your fact here'));
 */

/**
 * Inline Lucide "Info" SVG icon
 */
function infoIcon(size = 14) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4M12 8h.01"/>
  </svg>`;
}

/**
 * Creates an accessible tooltip trigger element.
 *
 * @param {string} text        - Tooltip body text (plain text, sanitized)
 * @param {string} [id]        - Optional unique id; auto-generated if not provided
 * @param {'left'|'right'|'center'} [align='center'] - Horizontal alignment
 * @returns {HTMLElement}      - A wrapper span with trigger + tooltip content
 */
export function createTooltip(text, id, align = 'center') {
  const uid = id || `tt-${Math.random().toString(36).slice(2, 8)}`;

  const wrapper = document.createElement('span');
  wrapper.className = 'tooltip-wrapper';

  // Trigger button (keyboard + mouse accessible)
  const trigger = document.createElement('button');
  trigger.className = 'tooltip-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-describedby', uid);
  trigger.setAttribute('aria-label', 'More information');
  trigger.innerHTML = infoIcon();

  // Tooltip content
  const content = document.createElement('span');
  content.className = `tooltip-content ${align === 'right' ? 'tooltip-right' : ''}`;
  content.id = uid;
  content.setAttribute('role', 'tooltip');
  // Safe text assignment — no innerHTML on user content
  content.textContent = text;

  wrapper.appendChild(trigger);
  wrapper.appendChild(content);
  return wrapper;
}

/**
 * Initialises all tooltips in a container via data-tooltip attributes.
 * Scans for [data-tooltip] elements and wraps them automatically.
 *
 * @param {HTMLElement} [root=document]
 */
export function initTooltips(root = document) {
  root.querySelectorAll('[data-tooltip]').forEach((el) => {
    const text = el.getAttribute('data-tooltip');
    const align = el.getAttribute('data-tooltip-align') || 'center';
    if (!text) return;
    el.appendChild(createTooltip(text, null, align));
  });
}
