const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'urban_eye_jwt_secret_key_2026_secure';

/**
 * Middleware: Verify JWT Bearer token and attach authenticated user with role and department
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id || decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid session. User not found.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended by municipal administrator.' });
    }

    req.user = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      departmentId: user.departmentId || null,
      departmentName: user.departmentName || null,
      status: user.status || 'active'
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

/**
 * Middleware: Require admin role (backward-compatible: accepts both legacy 'admin' and 'super_admin')
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }

  next();
}

/**
 * Middleware: Strictly require Super Admin role
 */
function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Access denied. Super Administrator privileges required.' });
  }

  next();
}

/**
 * Middleware: Strictly require Department Admin role and ensure departmentId is attached
 */
function requireDepartmentAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.role !== 'department_admin') {
    return res.status(403).json({ error: 'Access denied. Department Administrator privileges required.' });
  }

  if (!req.user.departmentId) {
    return res.status(403).json({ error: 'Access denied. Administrator is not linked to any municipal department.' });
  }

  next();
}

/**
 * Reusable role checker
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}` });
    }

    next();
  };
}

/**
 * Helper to sign JWT tokens with role and departmentId
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      departmentId: user.departmentId || null,
      departmentName: user.departmentName || null
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  requireDepartmentAdmin,
  requireRole,
  generateToken,
  JWT_SECRET
};
