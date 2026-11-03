/**
 * Super Admin Management API Routes
 * Role-guarded platform administration for Urban EYE
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const Department = require('../models/Department');
const AdminRequest = require('../models/AdminRequest');
const User = require('../models/User');
const Detection = require('../models/Detection');
const RoutingRule = require('../models/RoutingRule');
const AuditLog = require('../models/AuditLog');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');
const { isModelAvailable } = require('../services/yoloInferenceService');

// All routes here strictly require Super Admin authentication
router.use(requireAuth, requireSuperAdmin);

// Helper for audit logging
async function logAudit(req, action, targetEntity, targetId, details = {}) {
  try {
    await AuditLog.create({
      action,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetEntity,
      targetId,
      details,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });
  } catch (err) {
    console.warn('[AuditLog] Failed to record audit log:', err.message);
  }
}

/**
 * GET /api/super-admin/stats
 * Super Admin Dashboard Platform Analytics
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalReports,
      departments,
      activeAdmins,
      pendingRequests,
      detections,
      flaggedReports
    ] = await Promise.all([
      Detection.countDocuments(),
      Department.find(),
      User.countDocuments({ role: 'department_admin', status: 'active' }),
      AdminRequest.countDocuments({ status: 'pending' }),
      Detection.find().select('status assignedDepartment departmentId type needsReview createdAt reviewReason confidence address location id imageUrl'),
      Detection.find({ $or: [{ needsReview: true }, { status: 'needs_review' }] }).sort({ createdAt: -1 }).limit(10)
    ]);

    // Calculate auto-routing success rate
    const routedCount = detections.filter(d => !d.needsReview && d.assignedDepartment).length;
    const autoRoutingRate = detections.length > 0
      ? Math.round((routedCount / detections.length) * 100)
      : 100;

    // Reports by department breakdown
    const deptStats = {};
    for (const dept of departments) {
      deptStats[dept.id] = { total: 0, open: 0, inProgress: 0, resolved: 0 };
    }

    for (const d of detections) {
      const matchedDept = departments.find(dept => 
        (d.departmentId && (dept.id === d.departmentId || dept._id.toString() === d.departmentId)) ||
        (d.assignedDepartment && dept.name === d.assignedDepartment) ||
        (d.type && dept.categories && dept.categories.includes(d.type.toLowerCase()))
      );
      if (matchedDept && deptStats[matchedDept.id]) {
        deptStats[matchedDept.id].total++;
        if (d.status === 'resolved') deptStats[matchedDept.id].resolved++;
        else if (d.status === 'in_progress') deptStats[matchedDept.id].inProgress++;
        else deptStats[matchedDept.id].open++;
      }
    }

    const departmentBreakdown = departments.map(dept => ({
      id: dept.id || dept._id,
      name: dept.name,
      code: dept.code,
      total: deptStats[dept.id]?.total || 0,
      open: deptStats[dept.id]?.open || 0,
      inProgress: deptStats[dept.id]?.inProgress || 0,
      resolved: deptStats[dept.id]?.resolved || 0,
      count: deptStats[dept.id]?.total || 0,
      slaHours: dept.slaHours,
      status: dept.status
    }));

    // Status distribution
    const statusCounts = {
      new: detections.filter(d => d.status === 'new').length,
      assigned: detections.filter(d => d.status === 'assigned').length,
      in_progress: detections.filter(d => d.status === 'in_progress').length,
      resolved: detections.filter(d => d.status === 'resolved').length,
      needs_review: detections.filter(d => d.needsReview || d.status === 'needs_review').length
    };

    const resolvedCount = statusCounts.resolved;
    const inProgressCount = statusCounts.in_progress;
    const pendingCount = statusCounts.new + statusCounts.assigned;
    const needsReviewCount = statusCounts.needs_review;

    return res.json({
      success: true,
      reports: {
        total: totalReports,
        resolved: resolvedCount,
        inProgress: inProgressCount,
        pending: pendingCount,
        needsReview: needsReviewCount
      },
      departments: {
        total: departments.length,
        active: departments.filter(d => d.status === 'active').length
      },
      admins: {
        total: activeAdmins,
        active: activeAdmins,
        pendingRequests
      },
      routing: {
        successRate: autoRoutingRate,
        autoRoutedRate: `${autoRoutingRate}%`,
        flaggedForReview: needsReviewCount
      },
      departmentBreakdown,
      flaggedReports,
      metrics: {
        totalReports,
        totalDepartments: departments.length,
        activeDepartments: departments.filter(d => d.status === 'active').length,
        activeAdmins,
        pendingRequests,
        autoRoutingRate: `${autoRoutingRate}%`,
        statusCounts,
        reportsByDepartment: departmentBreakdown,
        platformHealth: {
          status: 'healthy',
          yoloModelReady: isModelAvailable(),
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (err) {
    console.error('[SuperAdmin API] Stats error:', err);
    return res.status(500).json({ error: 'Failed to aggregate platform analytics.' });
  }
});

/**
 * GET /api/super-admin/departments
 * List all departments
 */
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    
    // Attach current report counts for each department
    const deptsWithMetrics = await Promise.all(departments.map(async (dept) => {
      const activeCount = await Detection.countDocuments({
        $or: [
          { departmentId: dept.id || dept._id },
          { assignedDepartment: dept.name }
        ],
        status: { $ne: 'resolved' }
      });
      const resolvedCount = await Detection.countDocuments({
        $or: [
          { departmentId: dept.id || dept._id },
          { assignedDepartment: dept.name }
        ],
        status: 'resolved'
      });
      return {
        ...dept.toObject(),
        activeReportsCount: activeCount,
        resolvedReportsCount: resolvedCount
      };
    }));

    return res.json({ departments: deptsWithMetrics });
  } catch (err) {
    console.error('[SuperAdmin API] Departments error:', err);
    return res.status(500).json({ error: 'Failed to fetch departments.' });
  }
});

