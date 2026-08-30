/**
 * Severity Classification Service
 * Rule-based downstream classifier evaluating:
 * - Detection confidence (0.0 - 1.0)
 * - Bounding box area / size
 * - Citizen report count (community urgency signal)
 * - Issue category base hazards
 * 
 * Returns 'low' | 'medium' | 'high'
 */

// Tunable thresholds
const SEVERITY_CONFIG = {
  // Base weights by issue type
  typeWeights: {
    water_leak: 1.25,   // Water leaks can flood and damage infrastructure quickly
    pothole: 1.15,      // Vehicle and road safety hazard
    streetlight: 1.10,  // Night visibility and public safety hazard
    garbage: 1.00       // Sanitation and health hazard
  },
  // Bounding box area thresholds (assuming normalized or pixel dimensions)
  bboxAreaMedium: 25000, // e.g. > ~160x160 pixels
  bboxAreaLarge: 70000,  // e.g. > ~265x265 pixels
  // Confidence thresholds
  highConfidence: 0.85,
  mediumConfidence: 0.65,
  // Report count escalation triggers
  escalateMediumReports: 2, // 2 or more citizen reports push to at least 'medium'
  escalateHighReports: 4    // 4 or more citizen reports push to 'high'
};

/**
 * Calculates severity level for a detection
 * @param {Object} params
 * @param {string} params.type - pothole | garbage | water_leak | streetlight
 * @param {number} params.confidence - detection confidence (0-1)
 * @param {Object} params.bbox - { x, y, width, height }
 * @param {number} params.reportCount - number of citizen reports (default 1)
 * @returns {'low' | 'medium' | 'high'}
 */
function calculateSeverity({ type = 'pothole', confidence = 0.85, bbox = {}, reportCount = 1 }) {
  const width = bbox.width || 100;
  const height = bbox.height || 100;
  const area = width * height;
  const typeWeight = SEVERITY_CONFIG.typeWeights[type] || 1.0;

  // Compute composite score (0 to 100)
  let score = 0;

  // 1. Confidence Contribution (up to 35 points)
  if (confidence >= SEVERITY_CONFIG.highConfidence) {
    score += 35;
  } else if (confidence >= SEVERITY_CONFIG.mediumConfidence) {
    score += 25;
  } else {
    score += 15;
  }

  // 2. Physical Size / Bounding Box Area Contribution (up to 35 points)
  if (area >= SEVERITY_CONFIG.bboxAreaLarge) {
    score += 35;
  } else if (area >= SEVERITY_CONFIG.bboxAreaMedium) {
    score += 25;
  } else {
    score += 15;
  }

  // Apply issue type urgency multiplier
  score = score * typeWeight;

  // 3. Citizen Report Count / Community Urgency Escalation (up to 30+ points)
  if (reportCount >= SEVERITY_CONFIG.escalateHighReports) {
    score += 35;
  } else if (reportCount >= SEVERITY_CONFIG.escalateMediumReports) {
    score += 20;
  }

  // Final classification thresholds
  if (score >= 75 || reportCount >= SEVERITY_CONFIG.escalateHighReports) {
    return 'high';
  } else if (score >= 45 || reportCount >= SEVERITY_CONFIG.escalateMediumReports) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Compares two severity strings to check if escalation occurred
 * @returns {boolean} true if newSeverity is higher than oldSeverity
 */
function isEscalated(oldSeverity, newSeverity) {
  const levels = { low: 1, medium: 2, high: 3 };
  const oldRank = levels[oldSeverity] || 1;
  const newRank = levels[newSeverity] || 1;
  return newRank > oldRank;
}

module.exports = {
  calculateSeverity,
  isEscalated,
  SEVERITY_CONFIG
};
