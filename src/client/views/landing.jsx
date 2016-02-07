/* Copyright G. Hemingway, 2015 - All rights reserved */
'use strict';


import React from 'react';

/*************************************************************************/

export default class LandingView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>Hello {this.props.name}</div>;
    }
}