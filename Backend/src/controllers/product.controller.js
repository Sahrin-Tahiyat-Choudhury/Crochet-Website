const productModel = require('../models/product.model');
const categoryModel = require('../models/category.model');
const {uploadFile} = require('../services/storage.services');
const jwt = require('jsonwebtoken');
const csv = require('csv-parser');
const stream = require('stream');


async function createProduct(req, res) {

    const { name, description, colors,material,careInstructions,lowStockAlertAt, isFeatured, isHidden,isDraft} = req.body;
    console.log("req.body =", req.body);
    console.log("colors =", colors);
    //const colors = req.body.colors? req.body.colors.split(',').map(c => c.trim()): [];
    const originalPrice = Number(req.body.price?.originalPrice ?? req.body['price.originalPrice'] ?? 0);
    const sellingPrice  = Number(req.body.price?.sellingPrice  ?? req.body['price.sellingPrice']  ?? 0);
    const stockQuantity = Number(req.body.stockQuantity ?? 0);
    
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: "Image file is required and must be sent as form-data field 'image'" });
    }
    const result = await uploadFile(file.buffer.toString('base64'));

    //const discountPercentage = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;

    
    const product = await productModel.create({
        uri: result.url,
        name,
        description,
        colors: colors? colors.split(',').map(c => c.trim()):[],
        price: {
            originalPrice,
            sellingPrice
        },
        isFeatured: isFeatured === 'true' || isFeatured === true,
        isHidden:   isHidden   === 'true' || isHidden   === true,
        isDraft:    isDraft    === 'true' || isDraft    === true,
        material,
        careInstructions,
        stockQuantity: Number(stockQuantity),
        lowStockAlertAt,
        admin: req.user.id,
    })
if (product.category) {
    await categoryModel.findByIdAndUpdate(product.category, {
        $addToSet: { products: product._id }
    });
}
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
            lowStockAlertAt:product.lowStockAlertAt,
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

// new code
async function getAllProducts(req, res) {
    const { page = 1, limit = 50 } = req.query;  // accept from frontend

    const products = await productModel
        .find()
        .populate('category', 'name')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select('name uri description price category isFeatured stockQuantity isHidden isDraft material careInstructions colors createdAt');

    const total = await productModel.countDocuments();

    res.status(200).json({
        message: 'Products fetched successfully',
        products,
        total,        // send total so frontend can paginate correctly
        page: Number(page),
        limit: Number(limit)
    });
}

async function getProductById(req, res) {
    const productId = req.params.productId; 

    const product = await productModel.findById(productId).populate("category");

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
        message: "Product fetched successfully",
        product: product,
    })
}

async function getAllCategories(req, res) {
    const categories = await categoryModel
    .find()
    .select("name admin products isHidden order")
    .populate("admin","username email")
    .populate("products", "_id")
    .sort({ order: 1 });

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
        console.log("EDIT BODY:", req.body);
        const { productId, name, description,colors, material, careInstructions, stockQuantity, originalPrice, sellingPrice, isFeatured, isHidden, isDraft,category } = req.body;
        
        const oldProduct = await productModel.findById(productId);
         if (!oldProduct) return res.status(404).json({ message: "Product not found" });


        const product = await productModel.findByIdAndUpdate(productId,
            { name, description,colors, material,careInstructions, stockQuantity, price: { originalPrice, sellingPrice }, isFeatured, isHidden, isDraft,category },
            { new: true });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
         // if category changed, update the category's products arrays
        const oldCatId = String(oldProduct.category || '');
        const newCatId = String(category || '');

        if (oldCatId !== newCatId) {
            if (oldProduct.category) {
                await categoryModel.findByIdAndUpdate(oldProduct.category, {
                    $pull: { products: productId }
                });
            }
            if (category) {
                await categoryModel.findByIdAndUpdate(category, {
                    $addToSet: { products: productId }
                });
            }
        }
        res.status(200).json({
            message: "Product updated successfully",
            product
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
        if (product.category) {
            await categoryModel.findByIdAndUpdate(product.category, {
                $pull: { products: productId }
            });
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

/**
 * Imports products from a CSV file.
 * 
 * Expected CSV columns:
 * - name (string, required)
 * - description (string, required)
 * - originalPrice (number, required)
 * - sellingPrice (number, required)
 * - stockQuantity (number, required)
 * - colors (string, optional, comma-separated)
 * 
 * The CSV file must be sent as form-data field 'file'.
 */
async function importProducts(req, res) {

  if (!req.file) {
    return res.status(400).json({ message: "CSV file is required and must be sent as form-data field 'csv'" });
  }

  const products = [];

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  bufferStream
    .pipe(csv())
    .on('data', row => {
      products.push({
        name: row.name || "Untitled",
        description: row.description || "",
        price: {
          originalPrice:  row.originalPrice ? Number(row.originalPrice) : 0,
          sellingPrice: row.sellingPrice ? Number(row.sellingPrice) : 0,
        },
        stockQuantity: row.stockQuantity?Number(row.stockQuantity):0,
        colors: row.colors ? row.colors.split(',').map(c => c.trim()) : [],
        material: row.material || "",
        careInstructions: row.careInstructions || "",
        isFeatured: row.isFeatured === "true",
        isHidden: row.isHidden === "true",
        isDraft: row.isDraft === "true",
        uri: row.uri || (row.name ? row.name.toLowerCase().replace(/\s+/g, '-') : 'untitled'),
        admin: req.user?.id || null
      });
    })
    .on('end', async () => {
      try {
        console.log("req.user:", req.user);
        console.log("products:", products);


        await productModel.insertMany(products);
        res.json({
          message: 'Products imported successfully',
          count: products.length
        });
      } catch (error) {
        res.status(500).json({
          message: 'Error importing products',
          error: error.message
        });
      }
    });
}
      


module.exports = { createProduct, createCategory, getAllProducts, getAllCategories, getCategoryById, getProductById, editProduct, deleteProduct, editCategory, deleteCategory, filterAndSortProducts, importProducts };