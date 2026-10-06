const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notesController = require('../controllers/notesController');

router.use(auth);

router.get('/', notesController.getNotes);
router.get('/:id', notesController.getNoteById);
router.post('/', notesController.createNote);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);
router.patch('/:id/share', notesController.toggleShare);

module.exports = router;
