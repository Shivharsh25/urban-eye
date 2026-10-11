/**
 * Severity Classification Service (Percentage Form & Continuous Sizing)
 * Calculates severity percentage (15% to 99%) based on:
 * - Physical bounding box dimensions (width, height, area)
 * - Category hazard multiplier (pothole vs garbage)
 * - Citizen complaint repetition (community surge)
 * 
 * Returns percentage string format e.g. '85%', '54%', '24%'
 */

const SEVERITY_CONFIG = {
  typeWeights: {
    pothole: 1.20,      // Direct vehicular accident and cyclist hazard
    garbage: 1.05       // Sanitation, vermin, and public health hazard
  }
};

/**
 * Calculates severity percentage for a detection
 * @param {Object} params
 * @param {string} params.type - pothole | garbage
 * @param {number} params.confidence - detection confidence (0-1)
 * @param {Object} params.bbox - { x, y, width, height }
 * @param {number} params.reportCount - number of citizen reports (default 1)
 * @returns {string} e.g. '85%'
 */
function calculateSeverity({ type = 'pothole', confidence = 0.85, bbox = {}, reportCount = 1 }) {
  const width = Number(bbox.width) || 120;
  const height = Number(bbox.height) || 120;
  const area = width * height;
  const maxDim = Math.max(width, height);
  const typeWeight = SEVERITY_CONFIG.typeWeights[type] || 1.10;

  // 1. Continuous physical footprint baseline (15% to 75%)
  let physicalScore = 15;
  if (area < 25000 && maxDim <= 180) {
    physicalScore = 18 + (area / 25000) * 10; // 18% - 28%
  } else if (area < 60000 && maxDim <= 300) {
    physicalScore = 30 + ((area - 25000) / 35000) * 25; // 30% - 55%
  } else if (area < 120000 && maxDim <= 400) {
    physicalScore = 55 + ((area - 60000) / 60000) * 25; // 55% - 80%
  } else {
    // Massive span / area (> 120,000 px²)
    const excess = Math.min(1.0, (area - 120000) / 400000);
    physicalScore = 80 + excess * 15; // 80% - 95%
  }

  // Dimension span booster (e.g. wide road cracks / elongated defects spanning >= 380 px)
  if (maxDim >= 380 && physicalScore < 75) {
    physicalScore = Math.max(physicalScore, 75);
  }

  // 2. Apply Issue Category Multiplier
  let score = physicalScore * typeWeight;

  // 3. Citizen Community Urgency Escalation
  if (reportCount >= 4) {
    score += 30;
  } else if (reportCount === 3) {
    score += 20;
  } else if (reportCount === 2) {
    score += 12;
  }

  // Round and clamp between 15% and 99%
  const finalPercentage = Math.min(99, Math.max(15, Math.round(score)));
  return `${finalPercentage}%`;
}

/**
 * Extracts numeric percentage integer (15 - 99)
 */
function getSeverityNumber(severity) {
  const n = parseInt(severity);
  if (!isNaN(n)) return n;
  const s = String(severity || '').toLowerCase();
  if (s === 'high' || s === 'critical') return 85;
  if (s === 'medium') return 55;
  if (s === 'low') return 25;
  return 50;
}

/**
 * Maps percentage to categorical tier for badge colors: 'low' | 'medium' | 'high'
 */
function getSeverityTier(severity) {
  const num = getSeverityNumber(severity);
  if (num >= 70) return 'high';
  if (num >= 40) return 'medium';
  return 'low';
}

/**
 * Compares two severity strings to check if escalation occurred
 */
function isEscalated(oldSeverity, newSeverity) {
  return getSeverityNumber(newSeverity) > getSeverityNumber(oldSeverity);
}

module.exports = {
  calculateSeverity,
  getSeverityNumber,
  getSeverityTier,
  isEscalated,
  SEVERITY_CONFIG
};
