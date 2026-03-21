const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Contact admin.' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        ownerId: user.role === 'employee' ? user.ownerId : user.id 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Include employees if it's a shop owner
    let employees = [];
    if (user.role === 'user') {
      employees = await prisma.user.findMany({
        where: { ownerId: user.id, role: 'employee' }, // Ensure only employees are fetched
        select: { id: true, name: true, email: true, role: true }
      });
    }

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        shopName: user.shopName,
        role: user.role,
        ownerId: user.role === 'employee' ? user.ownerId : user.id,
        subscriptionEnd: user.subscriptionEnd,
        isActive: user.isActive,
      },
      employees
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(401).json({ error: 'Incorrect current password' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/reset-password - Reset admin password to "1234"
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Security check: Only allow reset if user is an admin
    if (user.role !== 'admin') {
      // Create a support ticket for the user
      await prisma.supportTicket.create({
        data: {
          subject: 'Password Reset Request',
          message: `User ${user.name} (${user.email}) is requesting a password reset to default 1234.`,
          userId: user.id
        }
      });
      return res.json({ message: 'Your reset request has been sent to the administrator. Please check back later.' });
    }

    const hashed = await bcrypt.hash('1234', 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return res.json({ message: 'Password has been reset to default: 1234' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/employees - Get all employees for this shop
router.get('/employees', authMiddleware, async (req, res) => {
  try {
    const ownerId = req.user.role === 'user' ? req.user.id : req.user.ownerId;
    
    const employees = await prisma.user.findMany({
      where: { ownerId: ownerId, role: 'employee' },
      select: { id: true, name: true, email: true, phone: true, createdAt: true }
    });
    return res.json(employees);
  } catch (err) {
    console.error('List employees error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/employees - Create a new employee (Owner only)
router.post('/employees', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ error: 'Only shop owners can manage employees' });
    
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) return res.status(400).json({ error: 'All fields are required' });

    // Check if email already used
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    // Get shop info from owner
    const owner = await prisma.user.findUnique({ where: { id: req.user.id } });

    const hashed = await bcrypt.hash(password, 10);
    const employee = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        phone,
        shopName: owner.shopName,
        role: 'employee',
        ownerId: owner.id,
        isActive: true
      }
    });

    return res.status(201).json({ id: employee.id, name: employee.name, email: employee.email });
  } catch (err) {
    console.error('Create employee error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/employees/:id - Remove an employee (Owner only)
router.delete('/employees/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ error: 'Only shop owners can manage employees' });
    const { id } = req.params;

    const employee = await prisma.user.findFirst({
      where: { id, ownerId: req.user.id }
    });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'Employee removed successfully' });
  } catch (err) {
    console.error('Delete employee error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/switch-profile - Get a scoped token for an employee or owner
router.post('/switch-profile', authMiddleware, async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    
    // If switching to Owner, requires password verification of the master account
    if (!employeeId) {
       const owner = await prisma.user.findUnique({ where: { id: req.user.ownerId } });
       if (!owner) return res.status(404).json({ error: 'Owner not found' });

       const isValid = await bcrypt.compare(password, owner.password);
       if (!isValid) return res.status(401).json({ error: 'Incorrect password' });

       const token = jwt.sign(
         { id: owner.id, email: owner.email, role: 'user', ownerId: owner.id },
         process.env.JWT_SECRET,
         { expiresIn: '7d' }
       );

       return res.json({ token, user: { ...owner, password: undefined, role: 'user' } });
    }

    // Switching to Employee
    const employee = await prisma.user.findFirst({
      where: { id: employeeId, ownerId: req.user.ownerId }
    });

    if (!employee) return res.status(404).json({ error: 'Employee profile not found' });

    const token = jwt.sign(
      { id: employee.id, email: employee.email, role: 'employee', ownerId: employee.ownerId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        shopName: employee.shopName,
        role: 'employee',
        ownerId: employee.ownerId
      }
    });
  } catch (err) {
    console.error('Switch profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

function minified_user(user) {
  const { password, ...rest } = user;
  return rest;
}

module.exports = router;
