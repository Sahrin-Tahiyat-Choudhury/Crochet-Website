const express = require('express');
const cookieParser = require('cookie-parser');
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

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/order',orderRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/content',contentRoutes);
app.use('/api/payment', paymentRoutes)
app.use('/api/analytics',analyticsRoutes)
app.use('/api/content',contentRoutes)
app.use('/api/review',reviewRoutes)
app.use('/api/customOrder',customOrderRoutes);
app.use('/api/bouquetOrder',bouquetOrderRoutes)

module.exports = app;