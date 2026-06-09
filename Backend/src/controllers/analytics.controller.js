const Product = require("../models/product.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const Coupon = require("../models/coupon.model");

async function getAdminStats(req, res) {
  try {
    const period = req.query.period || 'this_month';
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'last_month': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      }
      case 'last_3_months': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      }
      case 'this_year': {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate   = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      }
      default: // 'this_month'
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };
    const paidFilter = {
      ...dateFilter,
      status: { $in: ['processing', 'shipped', 'delivered'] },
      paymentStatus: 'paid'
    };
    const totalUsers =
      await User.countDocuments({ role: "user" });

    const totalProducts =
      await Product.countDocuments();


      const totalOrders = await Order.countDocuments(paidFilter)

      const orders = await Order.find(paidFilter)
  .populate("products.productId", "name category");

const pendingOrders = await Order.countDocuments({ ...dateFilter, status: "pending" });
const shippedOrders = await Order.countDocuments({ ...dateFilter, status: "shipped" });


const totalRevenue = orders.reduce(
  (sum, order) => sum + (order.finalAmount || 0), 0
);

    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRevenue =
      orders
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= today && orderDate < tomorrow;
        })
        .reduce(
          (sum, order) =>
            sum + (order.finalAmount || 0),
          0
        );

    const avgOrderValue =
      totalOrders
        ? Math.round(totalRevenue / totalOrders)
        : 0;


    const activeDiscounts =
      await Coupon.countDocuments({
        isActive: true,
        expiryDate: { $gt: new Date() }
      });

    const lowStockProducts =
      await Product.find({
        $expr: {
          $and: [
            { $gt: ["$stockQuantity", 0] },
            {
              $lte: [
                "$stockQuantity",
                "$lowStockAlertAt"
              ]
            }
          ]
        }
      });

    const recentOrders =
      await Order.find()
        .populate("userId", "username email")
        .sort({ createdAt: -1 })
        .limit(5);

    const bestSellingProducts =
      await Product.find()
        .sort({ sold: -1 })
        .limit(5);

    const categoryRevenue = await Product.aggregate([
  {
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "category"
    }
  },
  {
    $unwind: {
      path: "$category",
      preserveNullAndEmptyArrays: false
    }
  },
  {
    $group: {
      _id: "$category.name",
      revenue: {
        $sum: {
          $multiply: [
            "$sold",
            "$price.sellingPrice"
          ]
        }
      }
    }
  },
  {
    $sort: { revenue: -1 }
  }
]);


const monthlyRevenue = await Order.aggregate([
  {
    $match: paidFilter
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      revenue: {
        $sum: "$finalAmount"
      }
    }
  },
  {
    $sort: {
      "_id.year": 1,
      "_id.month": 1
    }
  }
]);

const topCities = await User.aggregate([
  {
    $match: {
      city: {
        $nin: ["", null]
      }
    }
  },
  {
    $group: {
      _id: "$city",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  },
  {
    $limit: 10
  }
]);


const dailyOrders = await Order.aggregate([
  {
    $match: paidFilter
  },
  {
    $group: {
      _id: { day: { $dayOfMonth: "$createdAt" } },
      orders: { $sum: 1 }
    }
  },
  {
    $sort: { "_id.day": 1 }
  }
]);


    res.json({
  totalUsers,
  totalOrders,
  totalProducts,
  totalRevenue,
  todayRevenue,
  avgOrderValue,
  pendingOrders,
  shippedOrders,
  activeDiscounts,
  lowStockCount: lowStockProducts.length,
  lowStockProducts,
  recentOrders,
  bestSellingProducts,
  categoryRevenue,
  monthlyRevenue,
  topCities,
  dailyOrders,
  currentMonth: now.getMonth() + 1,
currentYear: now.getFullYear(),
});

  } catch (error) {
    res.status(500).json({
      message: "Error fetching analytics",
      error: error.message
    });
  }
}

module.exports = {
  getAdminStats
};