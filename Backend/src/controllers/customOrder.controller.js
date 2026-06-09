const customOrderModel = require('../models/customOrder.model');
const Settings = require('../models/settings.model');
const {uploadFile} = require('../services/storage.services');
const { sendEmail } = require('../utils/sendEmail');

async function createCustomOrder(req,res){
    try{
        const { productType, bouquetSize, flowerSelection, wrapperStyle, description, colorPreference, quantity, budget, name, contact, occasion } = req.body;

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
            bouquetSize: bouquetSize || '',
            flowerSelection: Array.isArray(flowerSelection)
                ? flowerSelection
                : flowerSelection ? [flowerSelection] : [],
            wrapperStyle: wrapperStyle || '',
            occasion,
            description,
            colorPreference,
            quantity: Number(quantity) || 1,
            budget: budget ? Number(budget.toString().replace(/[^0-9.]/g, '')) : null,
            referenceImage,
            name,
            contact
        });

        const settings = await Settings.findOne();
        const notificationEmail = process.env.CUSTOM_ORDER_NOTIFICATION_EMAIL || settings?.contactEmail || process.env.CONTACT_NOTIFICATION_EMAIL || process.env.EMAIL_USER;

        if (notificationEmail) {
            try {
                await sendEmail({
                    to: notificationEmail,
                    subject: `New custom order request from ${name}`,
                    text: `New custom order request details:\n\nName: ${name}\nContact: ${contact}\nProduct type: ${productType}\nBouquet size: ${bouquetSize || 'Not specified'}\nFlowers: ${Array.isArray(customOrder.flowerSelection) ? customOrder.flowerSelection.join(', ') : 'None'}\nWrapper: ${customOrder.wrapperStyle || 'No preference'}\nColors: ${colorPreference || 'No preference'}\nBudget: ${budget || 'Not specified'}\nQuantity: ${customOrder.quantity}\nOccasion: ${occasion || 'None'}\nDescription: ${description}\n\nReference Image: ${referenceImage || 'None'}`
                });
            } catch (emailError) {
                console.warn('Custom order saved but failed to send notification email:', emailError.message);
            }
        }

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