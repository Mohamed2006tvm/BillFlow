const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const subscriptionCheck = require('../middleware/subscriptionCheck');

const router = express.Router();

// POST /api/invoice  (subscription required)
router.post('/invoice', authMiddleware, subscriptionCheck, async (req, res) => {
  try {
    const { customerId, items } = req.body;
    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'customerId and at least one item are required' });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * parseInt(item.quantity, 10),
      0
    );

    const invoice = await prisma.invoice.create({
      data: {
        userId: req.user.id,
        customerId,
        totalAmount,
        status: 'pending',
        items: {
          create: items.map((item) => ({
            name: item.name,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity, 10),
          })),
        },
      },
      include: { items: true, customer: true },
    });

    return res.status(201).json(invoice);
  } catch (err) {
    console.error('Create invoice error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/invoices
router.get('/invoices', authMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = { userId: req.user.id };

    if (status === 'paid' || status === 'pending') where.status = status;
    if (search) {
      where.customer = { name: { contains: search, mode: 'insensitive' } };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(invoices);
  } catch (err) {
    console.error('List invoices error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/invoice/:id  — Public access for customers
router.get('/invoice/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: true,
        user: { select: { id: true, name: true, shopName: true, phone: true, email: true } },
      },
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    return res.json(invoice);
  } catch (err) {
    console.error('Get invoice error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/invoice/:id/pay
router.put('/invoice/:id/pay', authMiddleware, async (req, res) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: 'paid' },
      include: { customer: true, items: true },
    });
    return res.json(invoice);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Invoice not found' });
    console.error('Mark paid error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats  — user dashboard stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [totalInvoices, revenue, pending, invoices, user] = await Promise.all([
      prisma.invoice.count({ where: { userId } }),
      prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { userId, status: 'paid' } }),
      prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { userId, status: 'pending' } }),
      prisma.invoice.findMany({
        where: { userId },
        select: { totalAmount: true, createdAt: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionEnd: true, isActive: true },
      }),
    ]);

    // Monthly revenue grouping
    const monthlyMap = {};
    invoices.forEach((inv) => {
      const key = inv.createdAt.toISOString().slice(0, 7);
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, revenue: 0, count: 0 };
      if (inv.status === 'paid') monthlyMap[key].revenue += inv.totalAmount;
      monthlyMap[key].count += 1;
    });

    return res.json({
      totalInvoices,
      totalRevenue: revenue._sum.totalAmount || 0,
      pendingAmount: pending._sum.totalAmount || 0,
      monthly: Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)),
      subscriptionEnd: user?.subscriptionEnd,
      isActive: user?.isActive,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
