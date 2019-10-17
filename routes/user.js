const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();
const isAuth = require('../middleware/is-auth');


router.get('/profile',isAuth,userController.getProfile);


module.exports = router;