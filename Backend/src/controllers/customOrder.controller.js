const customOrderModel = require('../models/customOrder.model');
const {uploadFile} = require('../services/storage.services');

async function createCustomOrder(req,res){
    try{
        const { productType, description, colorPreference, quantity, budget, name, contact } = req.body;

        if(!productType || !description || !quantity || !name || !contact){
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

         let referenceImage = null;
        if (req.file) {
            const uploaded = await uploadFile(req.file.buffer);
            referenceImage = uploaded.url;
        }

         const customOrder = await customOrderModel.create({
            user: req.user?.id || null,
            productType,
            description,
            colorPreference,
            quantity,
            budget,
            referenceImage,
            name,
            contact
        });

        return res.status(201).json({ message: 'Custom order submitted successfully', customOrder });
    
    }catch(error){
        return res.status(500).json({ message: 'Error submitting custom order', error: error.message });
    }
}

async function getCustomOrders(req,res){
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can view orders' });
        }

        const orders = await customOrderModel.find().sort({ createdAt: -1 });  // newest → oldest
        return res.status(200).json({ orders });

    } catch (error) {
        return res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
}

async function updateCustomOrderStatus(req,res){
    try{
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can update orders' });
        }

        const { orderId } = req.params;
        const { status, adminReply } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Please provide a status' });
        }

        const order = await customOrderModel.findById(orderId);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const updatedOrder = await customOrderModel.findByIdAndUpdate(
            orderId,
            { status, adminReply },
            { new: true }
        );

        return res.status(200).json({ message: 'Order updated successfully', order });

    } catch (error) {
        return res.status(500).json({ message: 'Error updating order', error: error.message });
    }
}


module.exports = {createCustomOrder, getCustomOrders, updateCustomOrderStatus}