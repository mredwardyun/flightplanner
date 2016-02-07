// Copying JSON to database - only needs to be run once
var geolib          =   require('geolib'),
    airportJSON     =   require('../data/apt.json');
    mongoose        =   require('mongoose'),
    Schema          =   mongoose.Schema;

mongoose.connect('mongodb://192.168.99.100:32771/yuned');


var airportSchema = new Schema({
  	type: {type: String, required: true},
    ident: {type: String, required: true},
    loc: {
    	type: { type: String },			// 2dsphere
    },
    coordinates: [Number], 			// Long, Lat
    name: {type: String, required: true},
    modified: {type: Date, require: true, default: Date.now()}
});
airportSchema.index({ loc: '2dsphere' });

var Airport = mongoose.model('Airport', airportSchema);


// var myAirport = new Airport({
// 	type: "My Type",
// 	ident: "12345",
// 	loc: {
// 		type: "Point",
// 	},
// 	coordinates: [1, 2],
// 	name: "myName"
// });

// myAirport.save(function (err, myAirport) {
// 	if (err) return console.log(err);
// 	console.dir(myAirport);
// });



for (var airport in airportJSON) {

    if (airportJSON[airport]) {
    	console.log('airport: ' + airportJSON[airport].name + " exists!");
        var newAirport = new Airport({
            type: airportJSON[airport].type,
            ident: airportJSON[airport].ident,
            loc: {
            	coordinates:[  airportJSON[airport].longitudeSec/-3600, 
            			airportJSON[airport].latitudeSec/3600
            		],
            	type: "Point"
        	},
            name: airportJSON[airport].name
        });
        console.log("finished creating airport with schmea: " + newAirport);
        newAirport.save(function (err, data) {
        	if (err) {
            	console.log('error: ' + err);
            }
            console.dir('hello')
        });
    }
}