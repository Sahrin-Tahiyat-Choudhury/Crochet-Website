const productModel = require('../models/product.model');
const orderModel = require('../models/order.model');
const cartModel = require('../models/cart.model');
const { getCouponDiscount } = require('../services/coupon.service');

function parseQuantity(value, defaultValue = 1) {
    const parsedValue = Number(value ?? defaultValue);
    return Number.isInteger(parsedValue) ? parsedValue : NaN;
}

function getCartItemPayload(body = {}) {
    const item = body.item || body.items || {};

    return {
        productId: body.productId || item.productId,
        quantity: parseQuantity(body.quantity ?? item.quantity, 1),
        couponCode: body.couponCode || null
    };
}

function calculateSubtotal(items) {
    return items.reduce((sum, item) => {
        return sum + (item.productId.price.sellingPrice * item.quantity);
    }, 0);
}

async function getPopulatedCart(userId) {
    return cartModel.findOne({ userId }).populate(
        'items.productId',
        'name uri stockQuantity price'
    );
}

async function addToCart(req, res) {
    try {
        const { productId, quantity, couponCode } = getCartItemPayload(req.body);

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stockQuantity < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        let cart = await cartModel.findOne({ userId: req.user.id });

        if (!cart) {
            cart = await cartModel.create({
                userId: req.user.id,
                items: [{ productId, quantity }]
            });
        } else {
            const existingItem = cart.items.find(
                (item) => item.productId.toString() === productId
            );

            if (existingItem) {
                const updatedQuantity = existingItem.quantity + quantity;

                if (product.stockQuantity < updatedQuantity) {
                    return res.status(400).json({ message: 'Not enough stock available' });
                }

                existingItem.quantity = updatedQuantity;
            } else {
                cart.items.push({ productId, quantity });
            }

            await cart.save();
        }

        if (couponCode) {
            cart.couponCode = couponCode.trim().toUpperCase();
            await cart.save();
        }

        const populatedCart = await getPopulatedCart(req.user.id);

        res.status(201).json({
            message: 'Item added to cart',
            cart: populatedCart
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
}

async function getCart(req, res) {
    try {
        const cart = await getPopulatedCart(req.user.id);

        if (!cart) {
            return res.json({
                items: [],
                couponCode: null,
                subtotal: 0
            });
        }

        res.json({
            _id: cart._id,
            userId: cart.userId,
            items: cart.items,
            couponCode: cart.couponCode,
            subtotal: calculateSubtotal(cart.items)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart details', error: error.message });
    }
}

async function updateCartItem(req, res) {
    try {
        const quantity = parseQuantity(req.body.quantity);
        const { productId } = req.params;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stockQuantity < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        const cart = await cartModel.findOne({ userId: req.user.id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find((cartItem) => cartItem.productId.toString() === productId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        item.quantity = quantity;
        await cart.save();

        const populatedCart = await getPopulatedCart(req.user.id);

        res.json({
            message: 'Cart item updated',
            cart: populatedCart
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart item', error: error.message });
    }
}

async function removeCartItem(req, res) {
    try {
        const { productId } = req.params;
        const cart = await cartModel.findOne({ userId: req.user.id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.couponCode = null;
        await cart.save();

        const populatedCart = await getPopulatedCart(req.user.id);

        res.json({
            message: 'Item removed from cart',
            cart: populatedCart
        });
    } catch (error) {
        res.status(500).json({ message: 'Error removing cart item', error: error.message });
    }
}

async function clearCart(req, res) {
    try {
        const cart = await cartModel.findOne({ userId: req.user.id });

        if (!cart) {
            return res.json({ message: 'Cart is already empty' });
        }

        cart.items = [];
        cart.couponCode = null;
        await cart.save();

        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart', error: error.message });
    }
}

async function applyCoupon(req, res) {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        const cart = await getPopulatedCart(req.user.id);

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        if (!cart.items.length) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const subtotal = calculateSubtotal(cart.items);

        const { coupon, discountAmount, finalAmount } = await getCouponDiscount({
            code,
            totalAmount: subtotal
        });

        cart.couponCode = coupon.code;
        await cart.save();

        res.json({
            message: 'Coupon applied successfully',
            couponCode: coupon.code,
            subtotal,
            discountAmount,
            finalAmount
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function removeCoupon(req, res) {
    try {
        const cart = await cartModel.findOne({ userId: req.user.id });

        if (!cart) {
            return res.json({ message: 'Cart not found', couponCode: null });
        }

        cart.couponCode = null;
        await cart.save();

        res.json({ message: 'Coupon removed successfully', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error removing coupon', error: error.message });
    }
}

async function checkout(req, res) {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ message: 'Address is required' });
        }

        const cart = await getPopulatedCart(req.user.id);

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        if (!cart.items.length) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const orderProducts = [];

        for (const item of cart.items) {
            const product = item.productId;

            if (!product) {
                return res.status(404).json({ message: 'One or more products were not found' });
            }

            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    message: `${product.name} does not have enough stock`
                });
            }

            orderProducts.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.price.sellingPrice
            });
        }

        const totalAmount = calculateSubtotal(cart.items);

        let coupon = null;
        let discountAmount = 0;
        let finalAmount = totalAmount;

        if (cart.couponCode) {
            const couponData = await getCouponDiscount({
                code: cart.couponCode,
                totalAmount
            });

            coupon = couponData.coupon;
            discountAmount = couponData.discountAmount;
            finalAmount = couponData.finalAmount;
        }

        const order = await orderModel.create({
            userId: req.user.id,
            products: orderProducts,
            totalAmount,
            discountAmount,
            finalAmount,
            coupon: coupon ? coupon._id : null,
            couponCode: coupon ? coupon.code : null,
            address
        });

        for (const item of orderProducts) {
            const product = await productModel.findById(item.productId);

            if (product) {
                product.stockQuantity -= item.quantity;
                product.sold += item.quantity;
                await product.save();
            }
        }

        cart.items = [];
        cart.couponCode = null;
        await cart.save();

        res.status(201).json({
            message: 'Checkout completed successfully',
            order
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error during checkout', error: error.message });
    }
}

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    checkout
};
