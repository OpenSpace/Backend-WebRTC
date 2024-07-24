const User = require('../models/userModel');

exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.status(200).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
};
