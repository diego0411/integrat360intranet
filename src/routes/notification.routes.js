const express = require('express');
const { getUserNotifications, markNotificationAsRead } = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, getUserNotifications);
router.put('/:id', verifyToken, markNotificationAsRead);

module.exports = router;
