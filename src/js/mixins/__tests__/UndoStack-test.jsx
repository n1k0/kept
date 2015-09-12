"use strict";

var React = require("react");
var TestUtils = require("react/lib/ReactTestUtils");
var expect = require("chai").expect;

var UndoStack = require("../UndoStack");

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
    comp = TestUtils.renderIntoDocument(<TestComp/>);
    comp.snapshot();
  });

  it("should undo", function() {
    comp.setState({text: "v2"});
    expect(comp.state.text).to.equal("v2");

    comp.undo();

    expect(comp.state.text).to.equal("v1");
  });

  it("should redo", function() {
    comp.setState({text: "v2"});
    comp.undo();

    comp.redo();

    expect(comp.state.text).to.equal("v2");
  });
});
