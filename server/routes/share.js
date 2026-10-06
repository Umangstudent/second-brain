const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');

router.get('/:hash', shareController.getSharedContent);

module.exports = router;
