const bouquetOrderModel = require('../models/bouquetOrder.model');
const orderModel = require('../models/order.model');
const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const categoryModel = require('../models/category.model');
const Settings = require('../models/settings.model');
const {sendEmail} = require('../utils/sendEmail');

async function getBouquetItems(req, res) {
    try {

        const flowerCategory  = await categoryModel.findOne({
                name: "Make Your Own Bouquet"
            });

        const wrapperCategory = await categoryModel.findOne({
            name: "Bouquet Wrappers"
        });

        if (!flowerCategory) {
            return res.status(404).json({
                message: "Make Your Own Bouquet category not found"
            });
        }
        const flowers = await productModel.find({
    category: flowerCategory._id,
    isHidden: false
});

const wrappers = await productModel.find({
    category: wrapperCategory._id,
    isHidden: false
});

            console.log("Category:", flowerCategory);
console.log("Flowers:", flowers);
console.log("Wrappers:", wrappers);
        return res.status(200).json({
            flowers,
            wrappers
        });

    } catch (error) {

        console.error(
            "BOUQUET ITEMS ERROR:",
            error
        );

        return res.status(500).json({
            message: "Error fetching items",
            error: error.message
        });

    }
}
async function createBouquetOrder(req,res){
    try{
        const { flowers, wrapper} = req.body;
        console.log("REQ BODY:", req.body);
        let totalPrice = 0;

        if (!flowers || !flowers.length) {
            return res.status(400).json({ message: 'Please select at least one flower' });
        }

        for (const item of flowers) {
            const quantity = Number(item.quantity) || 1;
            const product = await productModel.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: 'Flower not found' });
            }
            totalPrice += (product.price?.sellingPrice || 0) * quantity;
        }

        if (wrapper?.product) {

    const wrapperProduct =
        await productModel.findById(
            wrapper.product
        );

    console.log(
        "Wrapper product:",
        wrapperProduct
    );

    if (wrapperProduct) {

        console.log(
            "Wrapper selling price:",
            wrapperProduct.price?.sellingPrice
        );

        totalPrice +=
            (wrapperProduct.price?.sellingPrice || 0) *
            (Number(wrapper.quantity) || 1);

    }

}

        const bouquetOrder = await bouquetOrderModel.create({
            user: req.user?.id || null,
            flowers,
            wrapper,
            totalPrice
        });

        const settings = await Settings.findOne();

const notificationEmail =
    process.env.CUSTOM_ORDER_NOTIFICATION_EMAIL ||
    settings?.contactEmail ||
    process.env.EMAIL_USER;

if(notificationEmail){

    await sendEmail({

        to: notificationEmail,

        subject:
            'New Bouquet Order',

        text: `
New bouquet order received.

Flowers:
${flowers.map(f =>
`${f.product} x ${f.quantity}`
).join('\n')}

Total:
₹${totalPrice}
`

    });

}
        return res.status(201).json({ message: 'Bouquet order submitted successfully', bouquetOrder });        

    }catch(error){
        return res.status(500).json({ message: 'Error submitting bouquet order', error: error.message });
    }
}

async function getAllBouquetOrders(req, res) {

    const orders =
        await bouquetOrderModel
            .find()
            .populate('user')
            .populate('flowers.product')
            .populate('wrapper.product')
            .sort({ createdAt: -1 });

    res.json({
        orders
    });

}

async function confirmBouquetOrder(req,res){
  const order = await bouquetOrderModel.findById(req.params.orderId);
  if (!order) return res.status(404).json({message:"Not found"});

  order.status = "confirmed";
  await order.save();

  const orderUser = await userModel
      .findById(order.user)
      .select("email username");

    if (orderUser?.email) {
      const settings = await Settings.findOne();
      const upiId =
        settings?.payments?.upiId ||
        process.env.UPI_ID ||
        "your-upi-id@bank";

      const message = `Your bouquet order #${order._id.toString().slice(-6)} has been confirmed!

Please pay ₹${order.totalPrice} via UPI to ${upiId} and submit your UTR number on the orders page to confirm payment.`;

      await sendEmail({
        to: orderUser.email,
        subject: `Bouquet Order Confirmed — #${order._id.toString().slice(-6)}`,
        text: `Dear ${orderUser.username},\n\n${message}\n\nBest regards,\nThe Yarn Journey`
      });
    }
 
  res.json({message:"Bouquet confirmed", order});
}

async function rejectBouquetOrder(req, res) {
  try {
    const orderId = req.params.orderId;

    const order = await bouquetOrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Bouquet order not found" });
    }

    if (order.status === "rejected") {
      return res.status(400).json({ message: "Already rejected" });
    }

    if (order.status === "confirmed") {
      return res.status(400).json({ message: "Cannot reject confirmed order" });
    }

    order.status = "rejected";
    await order.save();

    const orderUser = await userModel
      .findById(order.user)
      .select("email username");

    if (orderUser?.email) {
      const message = `Your bouquet order #${order._id.toString().slice(-6)} has been rejected.`;

      await sendEmail({
        to: orderUser.email,
        subject: `Bouquet Order Rejected — #${order._id.toString().slice(-6)}`,
        text: `Dear ${orderUser.username},\n\n${message}\n\nBest regards,\nThe Yarn Journey`
      });
    }

    return res.json({
      message: "Bouquet order rejected successfully",
      order
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {createBouquetOrder, getBouquetItems, getAllBouquetOrders,confirmBouquetOrder,rejectBouquetOrder}