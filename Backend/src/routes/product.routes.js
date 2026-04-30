const express = require('express');
const productController = require("../controllers/product.controller")
const authMiddleware = require("../middlewares/auth.middleware");
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
})

const router = express.Router();

/*
Create - a product, a category
(Admin only)

*/
router.post('/upload', authMiddleware.authAdmin, upload.single("image"), productController.createProduct);
router.post('/category',authMiddleware.authAdmin, productController.createCategory);

/*
-Edit product details
-Delete product
-Set price (MRP + selling price)
-Manage stock quantity
-Add product variants (color, size)
-Mark product as featured
- Hide/show product
*/
router.patch("/edit-product", authMiddleware.authAdmin, productController.editProduct)
router.delete("/delete-product/:productId", authMiddleware.authAdmin, productController.deleteProduct)

/*
View all products and all categories 
*/
router.get("/",authMiddleware.authUserAndAdmin, productController.getAllProducts)
router.get("/products/:productId",authMiddleware.authUserAndAdmin, productController.getProductById)
router.get("/search",authMiddleware.authUserAndAdmin,productController.filterAndSortProducts)
router.get("/", authMiddleware.authUserAndAdmin, productController.filterAndSortProducts);


router.get("/categories",authMiddleware.authUserAndAdmin, productController.getAllCategories)
router.get("/categories/:categoryId",authMiddleware.authUserAndAdmin, productController.getCategoryById)
router.get("/search",authMiddleware.authUserAndAdmin,productController.filterAndSortProducts)

/**
- Edit category ( includes show/hide category, Arrange category order)
- Delete category
 */
router.patch("/edit-category", authMiddleware.authAdmin, productController.editCategory)
router.delete("/delete-category/:categoryId", authMiddleware.authAdmin, productController.deleteCategory)


module.exports = router;