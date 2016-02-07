'use strict';

var express         = require('express'),
    bodyParser      = require('body-parser'),
    logger          = require('morgan'),
    _               = require('underscore'),
    session         = require('express-session'),
    mongoose        = require('mongoose'),
    Schema			= mongoose.Schema,
    path            = require('path'),
    redis           = require('redis'),
    geolib          = require('geolib');




var app = express();
app.use(express.static(__dirname + '/../../public'));
app.use(logger('combined'));
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'jade');
app.set('views', '../client/views');

mongoose.connect('mongodb://192.168.99.100:32771/yuned');

var redisClient = redis.createClient('32768', '192.168.99.100');
redisClient.on('ready', function() {
    console.log('Redis Connected.');
}).on('error', function() {
    console.log('Not able to connect to Redis.');
    process.exit(-1);
});

var flightSchema = new Schema({
    alt_airports: {type: String},
    color: {type: String},
    cruise_alt: {type: Number},
    departure: {type: String, required: true},
    dept_time_actual: {type: String},
    dept_time_proposed: {type: String, required: true},
    dst: {type: String, required: true},
    dst_contact: {type: String},
    est_hours: {type: Number},
    est_mins: {type: Number},
    flight_plan: {type: String},
    fuel_hours: {type: Number},
    fuel_minutes: {type: Number},
    ident: {type: String},
    name: {type: String},
    num_aboard: {type: Number},
    remarks: {type: String},
    route: {type: String},
    special_equip: {type: String},
    specialist_initial: {type: String},
    time_started: {type: String},
    true_airspeed: {type: String},
    type: {type: String},
    username: {type: String},
    planId: {type: String, unique: true},
    modified: {type: Date, require: true, default: Date.now()}
});


var userSchema = new Schema({
  	username: {type: String, required: true, unique: true},
  	first_name: {type: String, required: true, default: ''},
  	last_name: {type: String, required: true, default: ''},
  	password: {type: String, required: true, default: ''},
  	dob: {type: String, required: true},
  	address_street: {type: String},
  	address_city: {type: String, required: true},
  	address_state: {type: String, required: true},
  	address_zip: {type: Number, required: true},
  	primary_phone: {type: String, required: true},
  	primary_email: {type: String, required: true},
    flight_plans: {type: [String]},
    active_status: {type: Boolean, required: true, default: true},
    modified: {type: Date, require: true, default: Date.now()}
});

var User = mongoose.model('User', userSchema);
var FlightPlan = mongoose.model('Flight', flightSchema);

// Handle POST to create a user session
app.post('/v1/session', function(req, res) {
    if (!req.body || !req.body.username || !req.body.password) {
        res.status(400).send({ error: 'username and password required' });
    } else {
        var login = req.body;
        User.find({'username': login.username}, function(err, docs){
            if (login.password === docs[0].password) {
              res.status(201).send({
                    username:       login.username,
                    primary_email:  docs[0].primary_email
                });
                // Do I need this?

                // req.session.user = login.username;
                // console.log(req.session.user);
                // console.log(login.username);
            } else {
                console.log('wrong password');
                res.status(401).send({ error: 'unauthorized' });
            }
        });
    }
});

require('./models/mapRoutes')(app);
require('./models/airplaneInfo')(app);
require('./models/userRoutes')(app);

app.get('/', function (req, res) {
    res.render('header', { title: 'Hey', message: 'Hello there!'});
});
app.get('/map.html', function (req, res) {
    res.render('map', {title: "Map"});
});
app.get('/profile.html', function (req, res) {
    res.render('profile', {title: 'Hey', username: req.body.username});
});


// // Handle POST to create a new user account
app.post('/v1/user', function(req, res) {
    var data = req.body;
    if (!data || !data.username || !data.password || !data.first_name || !data.last_name || !data.primary_email) {
        res.status(400).send({ error: 'username, password, first_name, last_name and primary_email required' });
    } else {
        var user = new User(data);
        user.save(function(err) {
            if (err) {
              console.log(err);
              res.status(400).send({ error: 'error registering' });
            }
            else {
                redisClient.set('USER:' + req.params.username, JSON.stringify(user));
                res.status(201).send({
                    username:       data.username,
                    primary_email:  data.primary_email
                });
            }
        });

    }
});

// Handle GET to fetch user information
app.get('/v1/user/:username', function(req, res) {
    redisClient.get('USER:' + req.params.username, function(err, data){
        if (err) {
            res.status(404).send({error: 'redis error'});
        } else if (!data) {
            User.find({'username': req.params.username.toLowerCase()}, function(err, docs){
                if (err) {
                    res.status(404).send({ error: 'unknown user' });
                } else {
                    redisClient.set('USER:' + req.params.username, JSON.stringify(user));
                    res.status(200).send(docs[0]);
                }
            });
        } else {
            console.log('found cache in redis');
            res.status(200).send(JSON.parse(data));
        }
    });

});

// Handle deactivate account
// DELETE
app.post('/v1/deactivate/:username', function(req, res) {
    redisClient.del(req.params.username);
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
});

