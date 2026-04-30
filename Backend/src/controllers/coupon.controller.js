const productModel = require('../models/product.model');
const orderModel = require('../models/order.model');
const userModel = require('../models/user.model');
const couponModel = require('../models/coupon.model');

//Create Coupon

async function createCoupon(req, res) {
  try {
    const { code, discountType, value, minOrderAmount, isActive, expiryDate } = req.body;

    // Validate required fields
    if (!discountType || !['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({ message: "discountType is required and must be 'percentage' or 'fixed'" });
    }
    if (!expiryDate) {
      return res.status(400).json({ message: "expiryDate is required" });
    }

    // Parse expiryDate from DD-MM-YYYY to Date object
    const [day, month, year] = expiryDate.split('-').map(Number);
    const parsedExpiryDate = new Date(year, month - 1, day);  // Month is 0-based in JS

    if (isNaN(parsedExpiryDate.getTime())) {
      return res.status(400).json({ message: "Invalid expiryDate format. Use DD-MM-YYYY." });
    }

    // Create the coupon with parsed data
    const coupon = await couponModel.create({
      code,
      discountType,
      value,
      minOrderAmount: minOrderAmount || 0,
      isActive: isActive !== undefined ? isActive : true,
      expiryDate: parsedExpiryDate
    });

    res.json({ message: "Coupon created", coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

//Get all coupons
async function getCoupons(req, res) {
  const coupons = await couponModel.find();
  res.json(coupons);
}

//Edit Coupon
async function updateCoupon(req, res) {
  const { code, discountType, value, minOrderAmount, isActive, expiryDate } = req.body;

  let parsedExpiryDate = expiryDate;

  if (expiryDate) {
    const [day, month, year] = expiryDate.split('-').map(Number);             // split('-').map(Number) -> turns the date string into day/month/year numbers,
    parsedExpiryDate = new Date(year, month - 1, day);                      //new Date(year, month - 1, day) -> builds a JS Date,
    if (isNaN(parsedExpiryDate.getTime()))                                 //isNaN(...) checks whether that date is valid.
      {
      return res.status(400).json({ message: "Invalid expiryDate format. Use DD-MM-YYYY." });
    }
  }

  const coupon = await couponModel.findByIdAndUpdate(
    req.params.id,
    {code,
    discountType,
    value,
    minOrderAmount,
    isActive,
    expiryDate: parsedExpiryDate},
    { new: true }
  );

  res.json(coupon);
}


//Delete Coupon
async function deleteCoupon(req, res) {
  await couponModel.findByIdAndDelete(req.params.id);
  res.json({ message: "Coupon deleted" });
}

module.exports = {createCoupon, getCoupons, updateCoupon, deleteCoupon}
