/* Copyright G. Hemingway, 2015 - All rights reserved */
"use strict";


var MD5             = require('md5');

import React from 'react';
import ReactDOM from 'react-dom';

/*************************************************************************/


export default class GravatarView extends React.Component {
    constructor(props) {
        super(props);
        this.dispatcher = this.props.dispatcher;
        this.state = { hash: '' };
        this.onEmailChange = this.onEmailChange.bind(this);
    }

    onEmailChange(address) {
        var self = this;
        var hash = MD5(address.trim().toLowerCase());
        var src = 'https://secure.gravatar.com/avatar/' + hash + '?d=404';
        $.ajax({
            method: 'HEAD',
            url: src,
            success: function() {
                self.setState({ hash: hash });
            },
            error: function() {
                self.setState({ hash: '' });
            }
        });
    }

    componentWillMount() {
        this.dispatcher.on('set:email', this.onEmailChange);
    }

    componentWillUnmount() {
        this.dispatcher.off('set:email', this.onEmailChange);
    }

    render() {
        if (this.state.hash != '') {
            var src = 'https://secure.gravatar.com/avatar/' + this.state.hash;
            return <img src={src} />;
        } else return <div></div>;
    }
}

GravatarView.propTypes = {
    dispatcher: React.PropTypes.object.isRequired
};
//email="mathews.kyle@gmail.com" size=100 rating="pg" https default="monsterid" className="CustomAvatar-image"



