const express = require('express');
const router = express.Router();
const instanceController = require('../controllers/instanceController');

router.post('/', instanceController.createInstance);
router.put('/:id/exit', instanceController.exitInstance);

module.exports = router;
