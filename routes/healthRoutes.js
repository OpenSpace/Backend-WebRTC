const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.get('/liveliness', healthController.liveliness);
router.get('/readiness', healthController.readiness);

module.exports = router;
