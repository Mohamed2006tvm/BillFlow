const express = require('express');
const bcrypt = require('bcryptjs');
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

// PUT /api/support/admin/:id/reply - Reply to a ticket (Admin)
router.put('/admin/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, status } = req.body;

    if (!adminReply) {
      return res.status(400).json({ error: 'Reply message is required' });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { 
        adminReply,
        status: status || 'closed' // Default to closing if not specified
      },
    });

    return res.json(ticket);
  } catch (err) {
    console.error('Reply to ticket error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/support/admin/:id/reset-password - Reset the user's password (Admin)
router.put('/admin/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const hashed = await bcrypt.hash('1234', 10);
    
    await prisma.user.update({
      where: { id: ticket.userId },
      data: { password: hashed }
    });

    // Update ticket status and add reply
    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: { 
        adminReply: 'Your password has been reset to the default: 1234. Please log in and change it in Settings.',
        status: 'closed'
      },
    });

    return res.json({ message: 'User password reset to 1234 successfully', ticket: updatedTicket });
  } catch (err) {
    console.error('Admin user password reset error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
