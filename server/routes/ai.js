const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiController = require('../controllers/aiController');

router.use(auth);

router.post('/chat', aiController.chat);

module.exports = router;
