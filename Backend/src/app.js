const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const validationRules = require('./middlewares/validation.middleware');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const couponRoutes = require('./routes/coupons.routes');
const cartRoutes = require('./routes/cart.routes');
const paymentRoutes = require('./routes/payment.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const contentRoutes = require('./routes/content.routes');
const reviewRoutes = require('./routes/review.routes');
const customOrderRoutes = require('./routes/customOrder.routes');
const bouquetOrderRoutes = require('./routes/bouquetOrder.routes');
const contactRoutes = require('./routes/contact.routes');
const customerRoutes = require('./routes/customer.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500','https://819f7ddd.crochet-website.pages.dev/'], // adjust to your frontend ports
  credentials: true
}));



app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));
app.use(cookieParser());

// Serve frontend static files from the project Frontend folder.
const frontendPath = path.resolve(__dirname, '..', '..', 'Frontend');
app.use('/Frontend', express.static(frontendPath));
app.use(express.static(frontendPath));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/customOrder', customOrderRoutes);
app.use('/api/bouquetOrder', bouquetOrderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/settings', settingsRoutes);

module.exports = app;
