const Instance = require('../models/instanceModel');

exports.createInstance = async (req, res) => {
    try {
        const instance = await Instance.create(req.body);
        res.status(201).send(instance);
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
        await instance.save();
        res.status(200).send(instance);
    } catch (err) {
        res.status(400).send(err);
    }
};
