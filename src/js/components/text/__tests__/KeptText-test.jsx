"use strict";

var React = require("react");
var reactDom = require("react-dom");
var TestUtils = require("react/lib/ReactTestUtils");
var expect = require("chai").expect;

var KeptText = require("../KeptText");
describe("KeptText", function(){
  describe("#render", function() {
    var comp;

    beforeEach(function() {
      var data = {type: "text", text: "# plop"};
      comp = TestUtils.renderIntoDocument(<KeptText data={data} />);
    });

    it("should render markdown text as HTML", function() {
      expect(reactDom.findDOMNode(comp).querySelector("h1").textContent).to.eql("plop");
    });
  });
});
