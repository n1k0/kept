/** @jsx React.DOM */

"use strict";

var React = require("react");
var TestUtils = require('react/addons').addons.TestUtils;

jest.dontMock('../UndoStack');
var UndoStack = require('../UndoStack');

var TestComp = React.createClass({
  mixins: [UndoStack],

  getInitialState: function() {
    return {text: "v1"};
  },

  getStateSnapshot: function() {
    return {text: this.state.text};
  },

  setStateSnapshot: function(snapshot) {
    this.setState(snapshot);
  },

  render: function() {
    return <p/>;
  }
});

describe("UndoStack", function() {
  var comp;

  beforeEach(function() {
    comp = <TestComp/>;
    TestUtils.renderIntoDocument(comp);
    comp.snapshot();
  });

  it("should undo", function() {
    comp.setState({text: "v2"});
    expect(comp.state.text).toEqual("v2");

    comp.undo();

    expect(comp.state.text).toEqual("v1");
  });

  it("should redo", function() {
    comp.setState({text: "v2"});
    comp.undo();

    comp.redo();

    expect(comp.state.text).toEqual("v2");
  });
});
