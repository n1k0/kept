"use strict";

var React = require("react");
var TestUtils = require("react/lib/ReactTestUtils");
var expect = require("chai").expect;

var KeptEntry = require("../KeptEntry");
var KeptColumns = require("../KeptColumns");

describe("KeptColumns", function() {
  describe("#render", function() {

    it("should render passed item entries", function() {
      var items = [
        {id: 1, type: "text", text: "text id #1"},
        {id: 2, type: "text", text: "text id #2"},
        {id: 3, type: "text", text: "text id #3"}
      ];
      var columns = 3;
      var col = 1;

      var comp = TestUtils.renderIntoDocument(<KeptColumns items={items} column={col} columns={columns}/>);

      var entries = TestUtils.scryRenderedComponentsWithType(comp, KeptEntry);
      expect(entries.length).to.eql(3);
    });
  });
});
