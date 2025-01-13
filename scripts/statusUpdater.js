const WebSocket = require('ws');
const Sequelize = require('sequelize');
const Server = require('../models/Server');
const Instance = require('../models/Instance');

// Helper function to send WebSocket commands
async function sendWebSocketCommand(uri, message, processResponse) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(uri);

        ws.on('open', () => {
            console.log(`Sending message to ${uri}: ${message}`);
            ws.send(message, (err) => {
                if (err) {
                    console.error('Failed to send message:', err);
                    ws.close();
                    return reject(err);
                }
            });
        });

        ws.on('message', async (response) => {
            try {
                const parsedResponse = JSON.parse(response);
                await processResponse(parsedResponse);
                ws.close();
                resolve();
            } catch (error) {
                console.error('Failed to process response:', error);
                ws.close();
                reject(error);
            }
        });

        ws.on('error', (error) => {
            console.error(`WebSocket error: ${error}`);
            ws.close();
            reject(error);
        });

        ws.on('close', () => {
            console.log(`WebSocket connection closed for ${uri}`);
        });
    });
}

// Process STATUS responses
async function processStatusResponse(instance, response) {
    // if (response.command !== 'STATUS' || response.id !== instance.process_id || response.error !== "none") {
    //     console.error('Invalid STATUS response:', response);
    //     return;
    // }

    if (response.command !== 'STATUS' || response.error !== "none") {
        console.error('Invalid STATUS response:', response);
        return;
    }

    const newProcStatus = response.status;
    console.log("response: ", response);
    if (newProcStatus !== instance.status) {
        await Instance.update(
            { status: newProcStatus },
            { where: { instance_id: instance.instance_id } }
        );
        console.log(`Updated status for instance ID: ${instance.instance_id}`);
    } else {
        console.log(`No status change for instance ID: ${instance.instance_id}`);
    }
}

// Process SERVER_STATUS responses
async function processServerStatusResponse(server, response) {
    if (response.command !== 'SERVER_STATUS' || response.error !== "none") {
        console.error('Invalid SERVER_STATUS response:', response);
        return;
    }

    await Server.update(
        {
            available_instances: response.total - response.running,
            num_instances: response.total
        },
        { where: { server_id: server.server_id } }
    );
    console.log(`Updated server data for server ID: ${server.server_id}`);
}

// Fetch and update instance and server statuses
async function fetchAndUpdateStatuses() {
    try {
        // Update instance statuses
        const instances = await Instance.findAll({ where: { status: { [Sequelize.Op.ne]: 'IDLE' } } });
        console.log(`Found ${instances.length} non-idle instances.`);
        for (const instance of instances) {
            const server = await Server.findByPk(instance.server_id);
            if (server) {
                const uri = `ws://${server.ip_address}:${server.port}`;
                const message = JSON.stringify({ command: 'STATUS', id: instance.process_id });
                console.log("message: ", message);
                await sendWebSocketCommand(uri, message, (response) => processStatusResponse(instance, response));
            }
        }

        // Update server statuses
        const servers = await Server.findAll({ where: { status: 'active' } });
        console.log(`Found ${servers.length} active servers.`);
        for (const server of servers) {
            const uri = `ws://${server.ip_address}:${server.port}`;
            const message = JSON.stringify({ command: 'SERVER_STATUS' });
            await sendWebSocketCommand(uri, message, (response) => processServerStatusResponse(server, response));
        }
    } catch (error) {
        console.error('Error in fetchAndUpdateStatuses function:', error);
    }
}

// Start and stop the status updater
let updaterInterval = null;

function startStatusUpdater() {
    console.log('Status updater started.');
    updaterInterval = setInterval(fetchAndUpdateStatuses, 10000); // Update every 10 seconds
}

function stopStatusUpdater() {
    if (updaterInterval) {
        clearInterval(updaterInterval);
        updaterInterval = null;
        console.log('Status updater stopped.');
    }
}

module.exports = { startStatusUpdater, stopStatusUpdater };
