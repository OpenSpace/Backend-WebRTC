const Server = require('../models/serverModel');

exports.createServer = async (req, res) => {
    try {
        const server = await Server.create(req.body);
        res.status(201).send(server);
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.getServer = async (req, res) => {
    try {
        const server = await Server.findByPk(req.params.id);
        if (!server) return res.status(404).send('Server not found');
        res.status(200).send(server);
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.getAvailableServers = async (req, res) => {
    try {
        const servers = await Server.findAll({ where: { num_instances: { [Op.gt]: 0 } } });
        res.status(200).send(servers);
    } catch (err) {
        res.status(400).send(err);
    }
};
