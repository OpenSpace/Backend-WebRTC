exports.liveliness = (req, res) => {
    res.status(200).send('Liveliness check passed');
};

exports.readiness = (req, res) => {
    res.status(200).send('Readiness check passed');
};
