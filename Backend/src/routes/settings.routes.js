const express =
  require("express");

const router =
  express.Router();

const settingsController =
  require(
    "../controllers/settings.controller"
  );

const authMiddleware =
  require(
    "../middlewares/auth.middleware"
  );

router.get(
  "/",
  authMiddleware.authAdmin,
  settingsController.getSettings
);

router.patch(
  "/",
  authMiddleware.authAdmin,
  settingsController.updateSettings
);

module.exports = router;