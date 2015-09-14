"use strict";

var React = require("react");
var TestUtils = require("react/lib/ReactTestUtils");
var expect = require("chai").expect;

var Resize = require("../Resize");

var TestComp = React.createClass({
  mixins: [Resize],

  getInitialState: function() {
    return {
      columns: 1
    };
  },

  onResize: function(){
    this.setState({columns: 3});
  },

  render: function() {
    return <p/>;
  }
});

describe("Columns", function(){
  var compo;

  beforeEach(function() {
    compo = TestUtils.renderIntoDocument(<TestComp />);
  });

  it("should have a state columns", function(){
    expect(compo.state.columns).to.eql(3);
  });
});
