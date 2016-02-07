"use strict";

import React from 			'react';
import ReactDOM from		'react-dom';
import LandingView from 	'./views/landing.jsx';
import RegisterView from	'./views/register.jsx';
import GravatarView from 	'./views/gravatar.jsx';

module.exports = Backbone.Router.extend({
	routes: {
		'': 			'_landing',
		'register': 	'_register',
		'*path': 		'_default'
	},
	initialize: function(options) {
		this.app = options.app
		this.view = undefined;
	},

	_register: function() {
		ReactDOM.render(<GravatarView dispatcher={this.app} />,
			document.getElementById('gravatar'));
		ReactDOM.render(<RegisterView router={this} dispatcher={this.app} />,
			document.getElementById('mainDiv'));
	},

	_landing: function() {
		ReactDOM.render(<LandingView name="John" />,
			document.getElementById('mainDiv'));
	},

	_default: function() {
		console.log('Default path taken!');
	}


});