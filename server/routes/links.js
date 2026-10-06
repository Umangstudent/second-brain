const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const linksController = require('../controllers/linksController');

router.use(auth);

router.get('/', linksController.getLinks);
router.get('/:id', linksController.getLinkById);
router.post('/', linksController.createLink);
router.put('/:id', linksController.updateLink);
router.delete('/:id', linksController.deleteLink);
router.patch('/:id/share', linksController.toggleShare);

module.exports = router;
