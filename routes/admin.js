const express = require('express');
const adminController = require('../controllers/admin');
const isAdminAuth = require('../middleware/is_admin_auth');
const isAdminNotAuth = require('../middleware/is_admin_not_auth');
const router = express.Router();

router.get('/',isAdminNotAuth ,adminController.getAdminAuth);
router.post('/enter',adminController.postAdminEnter);
router.get('/statistics',isAdminAuth,adminController.getStatistics);
router.get('/allUsers',isAdminAuth,adminController.getAllUsers);
router.get('/getUsers',isAdminAuth,adminController.getUsers);
router.get('/home',isAdminAuth, adminController.getAdminHome);
router.post('/deleteUser/',isAdminAuth,adminController.deleteUser);
router.post('/updateUserState',isAdminAuth,adminController.updateUserState);
router.get('/sendEmail/:userName',isAdminAuth,adminController.sendEmail);
router.post('/sendEmail/',isAdminAuth,adminController.actionSendEmail);
router.get('/logout',isAdminAuth, adminController.adminLogout);

//
router.get('/onlineUsers',isAdminAuth,adminController.onlineUsers);
router.get('/getOnlineUsers',isAdminAuth,adminController.getOnlineUsers);

router.get('/reports',isAdminAuth,adminController.reports);
router.get('/getReports',isAdminAuth,adminController.getReports);

module.exports = router;