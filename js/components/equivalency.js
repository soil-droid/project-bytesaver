/**
 * equivalency.js — CO₂ Equivalency Cards Component
 * Project ByteSaver
 */

import { getEquivalencies } from '../utils/carbon.js';
import { formatNumber } from '../utils/format.js';

const CARDS = [
  {
    key: 'km',
    emoji: '🚗',
    label: 'Km not driven',
    formula: (eq) => eq.km,
    unit: 'km',
    fact: '1 kg CO₂ = ~4 km in an average gas-powered car (EPA)',
    color: '#fbbf24',
  },
  {
    key: 'phones',
    emoji: '📱',
    label: 'Smartphones charged',
    formula: (eq) => eq.phones,
    unit: '',
    fact: '1 kg CO₂ = ~120 full smartphone charges (Carbon Trust)',
    color: '#38bdf8',
  },
  {
    key: 'trees',
    emoji: '🌳',
    label: 'Tree-years of absorption',
    formula: (eq) => eq.trees,
    unit: ' trees/yr',
    fact: 'A mature tree absorbs ~20 kg CO₂ per year (USDA Forest Service)',
    color: '#4ade80',
  },
];

/**
 * Renders or updates the equivalency cards section.
 * @param {string|HTMLElement} container - Selector or element to render into
 * @param {number} co2Kg - Current CO₂ saved in kg
 */
export function renderEquivalency(container, co2Kg) {
  const root = typeof container === 'string'
    ? document.querySelector(container)
    : container;
  if (!root) return;

  const eq = getEquivalencies(co2Kg);

  // First render — build DOM
  if (!root.querySelector('.equiv-grid')) {
    root.innerHTML = buildEquivHTML(eq);
  } else {
    // Subsequent updates — animate numbers only
    updateEquivValues(root, eq);
  }
}

/**
 * Builds the initial equivalency cards HTML.
 * @param {{ km: number, phones: number, trees: number }} eq
 * @returns {string} HTML string
 */
function buildEquivHTML(eq) {
  return `
    <div class="equiv-grid">
      ${CARDS.map((card) => {
        const val = card.formula(eq);
        return `
          <div class="equiv-card hover-lift reveal" role="figure" aria-label="${card.label}: ${formatNumber(val, 1)}${card.unit}">
            <span class="equiv-icon" role="img" aria-hidden="true">${card.emoji}</span>
            <div class="equiv-value" data-equiv-key="${card.key}">
              ${formatNumber(val, 1)}<span style="font-size:0.5em;color:var(--text-muted)">${card.unit}</span>
            </div>
            <div class="equiv-label">${card.label}</div>
            <div class="equiv-sub">${card.fact}</div>
          </div>`;
      }).join('')}
    </div>`;
}

/**
 * Updates only the numeric values inside existing equivalency cards (avoids full re-render).
 * @param {HTMLElement} root
 * @param {{ km: number, phones: number, trees: number }} eq
 */
function updateEquivValues(root, eq) {
  CARDS.forEach((card) => {
    const el = root.querySelector(`[data-equiv-key="${card.key}"]`);
    if (!el) return;
    const val = card.formula(eq);
    el.innerHTML = `${formatNumber(val, 1)}<span style="font-size:0.5em;color:var(--text-muted)">${card.unit}</span>`;
    el.classList.remove('count-animate');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('count-animate');
  });
}
