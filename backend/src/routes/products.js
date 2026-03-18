const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/products - List user's products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' },
    });
    return res.json(products);
  } catch (err) {
    console.error('List products error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/products - Create a product
router.post('/', async (req, res) => {
  try {
    const { name, sku, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    const product = await prisma.product.create({
      data: { name, sku: sku || null, price: parseFloat(price), userId: req.user.id },
    });
    return res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, price } = req.body;
    const existing = await prisma.product.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const product = await prisma.product.update({
      where: { id },
      data: { name, sku: sku || null, price: parseFloat(price) },
    });
    return res.json(product);
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    await prisma.product.delete({ where: { id } });
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
