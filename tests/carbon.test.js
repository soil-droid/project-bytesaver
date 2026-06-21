/**
 * carbon.test.js — Unit Tests for carbon.js
 * Project ByteSaver
 *
 * No test framework required. Runs in browser via tests/tests.html.
 * Uses a minimal assert() helper.
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

function assert(description, actual, expected, tolerance = 0) {
  const pass = Math.abs(actual - expected) <= tolerance;
  results.push({ description, actual, expected, pass });
  return pass;
}

function assertEqual(description, actual, expected) {
  const pass = actual === expected;
  results.push({ description, actual, expected, pass });
  return pass;
}

// ── Core Math Tests ───────────────────────────────────────────

// TEST 1: GB to CO₂
assert(
  'gbToCO2Kg(4) === 1.0',
  gbToCO2Kg(4),
  1.0,
  0.0001
);

// TEST 2: MB to CO₂
assert(
  'mbToCO2Kg(1024) === 0.25',
  mbToCO2Kg(1024),
  0.25,
  0.0001
);

// TEST 3: km driven
assert(
  'co2ToKmDriven(5) === 20',
  co2ToKmDriven(5),
  20,
  0.0001
);

// TEST 4: phones charged
assert(
  'co2ToPhones(1) === 120',
  co2ToPhones(1),
  120,
  0.0001
);

// TEST 5: trees per year
assert(
  'co2ToTrees(40) === 2',
  co2ToTrees(40),
  2,
  0.0001
);

// TEST 6: emails to CO₂
assert(
  'emailsToCO2Kg(1000) === 0.004',
  emailsToCO2Kg(1000),
  0.004,
  0.00001
);

// ── Edge Case Tests ───────────────────────────────────────────

// TEST 7: Zero input returns 0
assert(
  'gbToCO2Kg(0) === 0',
  gbToCO2Kg(0),
  0,
  0
);

// TEST 8: Negative input returns 0 (safe guard)
assert(
  'gbToCO2Kg(-5) === 0 (negative guard)',
  gbToCO2Kg(-5),
  0,
  0
);

// TEST 9: NaN input returns 0
assert(
  'gbToCO2Kg(NaN) === 0',
  gbToCO2Kg(NaN),
  0,
  0
);

// TEST 10: getEquivalencies returns correct object
const eq = getEquivalencies(10);
assert(
  'getEquivalencies(10).km === 40',
  eq.km,
  40,
  0.0001
);
assert(
  'getEquivalencies(10).phones === 1200',
  eq.phones,
  1200,
  0.0001
);
assert(
  'getEquivalencies(10).trees === 0.5',
  eq.trees,
  0.5,
  0.0001
);

// TEST 11: entrytoCO2Kg
assert(
  'entrytoCO2Kg({ unit: "GB", value: 4 }) === 1.0',
  entrytoCO2Kg({ unit: 'GB', value: 4 }),
  1.0,
  0.0001
);

assert(
  'entrytoCO2Kg({ unit: "EMAIL", value: 500 }) === 0.002',
  entrytoCO2Kg({ unit: 'EMAIL', value: 500 }),
  0.002,
  0.000001
);

assertEqual(
  'entrytoCO2Kg with unknown unit returns 0',
  entrytoCO2Kg({ unit: 'UNKNOWN', value: 5 }),
  0
);

// TEST 12: totalCO2Kg
assert(
  'totalCO2Kg([{unit:"GB",value:4},{unit:"MB",value:1024}]) === 1.25',
  totalCO2Kg([{ unit: 'GB', value: 4 }, { unit: 'MB', value: 1024 }]),
  1.25,
  0.0001
);

assertEqual(
  'totalCO2Kg([]) === 0',
  totalCO2Kg([]),
  0
);

assertEqual(
  'totalCO2Kg(null) === 0',
  totalCO2Kg(null),
  0
);

// TEST 13: Large value accuracy
assert(
  'gbToCO2Kg(1000) === 250',
  gbToCO2Kg(1000),
  250,
  0.001
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
