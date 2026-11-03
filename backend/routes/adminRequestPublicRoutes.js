/**
 * Public Department Admin Application Routes
 * Allows civic department officers to submit administrator requests for Super Admin review
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const Department = require('../models/Department');
const AdminRequest = require('../models/AdminRequest');
const User = require('../models/User');

/**
 * GET /api/admin-requests/departments
 * Public: List active municipal departments for application dropdown
 */
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find({ status: 'active' })
      .select('id name code description categories contactEmail')
      .sort({ name: 1 });

    return res.json({ departments });
  } catch (err) {
    console.error('[Admin Requests Public] Departments list error:', err);
    return res.status(500).json({ error: 'Failed to fetch departments.' });
  }
});

/**
 * POST /api/admin-requests/apply
 * Public: Submit department administrator application
 */
router.post('/apply', async (req, res) => {
  try {
    const { 
      applicantName, 
      email, 
      phone, 
      password, 
      requestedDepartmentId, 
      officialDesignation, 
      verificationNotes,
      idBadgeUrl 
    } = req.body;

    if (!applicantName || !email || !password || !requestedDepartmentId) {
      return res.status(400).json({ 
        error: 'Applicant name, official email, password, and target department are required.' 
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser && (existingUser.role === 'department_admin' || existingUser.role === 'super_admin')) {
      return res.status(400).json({ 
        error: 'An administrator account is already active for this email address. Please proceed to login.' 
      });
    }

    // Check if pending request exists
    const existingRequest = await AdminRequest.findOne({ email: cleanEmail, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ 
        error: 'An application is already under review for this email address. You will receive an update once vetted.' 
      });
    }

    // Lookup department
    const dept = await Department.findById(requestedDepartmentId);
    if (!dept) {
      return res.status(400).json({ error: 'Selected municipal department does not exist.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const newRequest = await AdminRequest.create({
      applicantName: applicantName.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      passwordHash,
      requestedDepartmentId: dept.id || dept._id,
      requestedDepartmentName: dept.name,
      officialDesignation: officialDesignation ? officialDesignation.trim() : 'Civic Field Officer',
      verificationNotes: verificationNotes || '',
      idBadgeUrl: idBadgeUrl || '',
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Your department administrator application has been registered successfully. It will be reviewed by the Super Administrator.',
      request: {
        id: newRequest.id || newRequest._id,
        applicantName: newRequest.applicantName,
        email: newRequest.email,
        departmentName: newRequest.requestedDepartmentName,
        status: newRequest.status,
        submittedAt: newRequest.createdAt
      }
    });
  } catch (err) {
    console.error('[Admin Requests Public] Application submission error:', err);
    return res.status(500).json({ error: 'Failed to submit application. Please try again.' });
  }
});

/**
 * GET /api/admin-requests/status/:email
 * Public: Check application review status
 */
router.get('/status/:email', async (req, res) => {
  try {
    const cleanEmail = req.params.email.toLowerCase().trim();
    const request = await AdminRequest.findOne({ email: cleanEmail }).sort({ createdAt: -1 });

    if (!request) {
      return res.status(404).json({ error: 'No application record found for this email address.' });
    }

    return res.json({
      status: request.status,
      applicantName: request.applicantName,
      departmentName: request.requestedDepartmentName,
      submittedAt: request.createdAt,
      reviewedAt: request.reviewedAt,
      rejectionReason: request.status === 'rejected' ? request.rejectionReason : undefined
    });
  } catch (err) {
    console.error('[Admin Requests Public] Status check error:', err);
    return res.status(500).json({ error: 'Failed to query application status.' });
  }
});

module.exports = router;
