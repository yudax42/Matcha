const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get('/home',isAuth,userController.getMatch);
router.get('/profile',isAuth,userController.getProfile);
router.get('/profileData',isAuth,userController.getProfileData);


module.exports = router;