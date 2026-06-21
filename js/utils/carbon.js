/**
 * carbon.js — Pure carbon footprint math utilities
 * Project ByteSaver
 *
 * All functions are pure (no side effects) and fully unit-testable.
 * Sources:
 *  - 1 GB stored data ≈ 0.25 kg CO₂/year (IEA, 2022)
 *  - 1 email ≈ 4 g CO₂ (Mike Berners-Lee, "How Bad Are Bananas?")
 *  - 1 kg CO₂ ≈ 4 km driven in average gas car (EPA)
 *  - 1 kg CO₂ ≈ 120 smartphone charges (Carbon Trust)
 *  - 20 kg CO₂ = 1 mature tree absorbs per year (USDA Forest Service)
 */

/**
 * Converts gigabytes of deleted data to kilograms of CO₂ saved.
 * @param {number} gb - Gigabytes deleted
 * @returns {number} kg of CO₂ saved
 */
export function gbToCO2Kg(gb) {
  if (typeof gb !== 'number' || isNaN(gb) || gb < 0) return 0;
  return gb * 0.25;
}

/**
 * Converts megabytes of deleted data to kilograms of CO₂ saved.
 * @param {number} mb - Megabytes deleted
 * @returns {number} kg of CO₂ saved
 */
export function mbToCO2Kg(mb) {
  if (typeof mb !== 'number' || isNaN(mb) || mb < 0) return 0;
  return (mb / 1024) * 0.25;
}

/**
 * Converts number of deleted emails to kilograms of CO₂ saved.
 * @param {number} count - Number of emails deleted
 * @returns {number} kg of CO₂ saved
 */
export function emailsToCO2Kg(count) {
  if (typeof count !== 'number' || isNaN(count) || count < 0) return 0;
  // Each email ≈ 4 grams = 0.000004 kg CO₂
  return count * 0.000004;
}

/**
 * Converts kg of CO₂ to equivalent kilometers driven in an average gas car.
 * @param {number} kg - Kilograms of CO₂
 * @returns {number} Kilometers driven equivalent
 */
export function co2ToKmDriven(kg) {
  if (typeof kg !== 'number' || isNaN(kg) || kg < 0) return 0;
  return kg * 4;
}

/**
 * Converts kg of CO₂ to equivalent number of smartphones fully charged.
 * @param {number} kg - Kilograms of CO₂
 * @returns {number} Number of smartphone charges
 */
export function co2ToPhones(kg) {
  if (typeof kg !== 'number' || isNaN(kg) || kg < 0) return 0;
  return kg * 120;
}

/**
 * Converts kg of CO₂ to equivalent mature trees needed for one year of absorption.
 * @param {number} kg - Kilograms of CO₂
 * @returns {number} Number of trees (fractional)
 */
export function co2ToTrees(kg) {
  if (typeof kg !== 'number' || isNaN(kg) || kg < 0) return 0;
  return kg / 20;
}

/**
 * Converts kg of CO₂ saved into a combined equivalency object.
 * @param {number} kg - Total kilograms of CO₂ saved
 * @returns {{ km: number, phones: number, trees: number }}
 */
export function getEquivalencies(kg) {
  return {
    km: co2ToKmDriven(kg),
    phones: co2ToPhones(kg),
    trees: co2ToTrees(kg),
  };
}

/**
 * Calculates total CO₂ saved from a cleanup log entry.
 * @param {{ unit: 'GB'|'MB'|'EMAIL', value: number }} entry
 * @returns {number} kg CO₂
 */
export function entrytoCO2Kg(entry) {
  if (!entry || entry.value < 0) return 0;
  switch (entry.unit) {
    case 'GB':    return gbToCO2Kg(entry.value);
    case 'MB':    return mbToCO2Kg(entry.value);
    case 'EMAIL': return emailsToCO2Kg(entry.value);
    default:      return 0;
  }
}

/**
 * Sums CO₂ across an array of log entries.
 * @param {Array<{ unit: string, value: number }>} entries
 * @returns {number} total kg CO₂
 */
export function totalCO2Kg(entries) {
  if (!Array.isArray(entries)) return 0;
  return entries.reduce((sum, e) => sum + entrytoCO2Kg(e), 0);
}
