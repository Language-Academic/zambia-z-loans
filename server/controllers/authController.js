const argon2 = require('argon2'); // Pro-standard for password hashing
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * ZAMBIA Z - AUTH UTILITIES
 * Using high-security cookie settings and centralized token logic.
 */

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict', // Essential for CSRF protection
  path: '/api/auth/refresh', // Scope the cookie to only the refresh route
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signToken = (payload, secret, expires) => 
  jwt.sign(payload, secret, { expiresIn: expires });

// --- CONTROLLERS ---

const register = async (req, res, next) => {
  try {
    const { email, password, fullName, nationalId } = req.body;

    // 1. Argon2 hashing (Automatic salt handling)
    const passwordHash = await argon2.hash(password);

    // 2. Transaction to ensure user creation and initial profile setup
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        nationalId,
        role: 'USER',
        // Initialize loan-specific fields for Zambia Z
        creditScore: 400, 
        loanLimit: 1000,
      }
    });

    const accessToken = signToken({ uid: user.id, rol: user.role }, process.env.JWT_ACCESS_SECRET, '15m');
    const refreshToken = signToken({ uid: user.id }, process.env.JWT_REFRESH_SECRET, '7d');

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      data: { user: { id: user.id, email: user.email, role: user.role }, accessToken }
    });
  } catch (error) {
    // Prisma P2002 is a unique constraint violation (email already exists)
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Email or National ID already registered' });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    
    // Pro-Tip: Use a generic error message for security (don't hint if the email exists)
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const accessToken = signToken({ uid: user.id, rol: user.role }, process.env.JWT_ACCESS_SECRET, '15m');
    const refreshToken = signToken({ uid: user.id }, process.env.JWT_REFRESH_SECRET, '7d');

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.json({ success: true, data: { user: { id: user.id, role: user.role }, accessToken } });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'Session expired' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Pro-Level: Check if user is still active/not banned in DB
    const user = await prisma.user.findUnique({ where: { id: decoded.uid } });
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Access denied' });

    // ROTATION: Optional but pro - Issue a NEW refresh token here too
    const newAccessToken = signToken({ uid: user.id, rol: user.role }, process.env.JWT_ACCESS_SECRET, '15m');

    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (error) {
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.status(401).json({ success: false, message: 'Invalid session' });
  }
};

module.exports = { register, login, refreshToken, logout: (req, res) => {
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  res.json({ success: true, message: 'Logged out' });
}, getMe: async (req, res, next) => {
  // Logic remains similar but uses req.user.uid from your auth middleware
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.uid } });
    res.json({ success: true, data: { user } });
  } catch (e) { next(e); }
}};
