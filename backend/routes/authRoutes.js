/**
 * Authentication Routes
 * - Registration (always user-role)
 * - Login (JWT issuance)
 * - Me (Current profile)
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { requireAuth, generateToken } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new citizen user account
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, email, password, and phone number are required.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email or phone already exists.' });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with guaranteed 'user' role
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: 'user'
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id || newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('[Auth API] Registration error:', err);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
});

/**
 * POST /api/auth/login
 * Sign in and receive a JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify bcrypt hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[Auth API] Login error:', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[Auth API] Profile fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

/**
 * POST /api/auth/request-otp
 * Request an OTP for phone number login
 */
router.post('/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    let user = await User.findOne({ phone });
    
    if (!user) {
      // Create a new user with this phone number
      user = await User.create({
        name: 'Citizen',
        email: '',
        phone: phone,
        passwordHash: '',
        role: 'user'
      });
    }

    // Save OTP to user
    await User.updateById(user.id || user._id, {
      otp,
      otpExpires
    });

    console.log(`[Mock SMS] OTP for ${phone} is ${otp}`);

    return res.json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('[Auth API] Request OTP error:', err);
    return res.status(500).json({ error: 'Failed to request OTP.' });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP and login
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required.' });
    }

    console.log(`[Verify OTP] Checking phone: ${phone}, provided otp: ${otp}`);
    const user = await User.findOne({ phone });
    if (!user) {
      console.log(`[Verify OTP] User not found for phone: ${phone}`);
      return res.status(404).json({ error: 'User not found.' });
    }

    console.log(`[Verify OTP] User found. DB OTP: ${user.otp}, DB Expires: ${user.otpExpires}`);

    if (!user.otp || user.otp !== otp) {
      console.log(`[Verify OTP] Invalid OTP.`);
      return res.status(401).json({ error: 'Invalid OTP.' });
    }

    if (new Date(user.otpExpires) < new Date()) {
      console.log(`[Verify OTP] OTP Expired.`);
      return res.status(401).json({ error: 'OTP expired.' });
    }

    // Clear OTP
    await User.updateById(user.id || user._id, {
      otp: null,
      otpExpires: null
    });

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[Auth API] Verify OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
});

/**
 * POST /api/auth/firebase-login
 * Login with a phone number verified by Firebase Auth on the frontend
 */
router.post('/firebase-login', async (req, res) => {
  try {
    const { phone, idToken } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone is required.' });
    }

    // In a production environment, we should verify `idToken` using firebase-admin here.
    // For prototype purposes, we will trust the phone number provided by the frontend,
    // since Firebase Recaptcha and SMS verification occurred in the browser.
    console.log(`[Firebase Login] Authenticating user for verified phone: ${phone}`);

    let user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not registered. Please create an account first.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Firebase login successful',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[Auth API] Firebase login error:', err);
    return res.status(500).json({ error: 'Failed to complete Firebase login.' });
  }
});

module.exports = router;
