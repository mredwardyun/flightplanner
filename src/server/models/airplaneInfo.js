var geolib          =   require('geolib'),
    airportJSON     =   require('../../../data/apt.json');
    mongoose        =   require('mongoose'),
    Schema          =   mongoose.Schema;

// console.log(airportJSON);

var airportSchema = new Schema({
  	type: {type: String, required: true},
    ident: {type: String, required: true},
    loc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
    },
    name: {type: String, required: true},
    modified: {type: Date, require: true, default: Date.now()}
});

var Airport = mongoose.model('Airport', airportSchema);

function getAirport(req, res) {

    var limit = req.query.limit || 10;
    var maxDistance = req.query.distance || 8;
    maxDistance /= 6371;

    var coords = [];
    coords[0] = req.query.longitude;
    coords[1] = req.query.latitude;

    // find a location not working because I couldn't update my mongoDB
    Airport.find({
          loc: {
            $near: coords,
            $maxDistance: maxDistance
          }
    }).limit(limit).exec(function(err, locations) {
          if (err) {
            return res.json(500, err);
          }

          res.json(200, locations);
    });
}

module.exports = function(app) {
    app.get('/v1/airport', getAirport);
}
