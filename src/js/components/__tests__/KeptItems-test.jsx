"use strict";

var React = require('react');
var TestUtils = require('react/addons').addons.TestUtils;

jest.dontMock('../KeptItems');
jest.dontMock('../DefaultContent');
jest.dontMock('../KeptColumns');

var KeptItems = require("../KeptItems");
var DefaultContent = require("../DefaultContent");
var KeptColumns = require("../KeptColumns");
var range = require('../../utils').range;


describe("KeptItems", function() {
  describe("#render", function() {
    var array = [1,2,3];

    beforeEach(function(){
      range.mockReturnValue(array);
    });

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
        {id: 4, type: "text", text: "text id #3"},
        {id: 5, type: "text", text: "text id #3"},
      ];

      var comp = TestUtils.renderIntoDocument(<KeptItems items={items} />);

      var entries = TestUtils.scryRenderedComponentsWithType(comp, KeptColumns);

      expect(entries.length).toEqual(array.length);
    });
  });
});
