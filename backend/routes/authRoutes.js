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
const { sendVerificationOtpEmail } = require('../services/dispatchService');

// In-memory registry for pending Google account OTP verifications
// Key: normalized email -> { otp, expiresAt, name, photoUrl, uid, idToken }
const pendingGoogleVerifications = new Map();

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

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
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
        phone: user.phone || '',
        bio: user.bio || '',
        neighborhood: user.neighborhood || '',
        photoUrl: user.photoUrl || null,
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
 * PATCH /api/auth/profile
 * Update current authenticated user profile
 */
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { name, phone, bio, neighborhood, photoUrl } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (bio !== undefined) updates.bio = bio;
    if (neighborhood !== undefined) updates.neighborhood = neighborhood;
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;

    const updatedUser = await User.updateById(req.user.id, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id || updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        bio: updatedUser.bio || '',
        neighborhood: updatedUser.neighborhood || '',
        photoUrl: updatedUser.photoUrl || null,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (err) {
    console.error('[Auth API] Profile update error:', err);
    return res.status(500).json({ error: 'Failed to update user profile.' });
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

/**
 * POST /api/auth/google
 * Authenticate with Google (Sign In & Account Creation)
 * Seamlessly logs in existing users or provisions a new citizen account
 */
router.post('/google', async (req, res) => {
  try {
    const { email, name, photoUrl, uid, idToken } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Google account email is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[Google Auth API] Processing Google authentication for: ${normalizedEmail}`);

    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Existing User -> Update Google metadata if needed and issue JWT
      const updates = {};
      if (uid && !user.googleId) {
        updates.googleId = uid;
      }
      if (photoUrl && !user.photoUrl) {
        updates.photoUrl = photoUrl;
      }
      if (name && (!user.name || user.name === 'Citizen')) {
        updates.name = name.trim();
      }

      if (Object.keys(updates).length > 0) {
        user = await User.updateById(user.id || user._id, updates);
      }

      const token = generateToken(user);

      return res.json({
        message: 'Google sign in successful',
        isNewUser: false,
        token,
        user: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          photoUrl: user.photoUrl || null,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } else {
      // New User -> Create citizen account automatically
      const displayName = name?.trim() || normalizedEmail.split('@')[0];
      const newUser = await User.create({
        name: displayName,
        email: normalizedEmail,
        phone: '',
        photoUrl: photoUrl || null,
        passwordHash: '',
        googleId: uid || null,
        authProvider: 'google',
        role: 'user'
      });

      console.log(`[Google Auth API] Created new citizen account for: ${normalizedEmail} (ID: ${newUser.id || newUser._id})`);

      const token = generateToken(newUser);

      return res.status(201).json({
        message: 'Google account created successfully',
        isNewUser: true,
        token,
        user: {
          id: newUser.id || newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone || '',
          photoUrl: newUser.photoUrl || null,
          role: newUser.role,
          createdAt: newUser.createdAt
        }
      });
    }
  } catch (err) {
    console.error('[Auth API] Google authentication error:', err);
    return res.status(500).json({ error: 'Failed to authenticate with Google.' });
  }
});

/**
 * POST /api/auth/google-request-otp
 * Step 1 of Google Auth Verification:
 * Generates and dispatches a 6-digit OTP to the user's Google email address
 */
router.post('/google-request-otp', async (req, res) => {
  try {
    const { email, name, photoUrl, uid, idToken } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Google account email is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const displayName = name?.trim() || normalizedEmail.split('@')[0];

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in pending verifications
    pendingGoogleVerifications.set(normalizedEmail, {
      otp,
      expiresAt,
      name: displayName,
      photoUrl: photoUrl || null,
      uid: uid || null,
      idToken: idToken || null
    });

    console.log(`[Google Auth OTP] Generated code for ${normalizedEmail}: [${otp}]`);

    // Send email via Nodemailer
    let previewUrl = null;
    try {
      const emailResult = await sendVerificationOtpEmail(normalizedEmail, otp, displayName);
      previewUrl = emailResult?.previewUrl || null;
      if (previewUrl) {
        console.log(`[Google Auth OTP] Preview URL: ${previewUrl}`);
      }
    } catch (mailErr) {
      console.warn(`[Google Auth OTP Warning] Email dispatch failed (${mailErr.message}), but OTP is active: [${otp}]`);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    return res.json({
      message: `Verification code sent to ${normalizedEmail}`,
      email: normalizedEmail,
      isExistingUser: Boolean(existingUser),
      previewUrl,
      // Provide devOtp for zero-friction local testing
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (err) {
    console.error('[Google Auth OTP Error] Request failed:', err);
    return res.status(500).json({ error: 'Failed to dispatch verification code.' });
  }
});

/**
 * POST /api/auth/google-verify-otp
 * Step 2 of Google Auth Verification:
 * Validates the 6-digit OTP and provisions or logs in the user
 */
router.post('/google-verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pendingData = pendingGoogleVerifications.get(normalizedEmail);

    if (!pendingData) {
      return res.status(400).json({ 
        error: 'No active verification session found. Please request a new code.' 
      });
    }

    if (Date.now() > pendingData.expiresAt) {
      pendingGoogleVerifications.delete(normalizedEmail);
      return res.status(400).json({ 
        error: 'Verification code has expired. Please request a new code.' 
      });
    }

    if (pendingData.otp !== otp.trim()) {
      return res.status(400).json({ 
        error: 'Invalid verification code. Please check your email and try again.' 
      });
    }

    // OTP verified successfully -> clear pending state
    pendingGoogleVerifications.delete(normalizedEmail);

    // Look up or create user
    let user = await User.findOne({ email: normalizedEmail });
    let isNewUser = false;

    if (user) {
      // Existing User -> Update metadata
      const updates = { isEmailVerified: true };
      if (pendingData.uid && !user.googleId) updates.googleId = pendingData.uid;
      if (pendingData.photoUrl && !user.photoUrl) updates.photoUrl = pendingData.photoUrl;
      if (pendingData.name && (!user.name || user.name === 'Citizen')) updates.name = pendingData.name;

      user = await User.updateById(user.id || user._id, updates);
    } else {
      // New User -> Provision verified citizen account
      user = await User.create({
        name: pendingData.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        phone: '',
        photoUrl: pendingData.photoUrl || null,
        passwordHash: '',
        googleId: pendingData.uid || null,
        authProvider: 'google',
        isEmailVerified: true,
        role: 'user'
      });
      isNewUser = true;
      console.log(`[Google Auth OTP] Verified and created new citizen account for: ${normalizedEmail}`);
    }

    const token = generateToken(user);

    return res.json({
      message: isNewUser ? 'Google account created and verified successfully!' : 'Email verified. Welcome back!',
      isNewUser,
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        photoUrl: user.photoUrl || null,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[Google Auth OTP Error] Verification failed:', err);
    return res.status(500).json({ error: 'Failed to verify OTP code.' });
  }
});

module.exports = router;
