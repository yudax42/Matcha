const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const isProfileDone = require('../middleware/profileCompleted');

router.get('/home', isAuth, isProfileDone, userController.getMatch);
router.get('/homeData', isAuth, isProfileDone, userController.getMatchData);
router.get('/searchData', isAuth,isProfileDone , userController.getSearchData);
router.get('/profile', isAuth, userController.getProfile);
router.get('/public/:user', isAuth, isProfileDone, userController.getPublicProfile);
router.get('/profileData', isAuth, userController.getProfileData);
router.post('/profileData', isAuth, userController.postProfileData);
router.post('/addProfileImg', isAuth, userController.addProfileImgs);
router.post('/actions', isAuth,isProfileDone, userController.actions);
router.get('/chat',isAuth, userController.chats);
router.get('/chatUsers',isAuth, userController.getMatchedUsers);

module.exports = router;
