/** @jsx React.DOM */

"use strict";

var TestUtils = require('react/addons').addons.TestUtils;

jest.dontMock('../KeptItems');
jest.dontMock('../DefaultContent');
jest.dontMock('../KeptEntry');

var KeptItems = require("../KeptItems");
var DefaultContent = require("../DefaultContent");
var KeptEntry = require("../KeptEntry");

describe("KeptItems", function() {
  describe("#render", function() {
    it("should render default content when items list is empty", function() {
      var items = [];

      var comp = TestUtils.renderIntoDocument(<KeptItems items={items} />);

      // will throw if DefaultContent isn't found
      TestUtils.findRenderedComponentWithType(comp, DefaultContent);
    });

    it("should render passed item entries", function() {
      var items = [
        {id: 1, type: "text", text: "text id #1"},
        {id: 2, type: "text", text: "text id #2"},
        {id: 3, type: "text", text: "text id #3"},
      ];

      var comp = TestUtils.renderIntoDocument(<KeptItems items={items} />);

      var entries = TestUtils.scryRenderedComponentsWithType(comp, KeptEntry);
      expect(entries.length).toEqual(items.length);
    });
  });
});
