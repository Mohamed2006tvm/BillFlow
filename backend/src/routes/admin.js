const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, isAdmin);

// POST /api/admin/create-user
router.post('/create-user', async (req, res) => {
  try {
    const { name, email, password, phone, shopName } = req.body;
    if (!name || !email || !password || !phone || !shopName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const now = new Date();
    const subEnd = new Date(now);
    subEnd.setDate(subEnd.getDate() + 30);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        phone,
        shopName,
        role: 'user',
        isActive: true,
        subscriptionStart: now,
        subscriptionEnd: subEnd,
      },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      shopName: user.shopName,
      phone: user.phone,
      isActive: user.isActive,
      subscriptionEnd: user.subscriptionEnd,
    });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/users
router.get('/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        shopName: true,
        isActive: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        monthlyAmount: true,
        createdAt: true,
        _count: { select: { invoices: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(users);
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/renew/:userId
router.put('/renew/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Extend from current expiry (or now if already expired)
    const base = user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date()
      ? new Date(user.subscriptionEnd)
      : new Date();
    base.setDate(base.getDate() + 30);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { subscriptionEnd: base, isActive: true },
      select: { id: true, shopName: true, subscriptionEnd: true, isActive: true },
    });
    return res.json(updated);
  } catch (err) {
    console.error('Renew error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/toggle/:userId
router.put('/toggle/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, shopName: true, isActive: true },
    });
    return res.json(updated);
  } catch (err) {
    console.error('Toggle error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/monthly-amount/:userId - Set monthly amount
router.put('/monthly-amount/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { monthlyAmount } = req.body;
    if (monthlyAmount === undefined) return res.status(400).json({ error: 'monthlyAmount is required' });
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { monthlyAmount: parseFloat(monthlyAmount) },
      select: { id: true, shopName: true, monthlyAmount: true },
    });
    return res.json(updated);
  } catch (err) {
    console.error('Set monthly amount error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
