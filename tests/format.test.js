/**
 * format.test.js — Unit Tests for format.js
 * Project ByteSaver
 *
 * Tests formatting utilities: formatCO2, formatNumber, formatSize,
 * getCO2Tier, truncate.
 * No test framework required — runs via tests/tests.html.
 */

import {
  formatCO2,
  formatNumber,
  formatSize,
  getCO2Tier,
  truncate,
} from '../js/utils/format.js';

// ── Test Runner (shared contract) ─────────────────────────────
const results = [];

/**
 * Strict equality assertion.
 * @param {string} description
 * @param {*} actual
 * @param {*} expected
 */
function assertEqual(description, actual, expected) {
  const pass = actual === expected;
  results.push({ description, actual, expected, pass });
  return pass;
}

/**
 * Numeric approximate assertion.
 * @param {string} description
 * @param {number} actual
 * @param {number} expected
 * @param {number} tolerance
 */
function assertApprox(description, actual, expected, tolerance = 0.0001) {
  const pass = Math.abs(actual - expected) <= tolerance;
  results.push({ description, actual, expected, pass });
  return pass;
}

// ── formatCO2 ─────────────────────────────────────────────────

assertEqual(
  'formatCO2(0) === "0 g CO₂"',
  formatCO2(0),
  '0 g CO₂'
);

assertEqual(
  'formatCO2(0.5) shows grams when < 1 kg',
  formatCO2(0.5),
  '500.0 g CO₂'
);

assertEqual(
  'formatCO2(0.001) boundary — shows grams',
  formatCO2(0.001),
  '1.0 g CO₂'
);

assertEqual(
  'formatCO2(1) shows kg',
  formatCO2(1),
  '1.000 kg CO₂'
);

assertEqual(
  'formatCO2(1.25) shows 3 decimal kg',
  formatCO2(1.25),
  '1.250 kg CO₂'
);

assertEqual(
  'formatCO2(0.0001) shows µg for tiny values',
  formatCO2(0.0001),
  '100.0 µg CO₂'
);

// ── formatNumber ──────────────────────────────────────────────

assertEqual(
  'formatNumber(0, 0) === "0"',
  formatNumber(0, 0),
  '0'
);

assertEqual(
  'formatNumber(1234, 0) uses comma separator',
  formatNumber(1234, 0),
  '1,234'
);

assertEqual(
  'formatNumber(1.5, 2) shows 2 decimal places',
  formatNumber(1.5, 2),
  '1.5'
);

assertEqual(
  'formatNumber(1000000, 0) formats millions',
  formatNumber(1000000, 0),
  '1,000,000'
);

assertEqual(
  'formatNumber(0.001, 3) shows small decimals',
  formatNumber(0.001, 3),
  '0.001'
);

// ── formatSize ────────────────────────────────────────────────

assertEqual(
  'formatSize(1) === "1.00 GB"',
  formatSize(1),
  '1.00 GB'
);

assertEqual(
  'formatSize(0.5) shows MB (< 1 GB)',
  formatSize(0.5),
  '512 MB'
);

assertEqual(
  'formatSize(1000) shows TB',
  formatSize(1000),
  '1.0 TB'
);

assertEqual(
  'formatSize(2048) shows TB for large values',
  formatSize(2048),
  '2.0 TB'
);

assertEqual(
  'formatSize(500) stays in GB',
  formatSize(500),
  '500.00 GB'
);

// ── getCO2Tier ────────────────────────────────────────────────

assertEqual(
  'getCO2Tier(0) === "Start Your Journey"',
  getCO2Tier(0),
  'Start Your Journey'
);

assertEqual(
  'getCO2Tier(0.05) is Green Seedling',
  getCO2Tier(0.05),
  'Green Seedling 🌱'
);

assertEqual(
  'getCO2Tier(0.1) boundary — Digital Cleaner',
  getCO2Tier(0.1),
  'Digital Cleaner 🧹'
);

assertEqual(
  'getCO2Tier(0.5) boundary — Eco Warrior',
  getCO2Tier(0.5),
  'Eco Warrior ⚡'
);

assertEqual(
  'getCO2Tier(2) boundary — Carbon Crusher',
  getCO2Tier(2),
  'Carbon Crusher 🌿'
);

assertEqual(
  'getCO2Tier(10) boundary — Planet Guardian',
  getCO2Tier(10),
  'Planet Guardian 🌍'
);

assertEqual(
  'getCO2Tier(100) — Planet Guardian for large values',
  getCO2Tier(100),
  'Planet Guardian 🌍'
);

// ── truncate ──────────────────────────────────────────────────

assertEqual(
  'truncate short string unchanged',
  truncate('hello', 10),
  'hello'
);

assertEqual(
  'truncate string at exact maxLen unchanged',
  truncate('hello', 5),
  'hello'
);

assertEqual(
  'truncate long string with ellipsis',
  truncate('hello world', 8),
  'hello w…'
);

assertEqual(
  'truncate default maxLen=50',
  truncate('a'.repeat(51)),
  'a'.repeat(49) + '…'
);

// ── Export Results ────────────────────────────────────────────
export function getTestResults() {
  return results;
}

export function runSummary() {
  const pass  = results.filter((r) => r.pass).length;
  const total = results.length;
  return { pass, fail: total - pass, total };
}
