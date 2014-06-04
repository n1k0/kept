/** @jsx React.DOM */

"use strict";

var TestUtils = require('react/addons').addons.TestUtils;

jest.dontMock('react-bootstrap/Panel');
jest.dontMock('../KeptEntry');
jest.dontMock('../GlyphiconLink');
jest.dontMock('../text/KeptText');
jest.dontMock('../todo/KeptTodo');
var KeptEntry = require("react-bootstrap/Panel");
var KeptEntry = require("../GlyphiconLink");
var KeptEntry = require("../KeptEntry");
var KeptText = require("../text/KeptText");
var KeptTodo = require("../todo/KeptTodo");

describe("KeptEntry", function() {
  var comp, fakeUpdate, fakeEdit;

  function renderWithProps(props) {
    return TestUtils.renderIntoDocument(KeptEntry(props));
  }

  beforeEach(function() {
    fakeUpdate = jest.genMockFn();
    fakeEdit = jest.genMockFn();
  });

  afterEach(function() {
    fakeUpdate.mockClear();
    fakeEdit.mockClear();
  });

  describe("#handleClickEdit", function() {
    it("should call edit", function() {
      comp = renderWithProps({
        key: 1,
        itemData: {
          type: "text",
          id: 42,
          title: "test text",
          text: "text"
        },
        edit: fakeEdit
      });

      TestUtils.Simulate.click(comp.getDOMNode().querySelector("h3 a.edit"));

      expect(fakeEdit).lastCalledWith({
        type: "text",
        id: 42,
        title: "test text",
        text: "text"
      });
    });
  });

  describe("#render", function() {
    it("should render a text entry", function() {
      comp = renderWithProps({key: 1, itemData: {
        type: "text",
        id: 42,
        title: "test text",
        text: "text"
      }});

      expect(TestUtils.findRenderedComponentWithType(comp, KeptText)).toBeTruthy();
    });

    it("should render a todo entry", function() {
      comp = renderWithProps({
        key: 2,
        itemData: {
          type: "todo",
          id: 43,
          title: "test todo",
          tasks: []
        },
        update: fakeUpdate
      });

      expect(TestUtils.findRenderedComponentWithType(comp, KeptTodo)).toBeTruthy();
    });
  });
});
