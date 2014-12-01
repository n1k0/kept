"use strict";

var TestUtils = require('react/addons').addons.TestUtils;

jest.dontMock('marked');
jest.dontMock('../KeptText');
var KeptText = require('../KeptText');

describe("#render", function() {
  var comp;

  beforeEach(function() {
    var data = {type: "text", text: "# plop"};
    comp = TestUtils.renderIntoDocument(<KeptText data={data} />);
  });

  it("should render markdown text as HTML", function() {
    expect(comp.getDOMNode().querySelector("h1").textContent).toEqual("plop");
  });
});
