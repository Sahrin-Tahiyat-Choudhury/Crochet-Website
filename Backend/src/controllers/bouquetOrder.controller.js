const bouquetOrderModel = require('../models/bouquetOrder.model');
const productModel = require('../models/product.model')

async function createBouquetOrder(req,res){
    try{
        const { flowers, wrapper} = req.body;

        if (!flowers || flowers.length === 0) {
            return res.status(400).json({ message: 'Please select at least one flower' });
        }

        for (const item of flowers) {
            const product = await productModel.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: 'Flower not found' });
            }
            totalPrice += product.price.sellingPrice * item.quantity;
        }
        if (wrapper?.product) {
            const wrapperProduct = await productModel.findById(wrapper.product);
            if (wrapperProduct) {
                totalPrice += wrapperProduct.price.sellingPrice;
            }
        }
        const bouquetOrder = await bouquetOrderModel.create({
            user: req.user?.id || null,
            flowers,
            wrapper,
            totalPrice
        });

        return res.status(201).json({ message: 'Bouquet order submitted successfully', bouquetOrder });        

    }catch(error){
        return res.status(500).json({ message: 'Error submitting bouquet order', error: error.message });
    }
}

async function getBouquetItems(req,res){
    try{
        const flowers = await productModel.find({ type: "flower", isHidden: false });
        const wrappers = await productModel.find({ type: "wrapper", isHidden: false });

        return res.status(200).json({ flowers, wrappers });
    } catch(error){
        return res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
}

module.exports = {createBouquetOrder, getBouquetItems}