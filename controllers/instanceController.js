const Instance = require('../models/instanceModel');
const Sequelize = require('sequelize');

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