/**
 * POST /api/super-admin/departments
 * Create new department
 */
router.post('/departments', async (req, res) => {
  try {
    const { name, code, description, categories, contactEmail, contactPhone, slaHours } = req.body;
    if (!name || !code || !contactEmail) {
      return res.status(400).json({ error: 'Department name, unique code, and contact email are required.' });
    }

    const cleanCode = code.toLowerCase().trim();
    const existing = await Department.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ error: `Department code '${cleanCode}' already exists.` });
    }

    const newDept = await Department.create({
      name: name.trim(),
      code: cleanCode,
      description: description || '',
      categories: Array.isArray(categories) ? categories : [],
      contactEmail: contactEmail.toLowerCase().trim(),
      contactPhone: contactPhone || '',
      slaHours: slaHours ? parseInt(slaHours, 10) : 48,
      status: 'active'
    });

    await logAudit(req, 'DEPARTMENT_CREATED', 'department', newDept.id || newDept._id, {
      name: newDept.name,
      code: newDept.code
    });

    return res.status(201).json({
      message: 'Department created successfully.',
      department: newDept
    });
  } catch (err) {
    console.error('[SuperAdmin API] Create department error:', err);
    return res.status(500).json({ error: 'Failed to create department.' });
  }
});

/**
 * PATCH /api/super-admin/departments/:id
 * Update or activate/deactivate department
 */
router.patch('/departments/:id', async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found.' });
    }

    const allowed = ['name', 'description', 'categories', 'contactEmail', 'contactPhone', 'slaHours', 'status'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updated = await Department.updateById(req.params.id, updates);

    await logAudit(req, 'DEPARTMENT_UPDATED', 'department', dept.id || dept._id, updates);

    return res.json({
      message: 'Department updated successfully.',
      department: updated
    });
  } catch (err) {
    console.error('[SuperAdmin API] Update department error:', err);
    return res.status(500).json({ error: 'Failed to update department.' });
  }
});

/**
 * GET /api/super-admin/requests
 * List department administrator applications
 */
router.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    const requests = await AdminRequest.find(query).sort({ createdAt: -1 });
    return res.json({ count: requests.length, requests });
  } catch (err) {
    console.error('[SuperAdmin API] Requests list error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin requests.' });
  }
});

/**
 * POST /api/super-admin/requests/:id/approve
 * Approve application: Activates department administrator account
 */
