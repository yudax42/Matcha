const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get('/home', isAuth, userController.getMatch);
router.get('/homeData', isAuth, userController.getMatchData);
router.get('/searchData', isAuth, userController.getSearchData);
router.get('/profile', isAuth, userController.getProfile);
router.get('/public/:user', isAuth, userController.getPublicProfile);
router.get('/profileData', isAuth, userController.getProfileData);
router.post('/profileData', isAuth, userController.postProfileData);
router.post('/addProfileImg', isAuth, userController.addProfileImgs);

module.exports = router;
