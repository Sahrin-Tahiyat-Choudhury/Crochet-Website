const Order = require('../models/order.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');

async function getAdminStats(req,res) {
    try{
        const totalUsers = await User.countDocuments({role:'user'});
        const totalOrders = await Order.countDocuments({});
        const totalProducts = await Product.countDocuments({});
        const orders = await Order.find({});

        const totalRevenueData = orders.reduce((acc,order) => acc + order.totalAmount,0);

        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            orderHistory,
            totalRevenue: totalRevenueData
        })

    } catch(error){
        res.status(500).json({message: "Error fetching stats", error})
    }
}

module.exports = { getAdminStats };