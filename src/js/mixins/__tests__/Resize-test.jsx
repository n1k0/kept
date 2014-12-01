"use strict";

var React = require("react");
var TestUtils = require('react/addons').addons.TestUtils;

jest.dontMock('../Resize');
var Resize = require('../Resize');

var TestComp = React.createClass({
  mixins: [Resize],

  getInitialState: function() {
    return {
      columns: 1,
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
    compo = <TestComp/>;
    TestUtils.renderIntoDocument(compo);
  });

  it("should have a state columns", function(){
    expect(compo.state.columns).toBe(3);
  });
});