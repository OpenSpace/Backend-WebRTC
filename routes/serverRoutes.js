const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const serverConnectionManager = require('../services/serverConnectionManager');

// CRUD operations for servers
router.post('/', serverController.createServer);  
router.get('/', serverController.getAllServers);

// more specific routes comes first
router.get('/available', serverController.getAvailableServers);
router.get('/info', serverController.getServerInfo);

router.get('/:id', serverController.getServer);

router.delete('/:id', serverController.deleteServer);

// Route to connect to a server
router.post('/connect', (req, res) => {
    const { serverId, serverUrl } = req.body;
    if (!serverId || !serverUrl) {
        return res.status(400).json({ message: 'Server ID and URL are required' });
    }

    try {
        serverConnectionManager.connectToServer(serverId, serverUrl);
        res.status(200).json({ message: `Connecting to server ${serverId}` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to connect to server', error });
    }
});

// Route to send a message to a server
router.post('/message', (req, res) => {
    const { serverId, message } = req.body;
    if (!serverId || !message) {
        return res.status(400).json({ message: 'Server ID and message are required' });
    }

    try {
        serverConnectionManager.sendMessageToServer(serverId, message);
        res.status(200).json({ message: 'Message sent' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send message', error });
    }
});

// Route to disconnect from a server
router.post('/disconnect', (req, res) => {
    const { serverId } = req.body;
    if (!serverId) {
        return res.status(400).json({ message: 'Server ID is required' });
    }

    try {
        serverConnectionManager.disconnectFromServer(serverId);
        res.status(200).json({ message: `Disconnected from server ${serverId}` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to disconnect from server', error });
    }
});

module.exports = router;