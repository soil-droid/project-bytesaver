/**
 * carbon.test.js — Unit Tests for carbon.js
 * Project ByteSaver
 *
 * No test framework required. Runs in browser via tests/tests.html.
 * Uses a minimal assert() / assertEqual() helper.
 *
 * Test categories:
 *  1. Core conversion math (happy path)
 *  2. Input validation & edge cases (0, negative, NaN, Infinity, string)
 *  3. getEquivalencies composite function
 *  4. entrytoCO2Kg dispatch function
 *  5. totalCO2Kg aggregation function
 *  6. Precision / large-value accuracy
 */

import {
  gbToCO2Kg,
  mbToCO2Kg,
  emailsToCO2Kg,
  co2ToKmDriven,
  co2ToPhones,
  co2ToTrees,
  getEquivalencies,
  entrytoCO2Kg,
  totalCO2Kg,
} from '../js/utils/carbon.js';

// ── Test Runner ───────────────────────────────────────────────
const results = [];

/**
 * Asserts that |actual - expected| <= tolerance.
 * @param {string} description
 * @param {number} actual
 * @param {number} expected
 * @param {number} [tolerance=0]
 */
function assert(description, actual, expected, tolerance = 0) {
  const pass = Math.abs(actual - expected) <= tolerance;
  results.push({ description, actual, expected, pass });
  return pass;
}

/**
 * Asserts strict equality (===).
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
 * Asserts that actual is true.
 * @param {string} description
 * @param {boolean} actual
 */
function assertTruthy(description, actual) {
  const pass = Boolean(actual);
  results.push({ description, actual, expected: true, pass });
  return pass;
}

// ══════════════════════════════════════════════════════════════
// 1. CORE CONVERSION MATH
// ══════════════════════════════════════════════════════════════

// gbToCO2Kg
assert('gbToCO2Kg(4) === 1.0',           gbToCO2Kg(4),    1.0,   0.0001);
assert('gbToCO2Kg(1) === 0.25',          gbToCO2Kg(1),    0.25,  0.0001);
assert('gbToCO2Kg(0.5) === 0.125',       gbToCO2Kg(0.5),  0.125, 0.0001);
assert('gbToCO2Kg(40) === 10.0',         gbToCO2Kg(40),   10.0,  0.001);

// mbToCO2Kg
assert('mbToCO2Kg(1024) === 0.25',       mbToCO2Kg(1024), 0.25,  0.0001);
assert('mbToCO2Kg(512) === 0.125',       mbToCO2Kg(512),  0.125, 0.0001);
assert('mbToCO2Kg(2048) === 0.5',        mbToCO2Kg(2048), 0.5,   0.0001);

// emailsToCO2Kg
assert('emailsToCO2Kg(1000) === 0.004',  emailsToCO2Kg(1000),  0.004,    0.00001);
assert('emailsToCO2Kg(1) === 0.000004',  emailsToCO2Kg(1),     0.000004, 0.000000001);
assert('emailsToCO2Kg(10000) === 0.04',  emailsToCO2Kg(10000), 0.04,     0.0001);

// co2ToKmDriven
assert('co2ToKmDriven(5) === 20',        co2ToKmDriven(5),  20,  0.0001);
assert('co2ToKmDriven(1) === 4',         co2ToKmDriven(1),  4,   0.0001);
assert('co2ToKmDriven(0.25) === 1',      co2ToKmDriven(0.25), 1, 0.0001);

// co2ToPhones
assert('co2ToPhones(1) === 120',         co2ToPhones(1),    120,  0.0001);
assert('co2ToPhones(0.5) === 60',        co2ToPhones(0.5),  60,   0.0001);
assert('co2ToPhones(10) === 1200',       co2ToPhones(10),   1200, 0.001);

// co2ToTrees
assert('co2ToTrees(40) === 2',           co2ToTrees(40),    2,    0.0001);
assert('co2ToTrees(20) === 1',           co2ToTrees(20),    1,    0.0001);
assert('co2ToTrees(10) === 0.5',         co2ToTrees(10),    0.5,  0.0001);

// ══════════════════════════════════════════════════════════════
// 2. INPUT VALIDATION & EDGE CASES
// ══════════════════════════════════════════════════════════════

// Zero inputs
assert('gbToCO2Kg(0) === 0',             gbToCO2Kg(0),    0, 0);
assert('mbToCO2Kg(0) === 0',             mbToCO2Kg(0),    0, 0);
assert('emailsToCO2Kg(0) === 0',         emailsToCO2Kg(0),0, 0);
assert('co2ToKmDriven(0) === 0',         co2ToKmDriven(0),0, 0);
assert('co2ToPhones(0) === 0',           co2ToPhones(0),  0, 0);
assert('co2ToTrees(0) === 0',            co2ToTrees(0),   0, 0);

// Negative guard — all functions return 0 for negatives
assert('gbToCO2Kg(-5) guarded → 0',     gbToCO2Kg(-5),    0, 0);
assert('mbToCO2Kg(-512) guarded → 0',   mbToCO2Kg(-512),  0, 0);
assert('emailsToCO2Kg(-100) → 0',       emailsToCO2Kg(-100), 0, 0);
assert('co2ToKmDriven(-1) → 0',         co2ToKmDriven(-1), 0, 0);
assert('co2ToPhones(-1) → 0',           co2ToPhones(-1),   0, 0);
assert('co2ToTrees(-1) → 0',            co2ToTrees(-1),    0, 0);

