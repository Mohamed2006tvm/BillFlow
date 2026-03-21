const prisma = require('../lib/prisma');

const subscriptionCheck = async (req, res, next) => {
  try {
    // Admins bypass subscription check
    const userId = req.user.role === 'admin' ? null : req.user.ownerId;
    if (req.user.role === 'admin') return next();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true, subscriptionEnd: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account deactivated. Contact admin.' });
    }
    if (!user.subscriptionEnd || new Date() > new Date(user.subscriptionEnd)) {
      return res.status(403).json({ error: 'Subscription expired. Please renew.' });
    }

    next();
  } catch (err) {
    console.error('Subscription check error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = subscriptionCheck;
