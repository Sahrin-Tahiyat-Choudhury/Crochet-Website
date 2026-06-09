const userModel = require('../models/user.model');
const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const {sendEmail} = require('../utils/sendEmail');

async function messageCustomer(req, res) {
  try {
    const { id } = req.params;
    const { message, subject } = req.body;

    const user = await userModel.findById(id).select('email username');
    if (!user) return res.status(404).json({ message: 'Customer not found' });
    if (!user.email) return res.status(400).json({ message: 'Customer has no email' });

    await sendEmail({
      to: user.email,
      subject: subject || 'Message from The Yarn Journey',
      text: message,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Mail error:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}

// GET ALL CUSTOMERS (REAL DATA)
async function getAllCustomers(req, res) {
    try {
        const users = await userModel.find({ role: 'user' })
            .select('-password');

        // attach order stats
        const customers = await Promise.all(users.map(async (u) => {
            const orders = await orderModel.find({ userId: u._id });

            const totalSpent = orders.reduce((sum, o) => sum + o.finalAmount, 0);

            const lastOrder = await orderModel.findOne({ userId: u._id })
                .sort({ createdAt: -1 });

            return {
                id: u._id,
                name: u.username,
                email: u.email,
                phone: u.phone,
                city: u.city,
                orders: orders.length,
                spent: totalSpent,
                last: lastOrder ? lastOrder.createdAt : null
            };
        }));

        res.status(200).json({ customers });

    } catch (error) {
        res.status(500).json({ message: "Error fetching customers", error });
    }
}

module.exports = { getAllCustomers,messageCustomer };