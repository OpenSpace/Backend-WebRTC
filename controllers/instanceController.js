const Instance = require('../models/Instance');
const Server = require('../models/Server');
const WebSocket = require('ws');

exports.createInstance = async (req, res) => {
    try {
        const instance = await Instance.create(req.body);
        res.status(201).send(instance);
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.getAllInstances = async (req, res) => {
    try {
        const instances = await Instance.findAll();
        res.status(200).send(instances);
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.getRunningInstances = async (req, res) => {
    try {
        const query = {
            where: {
                exit_time: null
            }
        };
        const instances = await Instance.findAll(query);
        res.status(200).send(instances);
    } catch (err) {
        res.status(400).send(err);
    }
}

exports.getInstance = async (req, res) => {
    try {
        const instance = await Instance.findByPk(req.params.id);
        if (!instance) return res.status(404).send('Instance not found');
        res.status(200).send(instance);
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.exitInstance = async (req, res) => {
    try {
        const instance = await Instance.findByPk(req.params.id);
        if (!instance) return res.status(404).send('Instance not found');
        instance.exit_time = new Date();
        instance.idle_time = (instance.exit_time - instance.start_time) / 1000; // in seconds
        console.log(`Instance ${instance.instance_id} was idle for ${instance.idle_time} seconds`);
        instance.status = 'stopped';
        await instance.save();
        res.status(200).send(instance);
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.terminateInstance = async (req, res) => {
    const instance_id = req.params.id;

    if (!instance_id) {
        return res.status(400).json({ message: 'instance_id is required' });
    }

    try {
        const instance = await Instance.findByPk(instance_id);
        if (!instance) {
            return res.status(404).json({ message: 'Instance not found' });
        }

        const procId = instance.process_id;

        const server = await Server.findByPk(instance.server_id);
        if (!server) {
            return res.status(404).json({ message: 'Server not found' });
        }

        // Send "STOP" command to the Python application using WebSocket
        const uri = `ws://${server.ip_address}:${server.port}`;
        console.log(`Connecting to WebSocket server at ${uri}`);

        const ws = new WebSocket(uri);
        
        ws.on('open', () => {
            console.log(`WebSocket connection established. Sending "STOP" command...`);
            const message = `STOP\n${procId}`;
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

            // const process_status = response.procStatus;

            // if (process_status !== 'TERMINATED' || process_status !== "DEINITIALIZING") {
            //     return res.status(500).json({ message: 'Failed to terminate the instance' });
            // }

            // // Update the server's available instances or perform other necessary actions
            // await Server.update(
            //     { available_instances: server.available_instances + 1 }, // Increment available instances
            //     { where: { server_id: server.server_id } }
            // );

            // // Update the instance status
            // await Instance.update(
            //     { status: 'TERMINATED' },
            //     { where: { instance_id: instance.instance_id } }
            // );

            return res.status(200).json({
                message: 'Instance termination request sent successfully',
                procId: procId,
                serverId: server.server_id,
                serverIP: server.ip_address,
                serverPort: server.port,
            });
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            return res.status(500).json({ message: 'Failed to communicate with the server' });
        });

        // Optional: Handle connection close
        ws.on('close', () => {
            console.log('WebSocket connection closed');
        });
    } catch (error) {
        console.error('Error handling /terminate request:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