router.post('/requests/:id/approve', async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Admin application not found.' });
    }

    if (request.status === 'approved') {
      return res.status(400).json({ error: 'This application has already been approved.' });
    }

    const dept = await Department.findById(request.requestedDepartmentId);
    if (!dept) {
      return res.status(400).json({ error: 'Requested department no longer exists.' });
    }

    // 1. Create or activate User account
    let adminUser = await User.findOne({ email: request.email });
    if (!adminUser) {
      adminUser = await User.create({
        name: request.applicantName,
        email: request.email,
        phone: request.phone || '',
        passwordHash: request.passwordHash,
        role: 'department_admin',
        departmentId: dept.id || dept._id,
        departmentName: dept.name,
        status: 'active'
      });
    } else {
      adminUser.role = 'department_admin';
      adminUser.departmentId = dept.id || dept._id;
      adminUser.departmentName = dept.name;
      adminUser.status = 'active';
      adminUser.passwordHash = request.passwordHash;
      await adminUser.save();
    }

    // 2. Link as department head if unassigned
    if (!dept.headAdminId) {
      dept.headAdminId = adminUser.id || adminUser._id;
      dept.headAdminName = adminUser.name;
      await dept.save();
    }

    // 3. Update application status
    request.status = 'approved';
    request.reviewedBy = req.user.id;
    request.reviewedByName = req.user.name;
    request.reviewedAt = new Date();
    await request.save();

    await logAudit(req, 'ADMIN_REQUEST_APPROVED', 'admin_request', request.id || request._id, {
      applicant: request.applicantName,
      email: request.email,
      department: dept.name
    });

    return res.json({
      message: `Administrator application approved. Account activated for ${dept.name}.`,
      admin: {
        id: adminUser.id || adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        departmentName: dept.name
      }
    });
  } catch (err) {
    console.error('[SuperAdmin API] Approve request error:', err);
    return res.status(500).json({ error: 'Failed to approve application.' });
  }
});

/**
 * POST /api/super-admin/requests/:id/reject
 * Reject application with optional reason
 */
router.post('/requests/:id/reject', async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const request = await AdminRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Admin application not found.' });
    }

    request.status = 'rejected';
    request.rejectionReason = rejectionReason || 'Verification requirements not fulfilled.';
    request.reviewedBy = req.user.id;
    request.reviewedByName = req.user.name;
    request.reviewedAt = new Date();
    await request.save();

    await logAudit(req, 'ADMIN_REQUEST_REJECTED', 'admin_request', request.id || request._id, {
      applicant: request.applicantName,
      email: request.email,
      reason: request.rejectionReason
    });

    return res.json({
      message: 'Application rejected.',
      request
    });
  } catch (err) {
    console.error('[SuperAdmin API] Reject request error:', err);
    return res.status(500).json({ error: 'Failed to reject application.' });
  }
});

/**
 * GET /api/super-admin/admins
 * List all department administrators
 */
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find({ role: 'department_admin' })
      .select('id name email phone role departmentId departmentName status lastLoginAt createdAt')
      .sort({ createdAt: -1 });

    return res.json({ count: admins.length, admins });
  } catch (err) {
    console.error('[SuperAdmin API] Admins list error:', err);
    return res.status(500).json({ error: 'Failed to fetch department administrators.' });
  }
});

/**
 * PATCH /api/super-admin/admins/:id/status
 * Activate or suspend department administrator account
 */
router.patch('/admins/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Valid status required: active or suspended.' });
    }

    const adminUser = await User.findById(req.params.id);
    if (!adminUser || adminUser.role !== 'department_admin') {
      return res.status(404).json({ error: 'Department administrator not found.' });
    }

    adminUser.status = status;
    await adminUser.save();

    await logAudit(req, `ADMIN_STATUS_${status.toUpperCase()}`, 'user', adminUser.id || adminUser._id, {
      adminEmail: adminUser.email,
      status
    });

    return res.json({
      message: `Administrator account status updated to ${status}.`,
      admin: adminUser
    });
  } catch (err) {
    console.error('[SuperAdmin API] Update admin status error:', err);
    return res.status(500).json({ error: 'Failed to update administrator status.' });
  }
});

/**
 * GET /api/super-admin/reports
 * Global reports monitor across all departments
 */
