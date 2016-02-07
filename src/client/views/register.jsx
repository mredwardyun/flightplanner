/* Copyright G. Hemingway, 2015 - All rights reserved */
'use strict';

var User = require('../models/user');

import React from 'react';

/*************************************************************************/

export default class RegisterView extends React.Component {
    constructor(props) {
        super(props);
        this.user = new User();
        this.state = this.user.toJSON();
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
        this.onRegister = this.onRegister.bind(this);
    }

    handleEmailChange(e) {
        this.props.dispatcher.trigger('set:email', e.target.value);
        this.setState({ primary_email: e.target.value});
    }

    handleFormChange(e) {
        switch(e.target.getAttribute('name')) {
            case 'username': this.setState({ username: e.target.value}); break;
            case 'password': this.setState({ password: e.target.value}); break;
            case 'first_name': this.setState({ first_name: e.target.value}); break;
            case 'last_name': this.setState({ last_name: e.target.value}); break;
        }
    }

    onRegister(ev) {
        var self = this;
        ev.preventDefault();
        this.user.save(this.state).then(
            function() {
                self.props.router.navigate('profile/' + self.user.get('username'), { trigger: true });
            },
            function(err) {
                console.log('Error: ' + err.responseJSON.error);
            }
        );
    }

    render() {
        return <form className="form-horizontal well">
            <div className="form-group">
                <label htmlFor="username" className="col-sm-3 control-label">Username:</label>
                <div className="col-sm-9">
                    <input
                        name="username"
                        type="text"
                        placeholder="Username"
                        className="form-control"
                        value={this.state.username}
                        onChange={this.handleFormChange}
                    />
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="password" className="col-sm-3 control-label">Password:</label>
                <div className="col-sm-9">
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        className="form-control"
                        value={this.state.password}
                        onChange={this.handleFormChange}
                    />
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="primary_email" className="col-sm-3 control-label">Email Address:</label>
                <div className="col-sm-9">
                    <input
                        name="primary_email"
                        type="email"
                        placeholder="Email Address"
                        className="form-control"
                        value={this.state.primary_email}
                        onChange={this.handleEmailChange}
                    />
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="first_name" className="col-sm-3 control-label">First Name:</label>
                <div className="col-sm-9">
                    <input
                        name="first_name"
                        type="text"
                        placeholder="First Name"
                        className="form-control"
                        value={this.state.first_name}
                        onChange={this.handleFormChange}
                    />
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="last_name" className="col-sm-3 control-label">Last Name:</label>
                <div className="col-sm-9">
                    <input
                        name="last_name"
                        type="text"
                        placeholder="Last Name"
                        className="form-control"
                        value={this.state.last_name}
                        onChange={this.handleFormChange}
                    />
                </div>
            </div>
            <div className="form-group">
                <div className="col-sm-offset-3 col-sm-9">
                    <button className="btn btn-primary" onClick={this.onRegister}>Register</button>
                </div>
            </div>
        </form>;
    }
}

RegisterView.propTypes = {
    router: React.PropTypes.object.isRequired,
    dispatcher: React.PropTypes.object.isRequired
};