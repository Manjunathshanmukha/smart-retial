require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/products');
const dashboardRoutes = require('./routes/dashboard');
const transactionRoutes = require('./routes/transactions');
const paymentRoutes = require('./routes/payment');
const aiRoutes = require('./routes/ai');
const { router: notificationRoutes } = require('./routes/notifications');

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
