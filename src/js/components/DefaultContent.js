/** @jsx React.DOM */

"use strict";

var React = require("react");
var Button = require("react-bootstrap").Button;
var Jumbotron = require("react-bootstrap").Jumbotron;

var DefaultContent = React.createClass({
  render: function() {
    return (
      <Jumbotron className="kept-default">
        <h1>Welcome to Kept</h1>
        <p>Your list is currently empty.</p>
        <p>You can create
          a <a href="#" onClick={this.props.newItem("text")}>Text</a>,
          a <a href="#" onClick={this.props.newItem("todo")}>Todo</a> or
          <Button bsStyle="success" bsSize="large"
                  onClick={this.props.loadSamples}>Load samples</Button>.
        </p>
      </Jumbotron>
    );
  }
});

module.exports = DefaultContent;
