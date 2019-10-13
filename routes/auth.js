const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

router.get('/signup',authController.userSignup);
router.get('/login',authController.userLogin);
router.get('/',authController.userLogin);
module.exports = router;