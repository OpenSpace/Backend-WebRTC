const express = require('express');
const router = express.Router();
const instanceController = require('../controllers/instanceController');

// CRUD operations for instances
router.post('/', instanceController.createInstance);
router.get('/', instanceController.getAllInstances);

// more specific routes comes first
router.get('/running-instances', instanceController.getRunningInstances);

router.get('/:id', instanceController.getInstance);
router.put('/:id/terminate', instanceController.terminateInstance);

module.exports = router;
