const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// All support routes require authentication
router.use(authMiddleware);

// POST /api/support - Create a new support ticket (User)
router.post('/', async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        message,
        userId: req.user.id,
      },
    });

    return res.status(201).json(ticket);
  } catch (err) {
    console.error('Create support ticket error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/support/my-tickets - List tickets for the logged-in user
router.get('/my-tickets', async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(tickets);
  } catch (err) {
    console.error('List my tickets error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Routes below
router.use(isAdmin);

// GET /api/support/admin/all - List all tickets (Admin)
router.get('/admin/all', async (_req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            shopName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(tickets);
  } catch (err) {
    console.error('List all tickets error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/support/admin/:id - Update ticket status (Admin)
router.put('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status },
    });

    return res.json(ticket);
  } catch (err) {
    console.error('Update ticket error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
