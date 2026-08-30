/**
 * Geospatial Duplicate Clustering & Merge Service
 * - Queries for open issues of the same type within 50 meters and 30 days.
 * - Clusters reports, increments report counts, and triggers escalation updates.
 */

const Detection = require('../models/Detection');
const { calculateSeverity, isEscalated } = require('./severityService');

const CLUSTER_DISTANCE_METERS = 50;
const CLUSTER_WINDOW_DAYS = 30;

/**
 * Checks for existing open duplicates and handles merging or flagging as new.
 * @param {Object} params
 * @param {string} params.type - Issue category
 * @param {number} params.lat - Latitude
 * @param {number} params.lng - Longitude
 * @param {number} params.confidence - Confidence of new detection
 * @param {Object} params.bbox - Bounding box
 * @param {string} params.userId - Submitting user ID
 * @returns {Promise<{ isDuplicate: boolean, detection: Object, escalated: boolean, previousSeverity?: string }>}
 */
async function processDuplicateCheck({ type, lat, lng, confidence, bbox, userId }) {
  const existing = await Detection.findNearbyOpen({
    type,
    lat,
    lng,
    maxDistanceMeters: CLUSTER_DISTANCE_METERS,
    maxAgeDays: CLUSTER_WINDOW_DAYS
  });

  if (!existing) {
    // Brand new issue
    const severity = calculateSeverity({
      type,
      confidence,
      bbox,
      reportCount: 1
    });

    return {
      isDuplicate: false,
      calculatedSeverity: severity
    };
  }

  // Duplicate found! Merge report into existing record
  const oldSeverity = existing.severity || 'low';
  const newReportCount = (existing.reportCount || 1) + 1;
  const currentReporters = existing.reporterIds || [];

  if (userId && !currentReporters.includes(userId)) {
    currentReporters.push(userId);
  }

  // Recalculate severity with new higher report count
  const newSeverity = calculateSeverity({
    type: existing.type,
    confidence: Math.max(existing.confidence || 0.85, confidence || 0.85),
    bbox: bbox || existing.bbox,
    reportCount: newReportCount
  });

  const escalated = isEscalated(oldSeverity, newSeverity);

  const updates = {
    reportCount: newReportCount,
    reporterIds: currentReporters,
    lastReportedAt: new Date().toISOString(),
    severity: newSeverity
  };

  const updatedDetection = await Detection.updateById(existing.id || existing._id, updates);

  return {
    isDuplicate: true,
    detection: updatedDetection,
    escalated,
    previousSeverity: oldSeverity,
    newSeverity
  };
}

module.exports = {
  processDuplicateCheck,
  CLUSTER_DISTANCE_METERS,
  CLUSTER_WINDOW_DAYS
};
