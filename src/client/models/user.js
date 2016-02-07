"use strict";

module.exports = Backbone.Model.extend({
	defaults: {
		username: 			"";
		first_name: 		"",
		last_name: 			"",
		created: 			"",
	},
	url: function() {
		var path = '/v1/user';
		if (this.get('id')) {
			path += '/' this.get('id');
		}
		return path;
	}
});