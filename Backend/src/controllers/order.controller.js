const productModel = require('../models/product.model');
const orderModel = require('../models/order.model');
const userModel = require('../models/user.model');
const { sendEmail } = require('../utils/sendEmail');
const { getCouponDiscount } = require('../services/coupon.service')
const settingsModel = require('../models/settings.model');

//User Access

// Place order
async function placeOrder(req, res) {

    try{
    const { products, address, couponCode} = req.body;
    const isAdminOrder = req.user.role === "admin";
    if (isAdminOrder && !req.body.userId) {
  return res.status(400).json({ message: "userId is required for manual orders" });
}
const orderUserId = isAdminOrder ? req.body.userId : req.user.id;


    if(!products || !products.length || !address) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
        const product = await productModel.findById(item.productId);

        if(!product) {
            return res.status(404).json({message: "Product not found"});
        }

        if(product.stockQuantity < item.quantity){
            return res.status(400).json({
                message: 'Not enough stock'
            });
        }
        const totalItem = product.price.sellingPrice * item.quantity;

        totalAmount += totalItem;
        orderProducts.push({
            productId : product._id,
            quantity: item.quantity,
            price: product.price.sellingPrice
        })
    }

    let finalAmount = totalAmount;
    let discountAmount = 0;
    let coupon = null;

   if (couponCode) {
    const couponData = await getCouponDiscount({
        code: couponCode,
        totalAmount
    });

    coupon = couponData.coupon;
    discountAmount = couponData.discountAmount;
    finalAmount = couponData.finalAmount;
}
    
    const order = await orderModel.create({
        userId: orderUserId,
        products: orderProducts,
        totalAmount,
        finalAmount,
        discountAmount,
        coupon: coupon ? coupon._id : null,
        couponCode: coupon ? coupon.code : null,
        address
    });
    await order.save();

    for (const item of order.products) {
        const product = await productModel.findById(item.productId);

        if (product) {
            product.stockQuantity -= item.quantity;
            product.sold += item.quantity;
            await product.save();
        }
    }


const orderUser = isAdminOrder
    ? await userModel.findById(orderUserId).select('email username')
    : req.user;

if (orderUser?.email) {
    const emailText = `Dear ${orderUser.username},

Your order with ID ${order._id} has been placed successfully!

Please allow 1-2 business days for processing. We will notify you once it is approved.

Order details:
Order ID: ${order._id}
Subtotal: ₹${order.totalAmount}
Discount: ₹${order.discountAmount}
Final Amount: ₹${order.finalAmount}
Shipping Address: ${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.zipCode}, ${order.address.country}

Thank you for shopping with us!

Best regards,
The Yarn Journey`;

    await sendEmail({
        to: orderUser.email,
        subject: 'Order Confirmation',
        text: emailText
    });
}
// Notify admin of new order
const adminEmail = process.env.EMAIL_USER;
if (adminEmail) {
  await sendEmail({
    to: adminEmail,
    subject: `New Order Received — #${order._id.toString().slice(-6)}`,
    text: `A new order has been placed.\n\nOrder ID: ${order._id}\nCustomer: ${orderUser?.username || orderUserId}\nItems: ${orderProducts.length}\nTotal: ₹${order.finalAmount}\n\nLog in to the admin panel to review and approve it.`
  });
}
    res.status(201).json({ message: 'Order placed successfully', order });
} 

catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }

}

//My Orders
async function getMyOrders(req,res){
    try{
        const orders = await orderModel.find({
            userId: req.user.id
        }).populate('products.productId', 'name');
        res.json(orders);
    } catch(error) {
        res.status(500).json({message:'Error fetching orders',error: error.message })
    }
}

// View order history
async function getOrderHistory(req,res){
    try{
        const orders = await orderModel
        .find({
            userId: req.user.id
        })
        .select("totalAmount status finalAmount");

        res.json(orders);
    } catch(error) {
        res.status(500).json({ message: "Error fetching order history", error: error.message });
  }

}

// View order details
async function getOrderDetails(req,res){
    try{
           const order = await orderModel.findById(req.params.orderId)
               .populate('products.productId', 'name')
               .select('userId products totalAmount address paymentStatus status refundStatus refundReason');

            if(!order) {
                return res.status(404).json({message:'Order not found'});
            }

            if(order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({message: 'Not allowed'})
            }
           res.json({
            orderId: order._id,
            products: order.products.map((product) => ({
                productId: product.productId?._id ?? product.productId,
                productName: product.productId?.name,
                quantity: product.quantity,
                price: product.price,
                couponApplied: product.couponApplied,
                discountAmount: product.discountAmount
            })),
            totalAmount : order.totalAmount,
            address: order.address,
            paymentStatus: order.paymentStatus,
            status: order.status,
            refundStatus: order.refundStatus,
            refundReason: order.refundReason
           });
       } catch (error) {
           res.status(500).json({ message: "Error fetching order details", error: error.message });
       }
}

// Track order status
function buildTrackingSteps(status) {
  return [
    { status: 'pending', done: true },
    { status: 'accepted', done: status !== 'pending' },
    { status: 'shipped', done: ['shipped', 'delivered'].includes(status) },
    { status: 'delivered', done: status === 'delivered' }
  ];
}

async function trackOrderStatus(req, res) {
  try {
    const order = await orderModel.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    res.json({
      orderId: order._id,
      currentStatus: order.status,
      tracking: buildTrackingSteps(order.status)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking order', error: error.message });
  }
}


//Refund Request

async function refundRequest(req,res) {
    try{ 
        const order = await orderModel.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "You don't have access" });
        }

        if(order.status !== 'delivered') {
            return res.status(400).json({ message: "Refund allowed only after delivery"});
        }
        
        order.refundStatus = 'requested';
        order.refundReason = req.body.reason;
        await order.save();
        res.json({ message: "Refund request submitted", order });
    } catch (error) {
        res.status(500).json({ message: "Error requesting refund", error: error.message });
    }
}
/* Admin Access

- View all orders
*/

