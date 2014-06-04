/** @jsx React.DOM */

"use strict";

var React = require("react");
var Button = require("react-bootstrap").Button;
var Jumbotron = require("react-bootstrap").Jumbotron;

var DefaultContent = React.createClass({
  handleClickLoadSamples: function() {
    this.props.loadSamples();
  },

  handleClickNewText: function() {
    this.props.newItem("text")();
  },

  handleClickNewTodo: function() {
    this.props.newItem("todo")();
  },

  render: function() {
    return (
      <Jumbotron className="kept-default">
        <h1>Welcome to Kept</h1>
        <p>Your list is currently empty.</p>
        <p>You can create
          a <a className="new-text" href="#" onClick={this.handleClickNewText}>Text</a>,
          a <a className="new-todo" href="#" onClick={this.handleClickNewTodo}>Todo</a> or
          <Button bsStyle="success" bsSize="large"
                  onClick={this.handleClickLoadSamples}>Load samples</Button>.
        </p>
      </Jumbotron>
    );
  }
});

module.exports = DefaultContent;
