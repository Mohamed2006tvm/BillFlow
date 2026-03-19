require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const customerRoutes = require('./src/routes/customers');
const invoiceRoutes = require('./src/routes/invoices');
const supportRoutes = require('./src/routes/support');
const productRoutes = require('./src/routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
const allowedOrigins = [
  ...(process.env.FRONTEND_URL?.split(',') || []),
  'https://bill-flow-sable.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Electron local files)
    if (!origin || origin === 'null') {
      return callback(null, true);
    }
    
    // Check if the origin matches any allowed origin or is a localhost variant
    const isAllowed = allowedOrigins.includes(origin) || 
                     /^http:\/\/localhost(:\d+)?$/.test(origin);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'BillFlow API v2' }));

// Routes
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', customerRoutes);
app.use('/api', invoiceRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/products', productRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 BillFlow API running at http://localhost:${PORT}`);
});
