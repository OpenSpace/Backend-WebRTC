const WebSocket = require('ws');
const Sequelize = require('sequelize');
const Server = require('../models/Server');
const Instance = require('../models/Instance');

// Function to fetch non-terminated instances and update their status
async function fetchAndUpdateInstanceStatuses() {
    try {
        // 1. Fetch all non-terminated instances
        const instances = await Instance.findAll({
            where: {
                status: { [Sequelize.Op.ne]: 'TERMINATED' }
            }
        });

        console.log(`Found ${instances.length} non-terminated instances.`);


        if (instances.length === 0) {
            console.log('No non-terminated instances found.');
            return;
        }

        console.log(`instances ${instances[0].instance_id} `);

        // 2. For each instance, connect to the server and get the status
        for (const instance of instances) {
            const server = await Server.findByPk(instance.server_id);
            if (!server) {
                console.log(`Server not found for instance ID: ${instance.id}`);
                continue;
            }

            console.log(`server ${server.server_id} `);

            const uri = `ws://${server.ip_address}:${server.port}`;
            console.log(`Connecting to WebSocket server at ${uri} for instance ID: ${instance.id}`);

            const ws = new WebSocket(uri);

            ws.on('open', () => {
                const statusMessage = `STATUS\n${instance.process_id}`;
                console.log(`WebSocket connection established. Sending message: ${statusMessage}`);
                ws.send(statusMessage);
            });

            ws.on('message', async (message) => {
                console.log(`Received response from server for instance ID: ${instance.instance_id}: ${message}`);

                // Parse the response and check if there's any status change
                let response;
                try {
                    response = JSON.parse(message);
                } catch (error) {
                    console.error('Failed to parse message:', error);
                    return;
                }

                const { procId, procStatus } = response;

                console.log(`procId ${procId} , procStatus ${procStatus} `);
                if (procId === instance.process_id && procStatus !== instance.status) {
                    console.log(`Updating status for instance ID: ${instance.instance_id} from ${instance.status} to ${procStatus}`);

                    // 3. Update instance status if there's any change
                    await Instance.update(
                        { status: procStatus },
                        { where: { instance_id: instance.instance_id } }
                    );

                    if (procStatus === 'TERMINATED') {
                        console.log(`Instance ID: ${instance.instance_id} has been terminated. Updating server's available instances...`);

                        // 4. If the instance has been terminated, increment the server's available instances
                        await Server.update(
                            { available_instances: server.available_instances + 1 },
                            { where: { server_id: server.server_id } }
                        );
                    }
                } else {
                    console.log(`No status change for instance ID: ${instance.instance_id}`);
                }

                ws.close();
            });

            ws.on('error', (error) => {
                console.error(`WebSocket error for instance ID: ${instance.id}:`, error);
            });
        }
    } catch (error) {
        console.error('Error in fetchAndUpdateInstanceStatuses function:', error);
    }
}

// Function to start the status updater with a 20-second interval
function startStatusUpdater() {
    console.log('Starting the status updater...');
    fetchAndUpdateInstanceStatuses(); // Call the function immediately on start
    setInterval(fetchAndUpdateInstanceStatuses, 10000); // Repeat every 20 seconds
}

module.exports = {
    startStatusUpdater
};