async function getAllOrders(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const filter = {};

    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    const total = await orderModel.countDocuments(filter);

    const orders = await orderModel.find(filter)
      .populate('userId', 'username email')
      .populate('products.productId', 'name')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
}
//Update order status

async function updateOrderStatus(req,res){
    try{
        const { status } = req.body || {};
        const order = await orderModel.findById(req.params.orderId)

        if(!order) {
            return res.status(404).json({message:'Order not found'})
        }

        if(order.status === 'delivered') {
            return res.status(400).json({message:'Order already delivered'})
        }

        if (!status) {
            return res.status(400).json({ message: 'Status is required' })
        }

        if (order.finalAmount == null) {
            order.finalAmount = order.totalAmount - (order.discountAmount || 0);
        }


        //cancellation logic
        if(status === 'cancelled') {
            for(const item of order.products){
                const product = await productModel.findById(item.productId)

                 if (product) {
                    product.stockQuantity += item.quantity;
                    product.sold = Math.max(0, product.sold - item.quantity);
                    await product.save();
                }
            }
        }

        order.status = status;
        await order.save();

        // Notify customer on key status changes
const orderUser = await userModel.findById(order.userId).select('email username');

if (orderUser?.email && ['approved', 'cancelled', 'shipped', 'delivered'].includes(status)) {
  const settings = await settingsModel.findOne();
const upiId = settings?.payments?.upiId || process.env.UPI_ID || 'your-upi-id@bank';

const messages = {
  approved: `Your order #${order._id} has been approved!\n\nPlease pay ₹${order.finalAmount} via UPI to ${upiId} and submit your UTR number on the orders page to confirm payment.`,
  cancelled: `Your order #${order._id} has been cancelled.`,
  shipped:   `Your order #${order._id} has been shipped and is on its way.`,
  delivered: `Your order #${order._id} has been delivered. Thank you for shopping with The Yarn Journey! 🧶`
};

  await sendEmail({
    to: orderUser.email,
    subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} — #${order._id.toString().slice(-6)}`,
    text: `Dear ${orderUser.username},\n\n${messages[status]}\n\nBest regards,\nThe Yarn Journey`
  });
}
        res.json({message:'Order status updated',order}) 
    } catch(error)
    {
        res.status(500).json({message:'Error updating order status',error: error.message})
    }
}

//Cancel orders
async function cancelOrder(req,res){
    try{
        const order = await orderModel.findById(req.params.orderId);

        if(!order) {
            return res.status(404).json({message:'Order not found'})
        }

        const isOwner = order.userId.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        if(!isOwner && !isAdmin){
                return res.status(403).json({message: "You don't have access"});
            }
        
        if(order.status === 'cancelled'){
            return res.status(400).json({message:'Order already cancelled'})
        }

        if(order.status === 'delivered'){
            return res.status(400).json({message:'Cannot cancel delivered order'})
        }
        

        //User can't cancel after payment

        if(!isAdmin && order.paymentStatus === 'paid'){
            return res.status(400).json({message: "Cannot cancel after payment"})
        }

        if (order.finalAmount == null) {
            order.finalAmount = order.totalAmount - (order.discountAmount || 0);
        }

        
        for (const item of order.products) {
            const product = await productModel.findById(item.productId);

            if (product) {
                product.stockQuantity += item.quantity;

                if (order.paymentStatus === 'paid') {
                    product.sold = Math.max(0, product.sold - item.quantity);  //decrease product.sold by item.quantity, but never let it go below 0
                }

                await product.save();
            }
        }


        order.status = "cancelled";
        await order.save();

        res.json({message: 'Order cancelled successfully', order})
    } catch(err){
        res.status(500).json({message:'Error cancelling order',error:err.message});
    }
}

/*Handle refunds (basic structure): 
Refunds will only be considered under the following conditions:
The product is damaged during transit
You receive an incorrect or incomplete order (missing items)
*/

async function refundOrder(req, res) {
  try {
    const { status } = req.body || {};

    if (!status) {
      return res.status(400).json({ message: "Refund status is required" });
    }

    const order = await orderModel.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.finalAmount == null) {
      order.finalAmount = order.totalAmount - (order.discountAmount || 0);
    }

     if (status === 'approved') {
      order.refundStatus = 'refunded';

      for (const item of order.products) {
        const product = await productModel.findById(item.productId);

        if (product) {
          product.stockQuantity += item.quantity;
          product.sold = Math.max(0, product.sold - item.quantity);
          await product.save();
        }
      }
    } else if (status === 'rejected') {
      order.refundStatus = 'rejected';
    } else {
      return res.status(400).json({ message: "Invalid refund status" });
    }

    await order.save();

    res.json({ message: "Refund status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Error processing refund", error: error.message });
  }
}
// order.controller.js
async function confirmPayment(req, res) {
  try {
    const order = await orderModel.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'approved') {
      return res.status(400).json({ message: 'Order is not yet approved for payment' });
    }

    order.utrNumber    = req.body.utrNumber;
    order.paymentStatus = 'paid';
    order.status        = 'processing';
    await order.save();

    res.json({ message: 'Payment confirmation received', order });
  } catch (err) {
    res.status(500).json({ message: 'Error confirming payment', error: err.message });
  }
}




module.exports = {
    placeOrder,
    getMyOrders,
    getOrderHistory,
    getOrderDetails,
    trackOrderStatus,
    refundRequest,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    refundOrder,
    confirmPayment
}
