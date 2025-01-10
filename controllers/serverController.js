const Server = require('../models/Server');
const Instance = require('../models/Instance');
const { Sequelize } = require('sequelize');
const WebSocket = require('ws');

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
        const servers = await Server.findAll({
            include: [{
                model: Instance,
                required: false,
            }]
        });
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

exports.updateServer = async (req, res) => {
    const { server_id } = req.params;
    const {
        region,
        ip_address,
        port,
        status,
        available_instances,
        num_instances,
        ram,
        graphics_card,
        storage
    } = req.body;

    try {
        const server = await Server.findByPk(server_id);

        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        // Update the server's fields
        server.region = region !== undefined ? region : server.region;
        server.ip_address = ip_address !== undefined ? ip_address : server.ip_address;
        server.port = port !== undefined ? port : server.port;
        server.status = status !== undefined ? status : server.status;
        server.available_instances = available_instances !== undefined ? available_instances : server.available_instances;
        server.num_instances = num_instances !== undefined ? num_instances : server.num_instances;
        server.ram = ram !== undefined ? ram : server.ram;
        server.graphics_card = graphics_card !== undefined ? graphics_card : server.graphics_card;
        server.storage = storage !== undefined ? storage : server.storage;

        await server.save();

        return res.status(200).json(server);
    } catch (error) {
        console.error('Error updating server:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

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
        // add a new column to the result
        servers.forEach(server => {
            server.dataValues.is_available = server.available_instances > 0;
            server.dataValues.used_instances = server.num_instances - server.available_instances;
            server.dataValues.isJoined = false;
        });
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

exports.joinServer = async (req, res) => {
    const { session_id } = req.body;

    if (!session_id) {
        return res.status(400).json({ message: 'session_id is required' });
    }

    try {
        // Find a server with high availability and low utilization
        const activeServers = await Server.findAll({
            where: {
                status: 'active',
                [Sequelize.Op.and]: [
                    { available_instances: { [Sequelize.Op.gt]: 0 } },
                    { available_instances: { [Sequelize.Op.lte]: Sequelize.col('num_instances') } }
                ]
            },
            order: [
                [[Sequelize.literal('CAST(available_instances AS FLOAT) / CAST(num_instances AS FLOAT)'), 'DESC']],
            ],
        });
        if (activeServers.length === 0) {
            return res.status(404).json({ message: 'No active servers available' });
        }
        const selectedServer = activeServers[0];


        // Send "START" command to the Python application using WebSocket
        const uri = `ws://${selectedServer.ip_address}:${selectedServer.port}`;
        console.log(`Connecting to WebSocket server at ${uri}`);
        const ws = new WebSocket(uri);
        ws.on('open', () => {
            console.log(`WebSocket connection established. Sending "START" command...`);
            const message = JSON.stringify({ command: 'START' });
            ws.send(message);
            console.log(`Sent message: ${message}`);
        });

        ws.on('message', async (message) => {
            console.log(`Received response from server: ${message}`);
            let response;
            try {
                response = JSON.parse(message);
            } catch (error) {
                console.error('Failed to parse message:', error);
                return res.status(500).json({ message: 'Invalid response format from server' });
            }

            if(response.error !== "none" || response.id === -1) {
                return res.status(500).json({ error: response.error });
            }

            await Server.update(
                { available_instances: selectedServer.available_instances - 1 },
                { where: { server_id: selectedServer.server_id } }
            );

            const newInstance = await Instance.create({
                session_id,
                process_id: response.id,
                server_id: selectedServer.server_id,
                status: "INITIALIZING",
            });

            ws.close();

            return res.status(200).json({
                message: 'Instance created successfully',
                instanceId: newInstance.instance_id,
                sessionId: newInstance.session_id,
                serverId: selectedServer.server_id,
                serverIP: selectedServer.ip_address,
                serverPort: selectedServer.port,
            });
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            return res.status(500).json({ message: 'Failed to communicate with the server' });
        });
    } catch (error) {
        console.error('Error handling /join request:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.joinSpecificServer = async (req, res) => {

    const { server_id } = req.params;
    const { session_id } = req.body;

    if (!session_id || !server_id) {
        return res.status(400).json({ message: 'session_id and server_id are required' });
    }

    try {

        const server = await Server.findByPk(server_id);
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        if (server.available_instances <= 0) {
            return res.status(400).json({ message: 'Server is full' });
        }

        // Send "START" command to the Python application using WebSocket
        const uri = `ws://${server.ip_address}:${server.port}`;
        console.log(`Connecting to WebSocket server at ${uri}`);

        const ws = new WebSocket(uri);
        ws.on('open', () => {
            console.log(`WebSocket connection established. Sending "START" command...`);
            // const message = 'START\n';
            const message = JSON.stringify({ command: 'START' });
            ws.send(message);
            console.log(`Sent message: ${message}`);
        }

        );

        ws.on('message', async (message) => {

            console.log(`Received response from server: ${message}`);

            let response;
            try {
                response = JSON.parse(message);
            }
            catch (error) {
                console.error('Failed to parse message:', error);
                return res.status(500).json({ message: 'Invalid response format from server' });
            }

            if(response.error !== "none" || response.id === -1) {
                return res.status(500).json({ error: response.error });
            }

            await Server.update(
                { available_instances: server.available_instances - 1 },
                { where: { server_id: server.server_id } }
            );

            const newInstance = await Instance.create({
                session_id,
                process_id: response.id,
                server_id: server.server_id,
                status: "INITIALIZING",
            });

            ws.close();

            return res.status(200).json({
                message: 'Instance created successfully',
                instanceId: newInstance.instance_id,
                sessionId: newInstance.session_id,
                serverId: server.server_id,
                serverIP: server.ip_address,
                serverPort: server.port,
            });
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            return res.status(500).json({ message: 'Failed to communicate with the server' });
        });
    }
    catch (error) {
        console.error('Error handling /join request:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}



exports.getServerInfo = async (req, res) => {
    try {
        const query = {
            attributes: ['server_id', 'region', 'ip_address', 'status', 'num_instances', 'available_instances']
        };
        const servers = await Server.findAll(query);
        const serverCount = servers
            .filter(server => server.status === 'active')
            .length;
        const availableInstances = servers
            .filter(server => server.status === 'active')
            .filter(server => server.available_instances > 0)
            .map(server => server.available_instances)
            .reduce((a, b) => a + b, 0);
        res.status(200).send({ serverCount, availableInstances });
    } catch (err) {
        res.status(400).send(err);
    }
}