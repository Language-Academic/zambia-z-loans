const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const prisma = require('../config/prisma');

/**
 * Generate Access and Refresh Token pair
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { uid: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { uid: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Register a new user with secure hashing[cite: 1]
 */
const register = async (req, res, next) => {
  try {
    const { email, password, fullName, nationalId, isCitizen } = req.body;
    
    const passwordHash = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        fullName: fullName.trim(),
        nationalId: nationalId.trim(),
        isCitizen,
      }
    });

    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ message: 'User already exists' });
    next(error);
  }
};

/**
 * Secure Login with Token storage
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: { accessToken, refreshToken, user: { id: user.id, fullName: user.fullName, role: user.role } }
    });
  } catch (error) { next(error); }
};

/**
 * Refresh Session logic[cite: 1, 2]
 */
const refreshSession = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Token required' });

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Invalid session' });
    }

    const tokens = generateTokens(storedToken.user);

    // Rotate tokens: Delete old and save new[cite: 1]
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });

    res.json({ success: true, data: tokens });
  } catch (error) { next(error); }
};

module.exports = { register, login, refreshSession };
