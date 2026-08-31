const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { emitAnnouncement } = require('../services/socketService');

// @route   GET /api/announcements
// @desc    Get all active announcements
// @access  Public
router.get('/', async (req, res) => {
  try {
    const announcements = await db.Announcement.find({ active: true });
    // Sort by newest first
    announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching announcements' });
  }
});

// @route   POST /api/announcements
// @desc    Create a new announcement
// @access  Private/Admin
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const announcement = await db.Announcement.create({
      title,
      message,
      type: type || 'info'
    });

    // Broadcast the announcement
    emitAnnouncement(announcement);

    res.status(201).json(announcement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating announcement' });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private/Admin
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await db.Announcement.deleteById(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json({ message: 'Announcement removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting announcement' });
  }
});

module.exports = router;
