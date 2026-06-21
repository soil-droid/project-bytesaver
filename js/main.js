/**
 * main.js — App Bootstrap & Orchestration
 * Project ByteSaver
 *
 * Entry point that initialises all components, wires up modals,
 * starts the particle canvas, and sets up scroll-reveal & nav highlighting.
 *
 * @module main
 */

import { mountDashboard, setUser } from './components/dashboard.js';
import { renderLeaderboard } from './components/leaderboard.js';
import { mountSimulator } from './components/simulator.js';
import { renderEquivalency } from './components/equivalency.js';
import { mountAssistant } from './ai/assistant.js';

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initScrollReveal();
  initNavHighlight();
  initMobileNav();

  // Component containers
  const dashContainer   = document.querySelector('#dashboard-mount');
  const equivContainer  = document.querySelector('#equiv-mount');
  const leaderContainer = document.querySelector('#leaderboard-mount');
  const simContainer    = document.querySelector('#simulator-mount');
  const shareContainer  = document.querySelector('#share-mount');

  // Mount components
  mountDashboard(dashContainer, { equivContainer, shareContainer, leaderContainer });
  renderLeaderboard(leaderContainer);
  mountSimulator(simContainer);
  renderEquivalency(equivContainer, 0);

  // AI assistant
  mountAssistant({
    fab:        document.querySelector('#chat-fab'),
    panel:      document.querySelector('#chat-panel'),
    messagesEl: document.querySelector('#chat-messages'),
    inputEl:    document.querySelector('#chat-input'),
    sendBtn:    document.querySelector('#chat-send'),
  });

  // Settings modal
  initSettingsModal();

  // Profile modal
  initProfileModal();

  // Hero counter animation
  animateHeroCounters();
});

// ── Particles ─────────────────────────────────────────────────
/** Creates floating particle elements on the hero canvas. */
function initParticles() {
  const canvas = document.querySelector('.particles');
  if (!canvas) return;

  const PARTICLE_CHARS = ['🌿', '✦', '○', '◦', '·'];
  const count = window.innerWidth < 768 ? 8 : 15;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = PARTICLE_CHARS[Math.floor(Math.random() * PARTICLE_CHARS.length)];
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${0.5 + Math.random() * 0.8}rem;
      opacity: ${0.2 + Math.random() * 0.4};
      animation-duration: ${12 + Math.random() * 20}s;
      animation-delay: ${-Math.random() * 20}s;
    `;
    canvas.appendChild(p);
  }
}

// ── Scroll Reveal ─────────────────────────────────────────────
/** Sets up IntersectionObserver-driven scroll-reveal for .reveal elements. */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Re-observe after dynamic renders
  const mutObs = new MutationObserver(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => observer.observe(el));
  });
  mutObs.observe(document.body, { childList: true, subtree: true });
}

// ── Nav Highlight ─────────────────────────────────────────────
/** Highlights the active nav link based on which section is in the viewport. */
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${entry.target.id}`
            );
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => observer.observe(s));
}

// ── Mobile Nav ────────────────────────────────────────────────
/** Wires the hamburger toggle for the mobile full-screen nav drawer. */
function initMobileNav() {
  const toggle = document.querySelector('#mobile-nav-toggle');
  const links  = document.querySelector('#mobile-nav-drawer');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });

  // Close on link click
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

// ── Settings Modal ────────────────────────────────────────────
/** Initialises the Gemini API key settings modal (open/close/save/validate). */
function initSettingsModal() {
  const modal   = document.querySelector('#settings-modal');
  const overlay = document.querySelector('#settings-overlay');
  const openBtn = document.querySelector('#btn-settings');
  const closeBtn = document.querySelector('#btn-settings-close');
  const saveBtn  = document.querySelector('#btn-settings-save');
  const keyInput = document.querySelector('#settings-api-key');
  const toast    = document.querySelector('#settings-toast');

  if (!modal) return;

  function openModal() {
    overlay.classList.add('open');
    // Pre-fill with existing key (masked)
    const existing = sessionStorage.getItem('bytesaver_api_key');
    if (existing && keyInput) {
      keyInput.value = existing;
      keyInput.type = 'password';
    }
    keyInput?.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
  }

  openBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('open')) closeModal();
  });

  saveBtn?.addEventListener('click', () => {
    const key = keyInput?.value.trim();
    if (!key) {
      showToast(toast, '⚠️ Please enter your API key.', 'error');
      return;
    }
    if (!key.startsWith('AIza') || key.length < 30) {
      showToast(toast, '⚠️ This doesn\'t look like a valid Gemini API key. It should start with "AIza".', 'error');
      return;
    }
    sessionStorage.setItem('bytesaver_api_key', key);
    showToast(toast, '✅ API key saved for this session!', 'success');
    setTimeout(closeModal, 1500);
  });

  // Toggle visibility
  document.querySelector('#btn-toggle-key')?.addEventListener('click', () => {
    if (keyInput) {
      keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
    }
  });
}

// ── Profile Modal ─────────────────────────────────────────────
/** Initialises the user profile modal (name + club name). */
function initProfileModal() {
  const modal    = document.querySelector('#profile-modal');
  const overlay  = document.querySelector('#profile-overlay');
  const openBtn  = document.querySelector('#btn-profile');
  const closeBtn = document.querySelector('#btn-profile-close');
  const saveBtn  = document.querySelector('#btn-profile-save');
  const nameIn   = document.querySelector('#profile-name');
  const clubIn   = document.querySelector('#profile-club');

  if (!modal) return;

  openBtn?.addEventListener('click', () => {
    overlay.classList.add('open');
    nameIn?.focus();
  });
  closeBtn?.addEventListener('click', () => overlay.classList.remove('open'));
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  saveBtn?.addEventListener('click', () => {
    const name = nameIn?.value.trim().slice(0, 40) || 'Anonymous';
    const club = clubIn?.value.trim().slice(0, 40) || 'Solo Cleaner';
    setUser(name, club);
    overlay.classList.remove('open');
    showGlobalToast(`Profile updated! Hello, ${name} 🌿`);
  });
}

// ── Hero Counter Animation ────────────────────────────────────
/** Animates [data-count-to] counters in the hero section using ease-out-cubic. */
function animateHeroCounters() {
  const counters = document.querySelectorAll('[data-count-to]');
  counters.forEach((el) => {
    const target = parseFloat(el.dataset.countTo);
    const duration = 1800;
    const start = performance.now();
    const isFloat = el.dataset.countTo.includes('.');

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const value = target * ease;
      el.textContent = isFloat
        ? value.toFixed(1)
        : Math.round(value).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }

    // Only animate when visible
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(step);
        obs.disconnect();
      }
    });
    obs.observe(el);
  });
}

// ── Toast Helpers ─────────────────────────────────────────────
/**
 * Displays a toast notification inside a given element.
 * @param {HTMLElement|null} el   - The toast container element
 * @param {string}           msg  - Message text
 * @param {'success'|'error'} [type='success'] - Controls text colour
 */
function showToast(el, msg, type = 'success') {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.style.color = type === 'error' ? 'var(--accent-red)' : 'var(--green-400)';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

/**
 * Shows the global floating toast notification.
 * @param {string} msg - Message to display
 */
function showGlobalToast(msg) {
  const t = document.querySelector('#global-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
