/**
 * simulator.js — Impact Simulator Component (Interactive Sandbox)
 * Project ByteSaver
 *
 * Two range sliders (Cloud Storage GB + Unread Emails) drive a live
 * CO₂ estimate and SVG gauge — no data is logged.
 */

import { gbToCO2Kg, emailsToCO2Kg, getEquivalencies } from '../utils/carbon.js';
import { formatCO2, formatNumber } from '../utils/format.js';

/**
 * Mounts the impact simulator into the given container.
 * @param {string|HTMLElement} container
 */
export function mountSimulator(container) {
  const root = typeof container === 'string'
    ? document.querySelector(container)
    : container;
  if (!root) return;

  root.innerHTML = buildSimulatorHTML();

  const storageSlider = root.querySelector('#sim-storage');
  const emailsSlider  = root.querySelector('#sim-emails');
  const storageVal    = root.querySelector('#sim-storage-val');
  const emailsVal     = root.querySelector('#sim-emails-val');
  const co2Display    = root.querySelector('#sim-co2');
  const gaugeArc      = root.querySelector('#gauge-arc');
  const equivRow      = root.querySelector('#sim-equiv-row');

  function update() {
    const gb     = parseFloat(storageSlider.value);
    const emails = parseInt(emailsSlider.value, 10);

    storageVal.textContent = `${gb} GB`;
    emailsVal.textContent  = `${emails.toLocaleString()} emails`;

    const totalKg = gbToCO2Kg(gb) + emailsToCO2Kg(emails);
    co2Display.textContent = formatCO2(totalKg);

    // Update gauge (half-circle: 0–100 GB+10k emails ≈ max ~25.04 kg)
    const maxKg = 26;
    const pct   = Math.min(totalKg / maxKg, 1);
    const angle = pct * 180; // degrees (0° = left, 180° = right)
    const rad   = (angle - 180) * (Math.PI / 180);
    const r     = 70;
    const cx    = 80;
    const cy    = 80;
    const x     = cx + r * Math.cos(rad);
    const y     = cy + r * Math.sin(rad);
    if (gaugeArc) {
      gaugeArc.setAttribute('d',
        `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`
      );
      // Color shift green→amber→red
      const hue = Math.round(120 - pct * 130);
      gaugeArc.setAttribute('stroke', `hsl(${hue},90%,55%)`);
    }

    // Update equivalency mini-row
    const eq = getEquivalencies(totalKg);
    if (equivRow) {
      equivRow.innerHTML = `
        <div class="sim-equiv-item">
          <span>🚗</span>
          <strong>${formatNumber(eq.km, 1)}</strong>
          <small>km driven</small>
        </div>
        <div class="sim-equiv-item">
          <span>📱</span>
          <strong>${formatNumber(eq.phones, 0)}</strong>
          <small>phones charged</small>
        </div>
        <div class="sim-equiv-item">
          <span>🌳</span>
          <strong>${formatNumber(eq.trees, 3)}</strong>
          <small>tree-years</small>
        </div>`;
    }

    // Update slider fill gradient
    updateSliderFill(storageSlider);
    updateSliderFill(emailsSlider);
  }

  storageSlider.addEventListener('input', update);
  emailsSlider.addEventListener('input', update);
  update(); // initial render
}

function updateSliderFill(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  const pct = ((val - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right,
    var(--green-600) 0%,
    var(--green-glow) ${pct}%,
    var(--dark-700) ${pct}%)`;
}

function buildSimulatorHTML() {
  return `
    <div class="simulator-card">
      <p class="section-desc" style="margin-top:0;margin-bottom:var(--space-8)">
        Drag the sliders to see your potential impact — before you even begin cleaning.
        No data is logged here.
      </p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-8)">

        <!-- Sliders -->
        <div style="display:flex;flex-direction:column;gap:var(--space-6)">

          <div class="slider-group" role="group" aria-labelledby="lbl-storage">
            <div class="slider-header">
              <label id="lbl-storage" class="slider-label" for="sim-storage">
                ☁️ Cloud Storage to delete
              </label>
              <span class="slider-value" id="sim-storage-val" aria-live="polite">10 GB</span>
            </div>
            <input
              id="sim-storage"
              class="slider"
              type="range"
              min="0" max="100" step="0.5" value="10"
              aria-label="Cloud storage in gigabytes"
              aria-valuemin="0" aria-valuemax="100"
            />
            <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-muted)">
              <span>0 GB</span><span>100 GB</span>
            </div>
          </div>

          <div class="slider-group" role="group" aria-labelledby="lbl-emails">
            <div class="slider-header">
              <label id="lbl-emails" class="slider-label" for="sim-emails">
                📧 Unread / junk emails to delete
              </label>
              <span class="slider-value" id="sim-emails-val" aria-live="polite">1,000 emails</span>
            </div>
            <input
              id="sim-emails"
              class="slider"
              type="range"
              min="0" max="10000" step="100" value="1000"
              aria-label="Number of emails"
              aria-valuemin="0" aria-valuemax="10000"
            />
            <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-muted)">
              <span>0</span><span>10,000</span>
            </div>
          </div>

          <!-- Mini equivalency row -->
          <div id="sim-equiv-row" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);margin-top:var(--space-2)">
          </div>
        </div>

        <!-- Gauge + Result -->
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--space-4)">
          <div style="position:relative;width:160px;height:90px">
            <svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CO₂ savings gauge">
              <!-- Track -->
              <path d="M 10 80 A 70 70 0 0 1 150 80"
                fill="none" stroke="rgba(0,230,118,0.1)" stroke-width="10"
                stroke-linecap="round"/>
              <!-- Active arc -->
              <path id="gauge-arc" d="M 10 80 A 70 70 0 0 1 10 80"
                fill="none" stroke="var(--green-glow)" stroke-width="10"
                stroke-linecap="round"
                style="transition:d 0.3s ease, stroke 0.3s ease"/>
              <!-- Needle base -->
              <circle cx="80" cy="80" r="6" fill="var(--green-glow)" opacity="0.8"/>
            </svg>
          </div>

          <div class="sim-result">
            <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-2)">
              Potential CO₂ saved
            </div>
            <div class="sim-co2" id="sim-co2" aria-live="polite" aria-atomic="true">
              2.504 kg CO₂
            </div>
            <div class="sim-unit">per year if deleted today</div>
          </div>
        </div>
      </div>
    </div>

    <style>
      .sim-equiv-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: var(--space-2);
        background: rgba(0,192,90,0.05);
        border: 1px solid rgba(0,192,90,0.1);
        border-radius: var(--radius-md);
        text-align: center;
        font-size: var(--text-xs);
        color: var(--text-muted);
      }
      .sim-equiv-item strong {
        font-family: var(--font-mono);
        color: var(--green-400);
        font-size: var(--text-sm);
      }
      @media(max-width:640px) {
        .simulator-card > div { grid-template-columns: 1fr !important; }
      }
    </style>`;
}
