/**
 * Statistics & Command Center Metrics Routes
 * - GET /api/stats/summary (Admin only)
 */

const express = require('express');
const router = express.Router();

const db = require('../config/database');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/summary', requireAuth, requireAdmin, async (req, res) => {
  try {
    const summary = await db.getStatsSummary();
    return res.json(summary);
  } catch (err) {
    console.error('[Stats API] Summary error:', err);
    return res.status(500).json({ error: 'Failed to compute stats summary.' });
  }
});

/**
 * GET /api/stats/public-summary
 * Publicly accessible stats for the login page
 */
router.get('/public-summary', async (req, res) => {
  try {
    const summary = await db.getStatsSummary();
    const activeCitizens = await db.User.find({ role: 'user' });
    
    return res.json({
      activeCitizens: activeCitizens.length,
      issuesResolved: summary.statusCounts.resolved,
    });
  } catch (err) {
    console.error('[Stats API] Public summary error:', err);
    return res.status(500).json({ error: 'Failed to compute public summary.' });
  }
});

/**
 * GET /api/stats/user-summary
 * Personal stats for the citizen dashboard
 */
router.get('/user-summary', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    // Find detections submitted by this user or where they are in reporterIds
    const dbDetections = await db.Detection.find({});
    const userReports = dbDetections.filter(d => 
      d.submittedBy === userId || (d.reporterIds && d.reporterIds.includes(userId))
    );
    
    const resolvedReports = userReports.filter(d => d.status === 'resolved');
    
    // Calculate a dummy trust score based on report count and resolution
    // Base 80, +2 for every valid report, cap at 99
    let trustScore = 80 + (resolvedReports.length * 2);
    if (trustScore > 99) trustScore = 99;
    if (userReports.length === 0) trustScore = 0; // Or keep at 80 for new users
    
    return res.json({
      totalReports: userReports.length,
      resolvedReports: resolvedReports.length,
      trustScore: userReports.length > 0 ? trustScore : 0,
      recentContributions: userReports.slice(-5).reverse()
    });
  } catch (err) {
    console.error('[Stats API] User summary error:', err);
    return res.status(500).json({ error: 'Failed to compute user summary.' });
  }
});

module.exports = router;
