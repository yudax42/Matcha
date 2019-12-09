const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();
const isNotAuth = require('../middleware/is_not_auth');

router.get("/signup", isNotAuth,authController.getSignup);
router.get("/login", isNotAuth,authController.getLogin);
router.post("/signup", isNotAuth,authController.postSignup);
router.post("/login", isNotAuth,authController.postLogin);
router.get("/logout", authController.postLogout);
router.get("/validate/:token", isNotAuth,authController.activateAccount);
router.post("/resetPass", isNotAuth,authController.resetPass);
router.get("/reset/:token", isNotAuth,authController.getResetPass);
router.post("/reset/", isNotAuth,authController.postResetPass);
module.exports = router;