// Handle POST to update user information
app.post('/v1/edit/:username', function(req, res) {
    var data = req.body;
    var oldUsername = req.params.username.toLowerCase();
    if (!data || !data.username || !data.password || !data.first_name || !data.last_name || !data.primary_email) {
        res.status(400).send({ error: 'username, password, first_name, last_name and primary_email required' });
    } else {
        User.find({'username': oldUsername}, function(err, docs){
            if (err || !docs) {
                res.status(404).send({ error: 'username already in use' });
            } else {
                if(data.username != docs[0].username) {
                    console.log('user changed username');
                    redisClient.rename('USER:' + docs[0].username, "USER:" + data.username);
                }
                User.update({username: oldUsername}, data, function(err, numberAffected, rawResponse) {
                    console.log(err);
                    console.log(numberAffected);
                    console.log(rawResponse);
                });
                data.username.toLowerCase();
                redisClient.set('USER:' + req.params.username, JSON.stringify(data.username));
                res.status(200).send(data);
            }
        });
    }
});

// Handle GET to fetch user flight plans
app.get('/v1/user/:username/edit', function(req, res) {
    User.find({'username': req.params.username.toLowerCase()}, function(err, docs){
        if (err) {
            res.status(404).send({ error: 'unknown user' });
        } else {
            // console.log(docs[0].flight_plans);
            // console.log(docs[0]);
            FlightPlan.find({'planId': docs[0].flight_plans}, function(err, docs){
                if (err) {
                    res.status(404).send({ error: 'Cannot find flight plan' });
                } else {
                    // console.log('please!');

                    res.status(200).send(docs[0]);
                }
            });
        }
    });
});

// Flight plan fields:
//  1. TYPE as type
//  2. AIRCRAFT IDENTIFICATION as ident
//  3. AIRCRAFT TYPE / SPECIAL EQUIPMENT as special_equip
//  4. TRUE AIRSPEED as true_airspeed
//  5. DEPARTURE POINT as departure
//  6a. DEPARTURE TIME PROPOSED as dept_time_proposed
//  6b. DEPARTURE TIME ACTUAL as dept_time_actual
//  7. CRUISING ALTITUDE as cruise_alt
//  8. ROUTE OF FLIGHT as route
//  9. DESTINATION (Name of airport and city) as dst
//  10. EST. TIME ENROUTE as ete
//  11. REMARKS as remarks
//  12. FUEL ON BOARD as fuel
//  13. ALTERNATE AIRPORT(S) as alt_airports
//  14. PILOT'S NAME, ADDRESS & TELEPHONE NUMBER & AIRCRAFT HOME BASE as name
//  15. NUMBER ABOARD as num_aboard
//  16. COLOR OF AIRCRAFT as color
//  17. DESTINATION CONTACT/TELEPHONE (OPTIONAL) as dst_contact

// Handle POST to create a new flight plan
app.post('/v1/plan/:username', function(req, res) {
    var data = req.body;
    if (!data ||
        !data.time_started ||
        !data.specialist_initial ||
        !data.type ||
        !data.ident ||
        !data.special_equip ||
        !data.true_airspeed ||
        !data.departure ||
        !data.dept_time_proposed ||
        !data.dept_time_actual ||
        !data.cruise_alt ||
        !data.route ||
        !data.dst ||
        !data.est_hours ||
        !data.est_mins ||
        !data.remarks ||
        !data.fuel_hours ||
        !data.fuel_minutes ||
        !data.alt_airports ||
        !data.name ||
        !data.dst_contact ||
        !data.num_aboard ||
        !data.color ||
        !data.flight_plan
    ) {
        res.status(400).send({ error: 'all form fields required' });
    } else {
        data.username = req.params.username
        var flightPlan = new FlightPlan(data);
        flightPlan.planId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        flightPlan.save(function(err) {
            if (err) {
                console.log(err);
                res.status(400).send({ error: 'error registering' });
            } else {
                User.find({'username': data.username}, function(err, docs){
                    User.update(
                        { _id: docs[0]._id} ,
                        { $addToSet: {"flight_plans": flightPlan.planId} },
                        function (err, model) {
                            console.log(err);
                        }
                    );
                });
                redisClient.set('FLIGHT PLAN:', req.params.flightid, JSON.stringify(docs));
                res.status(201).send({
                    planid: flightPlan.planId
                });
            }
        });
    }
});

// Handle GET to fetch flight plan information
app.get('/v1/plan/:id', function(req, res) {
    redisClient.get('FLIGHT PLAN:' + req.params.flightid, function(err, data) {
        if(err){
            res.status(404).send({ error: 'redis error' });
        } else if (!data) {
            FlightPlan.find({'planId': req.params.id.toLowerCase()}, function(err, docs){
                if (err) {
                    res.status(404).send({ error: 'unknown user' });
                } else {
                    console.log('Using Mongo');
                    redisClient.set('FLIGHT PLAN:' + req.params.flightID, JSON.stringify(docs));
                    res.status(200).send(docs);
                }
            });
        } else {
            console.log('Using Redis');
            res.status(200).send(JSON.parse(data));
        }
    });

});

var server = app.listen(8080, function () {
    console.log('Example app listening on ' + server.address().port);
});
