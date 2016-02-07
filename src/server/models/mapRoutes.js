'use strict';

function getMap(req, res) {
    var options = {root: __dirname + "../../../../public/img/" + req.query.z + "/" + req.query.x};
    var file = req.query.y + ".png"

    res.sendFile(file, options, function(err) {
        if (err) {
            console.log(err);
            res.status(404).send((err));
        }
        else {
            res.status(200);
        }
    });
};

module.exports = function(app) {
    app.get('/v1/map/', getMap);
};
