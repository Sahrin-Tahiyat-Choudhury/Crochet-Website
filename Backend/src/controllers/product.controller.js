const productModel = require('../models/product.model');
const categoryModel = require('../models/category.model');
const {uploadFile} = require('../services/storage.services');
const jwt = require('jsonwebtoken');

async function createProduct(req, res) {

    const { name, description,material, careInstructions, stockQuantity, isFeatured, isHidden} = req.body;
    const originalPrice = req.body.price?.originalPrice ?? req.body['price.originalPrice'];
    const sellingPrice = req.body.price?.sellingPrice ?? req.body['price.sellingPrice'];
    
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: "Image file is required and must be sent as form-data field 'image'" });
    }
    const result = await uploadFile(file.buffer.toString('base64'));

    const discountPercentage = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;

    const product = await productModel.create({
        uri: result.url,
        name,
        description,
        price: {
            originalPrice,
            sellingPrice
        },
        isFeatured,
        isHidden,
        material,
        careInstructions,
        stockQuantity,
        admin: req.user.id,
    })

    res.status(201).json({
        message: "Product created successfully",
        product: {
            id: product._id,
            uri: product.uri,
            name: product.name,
            description: product.description,
            material: product.material,
            careInstructions: product.careInstructions,
            stockQuantity: product.stockQuantity,
            originalPrice: product.price.originalPrice,
            sellingPrice: product.price.sellingPrice,
            discountPercentage: product.discountPercentage,
            isFeatured: product.isFeatured,
            isHidden: product.isHidden,
            admin: product.admin
        }
    })

}

async function createCategory(req, res) {
        const {name, products, isHidden,order} = req.body;

        const category = await categoryModel.create({
            name: name,
            admin: req.user.id,
            products: products,
            isHidden,
            order
        })

        res.status(201).json({
            message: "Category created successfully",
            category: {    
                id: category._id,
                name: category.name,
                admin: category.admin,
                products: category.products,
                isHidden: category.isHidden,
                order: category.order
            }
        })
}

async function getAllProducts(req, res) {
        
    const products = await productModel
        .find()
        .skip(0)
        .limit(10)
        .select("name image price");

    res.status(200).json({
            message: "Products fetched successfully",
            products: products,
        })
    }

async function getProductById(req, res) {
    const productId = req.params.productId; 

    const product = await productModel.findById(productId).populate("name category ");

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
        message: "Product fetched successfully",
        product: product,
    })
}

async function getAllCategories(req, res) {
    const categories = await categoryModel.find().select("name admin").populate("admin","username email");

    res.status(200).json({
            message: "Categories fetched successfully",
            categories: categories,
        })
}

async function getCategoryById(req, res) {
    const categoryId = req.params.categoryId;

    const category = await categoryModel.findById(categoryId).populate("admin","username email").populate("products");

    return res.status(200).json({
        message: "Category fetched successfully",
        category: category,
    })
}

/*-Edit product details
-Delete product
*/
async function editProduct(req, res) {
    try{
        const { productId, name, description, material, careInstructions, stockQuantity, originalPrice, sellingPrice, isFeatured, isHidden } = req.body;
        const product = await productModel.findByIdAndUpdate(productId,
            { name, description, material, careInstructions, stockQuantity, price: { originalPrice, sellingPrice }, isFeatured, isHidden },
            { new: true });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({
            message: "Product updated successfully",
            product: {
                id: product._id,
                uri: product.uri,
                name: product.name,
                description: product.description,
                material: product.material,
                careInstructions: product.careInstructions,
                stockQuantity: product.stockQuantity,
                originalPrice: product.price.originalPrice,
                sellingPrice: product.price.sellingPrice,
                discountPercentage: product.discountPercentage,
                isFeatured: product.isFeatured,
                isHidden: product.isHidden, 
                admin: product.admin
            }
        })

    }catch (error) {
            res.status(500).json({ message: "Error updating product", error });
        }
}

async function deleteProduct(req, res) {
    try{
        const productId = req.params.productId;
        const product = await productModel.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({
            message: "Product deleted successfully",
        })
    }catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
}




/**
- Edit category ( includes show/hide category)
- Delete category
- Arrange category order
 */
async function editCategory(req, res) {
    try{
        const { categoryId, name, isHidden, order } = req.body;
        const category = await categoryModel.findByIdAndUpdate(categoryId,
            { name, isHidden, order },
            { new: true });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({
            message: "Category updated successfully",
            category: {
                id: category._id,
                name: category.name,
                isHidden: category.isHidden,
                order: category.order,
                totalProducts: category.products.length,
                admin: category.admin
            }
        })
    }catch (error) {
        res.status(500).json({ message: "Error updating category", error });
    }
}

async function deleteCategory(req, res) {
    try{
        const categoryId = req.params.categoryId;
        const category = await categoryModel.findByIdAndDelete(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({
            message: "Category deleted successfully",
        })
    }catch (error) {
        res.status(500).json({ message: "Error deleting category", error });
    }
}

/*
filtering and sorting
*/ 
async function filterAndSortProducts(req, res) {
    try {
        const { category, minPrice, maxPrice, search, sort, page = 1, limit = 10 } = req.query;

        let query = {};
        
        if (category)query.category = category;

        if (search) {
            query.name = { $regex: search, $options: 'i' }; // Case-insensitive search in product name
        }

        if (minPrice || maxPrice) {
            query["price.sellingPrice"] = {};
            if (minPrice) query["price.sellingPrice"].$gte = Number(minPrice);
            if (maxPrice) query["price.sellingPrice"].$lte = Number(maxPrice);
        }

//when Order controller is implemented, we can update the sold count of the product here
//productModel.sold += quantity;
//        await productModel.save();
        
        let sortOption = {};

        switch (sort) {
            case 'isFeatured':
                sortOption.isFeatured = -1;
                break;
            case 'bestSelling':
                sortOption.sold = -1; 
                break;
            case 'price_asc':
                sortOption["price.sellingPrice"] = 1;
                break;
            case 'price_desc':
                sortOption["price.sellingPrice"] = -1;
                break;
            case 'name_asc':
                sortOption.name = 1;
                break;
            case 'name_desc':
                sortOption.name = -1;
                break;
            case 'newest':
                sortOption.createdAt = -1;
                break;
            default:
                sortOption.createdAt = 1;
        }

        const products = await productModel.find(query)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.status(200).json({
            products: products,
        })

    }catch (error) {
        res.status(500).json({ message: "Error filtering/sorting products", error });
    }
}

module.exports = { createProduct, createCategory, getAllProducts, getAllCategories, getCategoryById, getProductById, editProduct, deleteProduct, editCategory, deleteCategory, filterAndSortProducts };