router.get('/reports', async (req, res) => {
  try {
    const { department, departmentId, status, severity, search, needsReview } = req.query;
    const deptParam = departmentId || department;
    const query = {};

    if (deptParam && deptParam !== 'all') {
      const mongooseMod = require('mongoose');
      const orFind = [{ id: deptParam }];
      if (mongooseMod.Types.ObjectId.isValid(deptParam)) {
        orFind.push({ _id: deptParam });
      }
      orFind.push({ name: deptParam });
      orFind.push({ code: deptParam });

      const deptDoc = await Department.findOne({ $or: orFind });
      if (deptDoc) {
        query.$or = [
          { departmentId: deptDoc.id },
          { departmentId: deptDoc._id.toString() },
          { assignedDepartment: deptDoc.name },
          { assignedDepartment: new RegExp(deptDoc.code, 'i') },
          { type: { $in: deptDoc.categories || [] } }
        ];
      } else {
        query.$or = [{ departmentId: deptParam }, { assignedDepartment: deptParam }];
      }
    }
    if (status && status !== 'all') {
      if (status === 'pending' || status === 'open') {
        query.status = { $in: ['new', 'assigned', 'pending'] };
      } else {
        query.status = status;
      }
    }
    if (severity && severity !== 'all') {
      query.severity = severity;
    }
    if (needsReview === 'true') {
      query.$or = [{ needsReview: true }, { status: 'needs_review' }];
    }

    const reports = await Detection.find(query).sort({ createdAt: -1 });

    let filtered = reports;
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = reports.filter(r => 
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.address && r.address.toLowerCase().includes(q)) ||
        (r.type && r.type.toLowerCase().includes(q)) ||
        (r.assignedDepartment && r.assignedDepartment.toLowerCase().includes(q))
      );
    }

    return res.json({ count: filtered.length, reports: filtered });
  } catch (err) {
    console.error('[SuperAdmin API] Reports list error:', err);
    return res.status(500).json({ error: 'Failed to fetch global reports.' });
  }
});

/**
 * GET /api/super-admin/config/ai
 * AI Model status and routing rules configuration
 */
router.get('/config/ai', async (req, res) => {
  try {
    const rules = await RoutingRule.find().sort({ categoryKey: 1 });
    return res.json({
      model: {
        name: 'YOLOv8 Urban Defect Detector',
        format: 'ONNX WebAssembly Runtime',
        available: isModelAvailable(),
        version: '1.2.2-wasm',
        classes: ['pothole', 'garbage'],
        defaultConfidenceThreshold: 0.15
      },
      routingRules: rules
    });
  } catch (err) {
    console.error('[SuperAdmin API] AI Config error:', err);
    return res.status(500).json({ error: 'Failed to fetch AI configuration.' });
  }
});

/**
 * PATCH /api/super-admin/config/ai/rules/:id
 * Update category-to-department routing rule
 */
router.patch('/config/ai/rules/:id', async (req, res) => {
  try {
    const rule = await RoutingRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Routing rule not found.' });
    }

    const allowed = ['departmentId', 'departmentName', 'minConfidenceThreshold', 'defaultSeverity', 'autoDispatchEnabled'];
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        rule[k] = req.body[k];
      }
    }

    await rule.save();
    await logAudit(req, 'ROUTING_RULE_UPDATED', 'routing_rule', rule.id || rule._id, req.body);

    return res.json({ message: 'Routing rule updated successfully.', rule });
  } catch (err) {
    console.error('[SuperAdmin API] Update routing rule error:', err);
    return res.status(500).json({ error: 'Failed to update routing rule.' });
  }
});

/**
 * GET /api/super-admin/users
 * Manage citizen and admin user accounts
 */
router.get('/users', async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;

    const users = await User.find(query)
      .select('id name email phone role departmentName status createdAt lastLoginAt')
      .sort({ createdAt: -1 });

    let filtered = users;
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = users.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    }

    return res.json({ count: filtered.length, users: filtered });
  } catch (err) {
    console.error('[SuperAdmin API] Users list error:', err);
    return res.status(500).json({ error: 'Failed to fetch user accounts.' });
  }
});

/**
 * PATCH /api/super-admin/users/:id/status
 * Activate or suspend user account
 */
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Valid status required: active or suspended.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Protect against self-suspension of Super Admin
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot suspend your own Super Admin account.' });
    }

    user.status = status;
    await user.save();

    await logAudit(req, `USER_STATUS_${status.toUpperCase()}`, 'user', user.id || user._id, {
      userEmail: user.email,
      status
    });

    return res.json({ message: `User account status updated to ${status}.`, user });
  } catch (err) {
    console.error('[SuperAdmin API] Update user status error:', err);
    return res.status(500).json({ error: 'Failed to update user status.' });
  }
});

/**
 * GET /api/super-admin/audit-logs
 * Fetch immutable audit logs
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const { action, targetEntity, limit = 100 } = req.query;
    const query = {};
    if (action && action !== 'all') query.action = action;
    if (targetEntity && targetEntity !== 'all') query.targetEntity = targetEntity;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return res.json({ count: logs.length, logs });
  } catch (err) {
    console.error('[SuperAdmin API] Audit logs error:', err);
    return res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

module.exports = router;

