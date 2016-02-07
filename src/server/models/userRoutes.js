
// Handle POST to create a new user account
// app.post('/v1/user', function(req, res) {
function createUser(req, res) {

    console.log('testing');

    var data = req.body;

    if (!data || !data.username || !data.password || !data.first_name || !data.last_name || !data.primary_email) {
        res.status(400).send({ error: 'username, password, first_name, last_name and primary_email required' });
    }
    else {
        var user = new User(data);

        user.save(function(err) {

            if (err) {
              console.log(err);
              res.status(400).send({ error: 'error registering' });
            }

            else {
              res.status(201).send({

                  username:       data.username,
                  primary_email:  data.primary_email

              });
            }
        });
    }

};

// Handle GET to fetch user information
// app.get('/v1/user/:username', function(req, res) {
function getUserByName(req, res) {

    User.find({'username': req.params.username.toLowerCase()}, function(err, docs){

        if (err) {
            res.status(404).send({ error: 'unknown user' });
        }
        else {
            res.status(200).send(docs[0]);
        }

    });

};

// Handle deactivate account
// app.post('/v1/deactivate/:username', function(req, res) {
function deactivateUser(req, res) {
    console.log('hello?');
    User.findOne({'username': req.params.username.toLowerCase()}, function(err, docs){
        if (err || !docs) {
            res.status(404).send({ error: 'unknown user' });
        } else {
            docs.active_status = false;
            docs.save(function (err) {
                if (err) {
                  res.status(404).send({
                    error: "unknown user"
                  });
                }
            });
            res.status(201).send(docs);
        }
    });
};

// Handle POST to update user information
// app.post('/v1/edit/:username', function(req, res) {
function editUser(req, res) {
    var data = req.body;
    var oldUsername = req.params.username.toLowerCase();
    if (!data || !data.username || !data.password || !data.first_name || !data.last_name || !data.primary_email) {
        res.status(400).send({ error: 'username, password, first_name, last_name and primary_email required' });
    } else {
        User.find({'username': oldUsername}, function(err, docs){
            if (err) {
                res.status(404).send({ error: 'unknown user' });
            } else {
                User.update({username: oldUsername}, data, function(err, numberAffected, rawResponse) {
                    console.log(err);
                    console.log(numberAffected);
                    console.log(rawResponse);
                });
                res.status(200).send(data);
            }
        });
    }
};

// Handle GET to edit a user's flight plans
// app.get('/v1/user/:username/edit', function(req, res) {
function editUserFlightPlans(req, res) {

    User.find({'username': req.params.username.toLowerCase()}, function(err, docs){
        if (err) {
            res.status(404).send({ error: 'unknown user' });
        } else {
            FlightPlan.find({'planId': docs[0].flight_plans}, function(err, docs){
                if (err) {
                    res.status(404).send({ error: 'Cannot find flight plan' });
                } else {
                    res.status(200).send(docs[0]);
                }
            });
        }
    });

};

module.exports = function(app) {

    app.post('/v1/user/', createUser);
    app.get('v1/user/:username/', getUserByName);
    app.post('v1/deactivate:username/', deactivateUser);
    app.post('v1/edit/:username/', editUser);
    app.get('v1/user/:username/edit', editUserFlightPlans);

}
