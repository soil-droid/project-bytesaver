/**
 * format.js — Display formatting utilities
 * Project ByteSaver
 */

/**
 * Formats a CO₂ value in kg to a human-readable string.
 * Shows grams for values < 1 kg.
 * @param {number} kg
 * @returns {string}
 */
export function formatCO2(kg) {
  if (kg === 0) return '0 g CO₂';
  if (kg < 0.001) return `${(kg * 1000000).toFixed(1)} µg CO₂`;
  if (kg < 1) return `${(kg * 1000).toFixed(1)} g CO₂`;
  return `${kg.toFixed(3)} kg CO₂`;
}

/**
 * Formats a number with locale-aware commas and optional decimal places.
 * @param {number} n
 * @param {number} [dp=2]
 * @returns {string}
 */
export function formatNumber(n, dp = 2) {
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: dp,
  });
}

/**
 * Formats a data size from GB to human-readable.
 * @param {number} gb
 * @returns {string}
 */
export function formatSize(gb) {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)} TB`;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${(gb * 1024).toFixed(0)} MB`;
}

/**
 * Returns a short, punchy label for CO₂ progress.
 * @param {number} kg
 * @returns {string}
 */
export function getCO2Tier(kg) {
  if (kg === 0) return 'Start Your Journey';
  if (kg < 0.1) return 'Green Seedling 🌱';
  if (kg < 0.5) return 'Digital Cleaner 🧹';
  if (kg < 2)   return 'Eco Warrior ⚡';
  if (kg < 10)  return 'Carbon Crusher 🌿';
  return 'Planet Guardian 🌍';
}

/**
 * Sanitizes a string for safe display (prevents XSS).
 * @param {string} str
 * @returns {string}
 */
export function sanitize(str) {
  const el = document.createElement('div');
  el.textContent = String(str);
  return el.innerHTML;
}

/**
 * Truncates a string to maxLen characters.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen = 50) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}
