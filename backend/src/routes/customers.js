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
      data: { name, phone, userId: req.user.ownerId },
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
        userId: req.user.ownerId,
        isArchived: false,
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

// GET /api/customers/archive (History)
router.get('/customers/archive', authMiddleware, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { userId: req.user.ownerId, isArchived: true },
      orderBy: { name: 'asc' },
    });
    return res.json(customers);
  } catch (err) {
    console.error('List history error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// "Delete" customer (Soft Delete)
router.delete('/customers/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id } });
    
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    if (customer.userId !== req.user.ownerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Set isArchived to true instead of deleting
    await prisma.customer.update({ 
      where: { id },
      data: { isArchived: true }
    });
    return res.json({ message: 'Customer moved to history' });
  } catch (err) {
    console.error('Archive customer error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Restore customer
router.put('/customers/:id/restore', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    if (customer.userId !== req.user.ownerId) return res.status(403).json({ error: 'Unauthorized' });
 
    await prisma.customer.update({
      where: { id },
      data: { isArchived: false }
    });
    return res.json({ message: 'Customer restored successfully' });
  } catch (err) {
    console.error('Restore customer error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
