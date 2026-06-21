/**
 * leaderboard.js — Community Leaderboard Component
 * Project ByteSaver
 *
 * Backs data with localStorage. Seeds 5 mock clubs on first run.
 */

import { formatNumber } from '../utils/format.js';

const STORAGE_KEY = 'bytesaver_leaderboard';

const MOCK_SEED = [
  { name: 'EcoHackers Berlin',    club: 'EcoHackers',    co2Kg: 48.5,  members: 12 },
  { name: 'Zero-Byte Collective', club: 'ZBC',            co2Kg: 37.2,  members: 8  },
  { name: 'Cloud Pruners NYC',    club: 'CloudPruners',   co2Kg: 29.8,  members: 15 },
  { name: 'Inbox Zero Brigade',   club: 'IZBrigade',      co2Kg: 21.1,  members: 6  },
  { name: 'Green Devs Mumbai',    club: 'GreenDevs',      co2Kg: 14.6,  members: 10 },
];

/** Load leaderboard from localStorage, seeding if empty. */
function loadBoard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  // Seed
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SEED));
  return MOCK_SEED;
}

/** Persist board to localStorage. */
function saveBoard(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (_) {}
}

/**
 * Adds or updates a user's score on the leaderboard.
 * @param {string} name    - Display name or club
 * @param {string} club    - Club tag
 * @param {number} co2Kg  - Their total CO₂ saved
 */
export function addScore(name, club, co2Kg) {
  const board = loadBoard();
  const existing = board.find((e) => e.name === name);
  if (existing) {
    existing.co2Kg = Math.max(existing.co2Kg, co2Kg);
  } else {
    board.push({ name, club, co2Kg, members: 1 });
  }
  board.sort((a, b) => b.co2Kg - a.co2Kg);
  saveBoard(board);
  return board;
}

/**
 * Renders the leaderboard into the given container.
 * @param {string|HTMLElement} container
 */
export function renderLeaderboard(container) {
  const root = typeof container === 'string'
    ? document.querySelector(container)
    : container;
  if (!root) return;

  const board = loadBoard();
  const maxScore = board[0]?.co2Kg || 1;

  root.innerHTML = `
    <div class="leaderboard-list" role="list" aria-label="Community leaderboard">
      ${board.slice(0, 10).map((entry, i) => {
        const rank = i + 1;
        const pct = Math.round((entry.co2Kg / maxScore) * 100);
        const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
        const isTop = rank <= 3;
        return `
          <div class="leaderboard-item ${isTop ? 'top-3' : ''} reveal reveal-delay-${Math.min(i + 1, 4)}"
               role="listitem"
               aria-label="Rank ${rank}: ${entry.name}, ${formatNumber(entry.co2Kg, 2)} kg CO₂ saved">
            <div class="badge-rank ${rankClass}" aria-hidden="true">${rank}</div>
            <div class="leaderboard-info">
              <div class="leaderboard-name">${escapeHtml(entry.name)}</div>
              <div class="leaderboard-club">${escapeHtml(entry.club)} · ${entry.members} member${entry.members !== 1 ? 's' : ''}</div>
            </div>
            <div class="leaderboard-bar-wrap" aria-hidden="true">
              <div class="leaderboard-bar" style="width:${pct}%"></div>
            </div>
            <div class="leaderboard-score">${formatNumber(entry.co2Kg, 2)} kg</div>
          </div>`;
      }).join('')}
    </div>`;

  // Trigger bar animations after paint
  requestAnimationFrame(() => {
    root.querySelectorAll('.leaderboard-bar').forEach((bar) => {
      const target = bar.style.width;
      bar.style.width = '0';
      requestAnimationFrame(() => { bar.style.width = target; });
    });
  });
}

function escapeHtml(str) {
  const el = document.createElement('div');
  el.textContent = String(str).slice(0, 60);
  return el.innerHTML;
}