// NaN inputs
assert('gbToCO2Kg(NaN) → 0',            gbToCO2Kg(NaN),   0, 0);
assert('mbToCO2Kg(NaN) → 0',            mbToCO2Kg(NaN),   0, 0);
assert('emailsToCO2Kg(NaN) → 0',        emailsToCO2Kg(NaN), 0, 0);
assert('co2ToKmDriven(NaN) → 0',        co2ToKmDriven(NaN), 0, 0);
assert('co2ToPhones(NaN) → 0',          co2ToPhones(NaN),  0, 0);
assert('co2ToTrees(NaN) → 0',           co2ToTrees(NaN),   0, 0);

// String inputs (type guard)
assert('gbToCO2Kg("abc") → 0',          gbToCO2Kg('abc'), 0, 0);
assert('mbToCO2Kg("1024") → 0',         mbToCO2Kg('1024'), 0, 0);

// ══════════════════════════════════════════════════════════════
// 3. getEquivalencies COMPOSITE FUNCTION
// ══════════════════════════════════════════════════════════════

const eq10 = getEquivalencies(10);
assert('getEquivalencies(10).km === 40',     eq10.km,     40,   0.0001);
assert('getEquivalencies(10).phones === 1200', eq10.phones, 1200, 0.001);
assert('getEquivalencies(10).trees === 0.5', eq10.trees,  0.5,  0.0001);

const eq0 = getEquivalencies(0);
assert('getEquivalencies(0).km === 0',       eq0.km,     0, 0);
assert('getEquivalencies(0).phones === 0',   eq0.phones, 0, 0);
assert('getEquivalencies(0).trees === 0',    eq0.trees,  0, 0);

// Returns an object with all three keys
assertTruthy(
  'getEquivalencies returns object with km, phones, trees keys',
  typeof eq10 === 'object' && 'km' in eq10 && 'phones' in eq10 && 'trees' in eq10
);

// ══════════════════════════════════════════════════════════════
// 4. entrytoCO2Kg DISPATCH FUNCTION
// ══════════════════════════════════════════════════════════════

assert(
  'entrytoCO2Kg({ unit:"GB", value:4 }) === 1.0',
  entrytoCO2Kg({ unit: 'GB', value: 4 }),
  1.0,
  0.0001
);

assert(
  'entrytoCO2Kg({ unit:"MB", value:1024 }) === 0.25',
  entrytoCO2Kg({ unit: 'MB', value: 1024 }),
  0.25,
  0.0001
);

assert(
  'entrytoCO2Kg({ unit:"EMAIL", value:500 }) === 0.002',
  entrytoCO2Kg({ unit: 'EMAIL', value: 500 }),
  0.002,
  0.000001
);

assertEqual(
  'entrytoCO2Kg with unknown unit returns 0',
  entrytoCO2Kg({ unit: 'UNKNOWN', value: 5 }),
  0
);

assertEqual(
  'entrytoCO2Kg(null) returns 0 (null guard)',
  entrytoCO2Kg(null),
  0
);

assertEqual(
  'entrytoCO2Kg with negative value returns 0',
  entrytoCO2Kg({ unit: 'GB', value: -10 }),
  0
);

// ══════════════════════════════════════════════════════════════
// 5. totalCO2Kg AGGREGATION FUNCTION
// ══════════════════════════════════════════════════════════════

assert(
  'totalCO2Kg([{GB,4},{MB,1024}]) === 1.25',
  totalCO2Kg([{ unit: 'GB', value: 4 }, { unit: 'MB', value: 1024 }]),
  1.25,
  0.0001
);

assertEqual('totalCO2Kg([]) === 0',    totalCO2Kg([]),   0);
assertEqual('totalCO2Kg(null) === 0',  totalCO2Kg(null), 0);

assert(
  'totalCO2Kg single GB entry',
  totalCO2Kg([{ unit: 'GB', value: 8 }]),
  2.0,
  0.0001
);

assert(
  'totalCO2Kg mixed entries sum correctly',
  totalCO2Kg([
    { unit: 'GB',    value: 4    },   // 1.0 kg
    { unit: 'MB',    value: 2048 },   // 0.5 kg
    { unit: 'EMAIL', value: 1000 },   // 0.004 kg
  ]),
  1.504,
  0.0001
);

assertEqual(
  'totalCO2Kg ignores unknown units gracefully',
  totalCO2Kg([{ unit: 'UNKNOWN', value: 100 }]),
  0
);

// ══════════════════════════════════════════════════════════════
// 6. PRECISION / LARGE-VALUE ACCURACY
// ══════════════════════════════════════════════════════════════

assert('gbToCO2Kg(1000) === 250',      gbToCO2Kg(1000),    250,  0.001);
assert('mbToCO2Kg(1000000) === 244.14', mbToCO2Kg(1000000), 244.140625, 0.001);
assert('co2ToPhones(100) === 12000',   co2ToPhones(100),   12000, 0.001);
assert('emailsToCO2Kg(1000000) === 4', emailsToCO2Kg(1000000), 4, 0.0001);

// Floating point stability: 1 GB = 4 × 1024 MB
const byGB = gbToCO2Kg(1);
const byMB = mbToCO2Kg(1024);
assert(
  'gbToCO2Kg(1) and mbToCO2Kg(1024) agree to 10 decimal places',
  byGB,
  byMB,
  1e-10
);

// ── Export Results ────────────────────────────────────────────
/**
 * Returns all test result objects.
 * @returns {Array<{description:string, actual:*, expected:*, pass:boolean}>}
 */
export function getTestResults() {
  return results;
}

/**
 * Returns a summary of pass/fail counts.
 * @returns {{ pass: number, fail: number, total: number }}
 */
export function runSummary() {
  const pass  = results.filter((r) => r.pass).length;
  const total = results.length;
  return { pass, fail: total - pass, total };
}
