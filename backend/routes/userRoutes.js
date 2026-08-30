const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/users
 * Admin only: Get all users
 */
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    // Exclude password hashes
    const sanitizedUsers = users.map(user => ({
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));
    return res.json({ users: sanitizedUsers });
  } catch (err) {
    console.error('[User API] List users error:', err);
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

/**
 * PATCH /api/users/:id/role
 * Admin only: Update a user's role
 */
router.patch('/:id/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user', 'citizen'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role provided.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updatedUser = await User.updateById(id, { role });
    
    return res.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.id || updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (err) {
    console.error('[User API] Update user role error:', err);
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
});

module.exports = router;
