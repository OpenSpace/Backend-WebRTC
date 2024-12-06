const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');

router.post('/', serverController.createServer);  
router.get('/', serverController.getAllServers);

// more specific routes comes first
router.get('/available', serverController.getAvailableServers);
router.get('/info', serverController.getServerInfo);

router.get('/:id', serverController.getServer);

router.put('/:server_id', serverController.updateServer);

router.delete('/:id', serverController.deleteServer);

router.post('/join', serverController.joinServer);

router.post('/join/:server_id', serverController.joinSpecificServer);

module.exports = router;