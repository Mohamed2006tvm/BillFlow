const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/customers
router.post('/customers', authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'name and phone are required' });
    }
    const customer = await prisma.customer.create({
      data: { name, phone, userId: req.user.id },
    });
    return res.status(201).json(customer);
  } catch (err) {
    console.error('Create customer error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/customers
router.get('/customers', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    const customers = await prisma.customer.findMany({
      where: {
        userId: req.user.id,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
    return res.json(customers);
  } catch (err) {
    console.error('List customers error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
