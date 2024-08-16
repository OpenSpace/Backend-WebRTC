const Server = require('../models/serverModel');
const { Sequelize } = require('sequelize');

exports.createServer = async (req, res) => {
    try {
        req.body.available_instances = req.body.available_instances || req.body.num_instances;
        const server = await Server.create(req.body);
        res.status(201).send(server);
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.getAllServers = async (req, res) => {
    try {
        const servers = await Server.findAll();
        res.status(200).send(servers);
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
        const query = {
            where: {
                available_instances: {
                    [Sequelize.Op.gt]: 0
                }
            }
        };
        const servers = await Server.findAll(query, { logging: (sql) => console.log(sql) });
        res.status(200).send(servers);
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.deleteServer = async (req, res) => {
    try {
        const server = await Server.findByPk(req.params.id);
        if (!server) return res.status(404).send('Server not found');
        await server.destroy();
        res.status(204).send();
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.getServerInfo = async (req, res) => {
    try {
        const query = {
            attributes: ['server_id', 'region', 'ip_address', 'status', 'num_instances', 'available_instances']
        };
        const servers = await Server.findAll(query);
        const serverCount = servers.length;
        const availableInstances = servers
                                    .filter(server => server.available_instances > 0)
                                    .map(server => server.available_instances)
                                    .reduce((a, b) => a + b, 0);
        res.status(200).send({ serverCount, availableInstances });
    } catch (err) {
        res.status(400).send(err);
    }
}