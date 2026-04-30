const bouquetOrderController = require('../controllers/bouquetOrder.controller')
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get('/bouquet-items', authMiddleware.authUser,bouquetOrderController.getBouquetItems);
router.post('/', authMiddleware.authUser,bouquetOrderController.createBouquetOrder);

module.exports = router;