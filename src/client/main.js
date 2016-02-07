"use strict";

// Modules
// Leaflet
require('./stylesheets/base.css');
require('bootstrap-webpack');
var Router      = require('./routes');

console.log('main.js invoked');


// Primary App class
var App = function() {
	// Establish the global URL router
	this._router = new Router ({ app: this });
	Backbone.history.start({ pushState: true });
}

_.extend(App.prototype, Backbone.events);

// Invoke the new app
module.exports = new App();
