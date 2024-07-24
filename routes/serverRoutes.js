const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');

router.post('/', serverController.createServer);
router.get('/:id', serverController.getServer);
router.get('/available', serverController.getAvailableServers);

module.exports = router;
