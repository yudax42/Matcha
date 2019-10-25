const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

router.get('/signup', authController.getSignup);
router.get('/login', authController.getLogin);
router.post('/signup', authController.postSignup);
router.post('/login', authController.postLogin);
router.get('/logout', authController.postLogout);


module.exports = router;
