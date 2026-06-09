const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const orderModel = require('../models/order.model');
const userModel  = require('../models/user.model');
const { sendEmail } = require('../utils/sendEmail');

async function createOrder(req, res) {
  try {
    const { orderId } = req.body; // ← frontend must send the DB order _id

    const dbOrder = await orderModel.findOne({ _id: orderId, userId: req.user.id });
    if (!dbOrder) return res.status(404).json({ message: 'Order not found' });
    if (dbOrder.status !== 'approved') {
      return res.status(400).json({ message: 'Order is not approved for payment yet' });
    }

    const instance = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const rzpOrder = await instance.orders.create({
      amount:   Math.round(dbOrder.finalAmount * 100), // use DB amount, not client-sent
      currency: 'INR',
      receipt:  crypto.randomBytes(10).toString('hex'),
    });

    res.status(200).json({
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        rzpOrder.currency,
      orderId:         dbOrder._id, // send back so frontend can pass to verify
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // 1. Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // 2. Update the order in DB
    const order = await orderModel.findOne({ _id: orderId, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus     = 'paid';
    order.status            = 'processing';
    order.razorpayOrderId   = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // 3. Email customer
    const customer = await userModel.findById(order.userId).select('email username');
    if (customer?.email) {
      await sendEmail({
        to:      customer.email,
        subject: `Payment Confirmed — Order #${order._id.toString().slice(-6)}`,
        text:    `Dear ${customer.username},\n\nYour payment of ₹${order.finalAmount} has been received! Your order is now being processed.\n\nOrder ID: ${order._id}\n\nThank you for shopping with The Yarn Journey 🧶\n\nBest regards,\nThe Yarn Journey`
      });
    }

    res.status(200).json({ message: 'Payment verified successfully', order });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = { createOrder, verifyPayment };