/** @jsx React.DOM */

"use strict";

var TestUtils = require('react/addons').addons.TestUtils;

jest.dontMock('../KeptTodoTask');
jest.dontMock('../KeptTodo');
jest.dontMock('react-bootstrap/ProgressBar');
var KeptTodo = require('../KeptTodo');

describe("KeptTodo", function() {
  var comp, fakeUpdate;

  function renderWithProps(props) {
    return TestUtils.renderIntoDocument(KeptTodo(props));
  }

  beforeEach(function() {
    fakeUpdate = jest.genMockFn();
    comp = renderWithProps({
      update: fakeUpdate,
      data: {
        id: 1,
        type: "todo",
        title: "todo",
        tasks: [
          {label: "todo1", done: false},
          {label: "todo2", done: true},
          {label: "todo3", done: false}
        ]
      }
    });
  });

  afterEach(function() {
    fakeUpdate.mockClear();
  });

  describe("#getProgress", function() {
    it("should compute task completion percentage", function() {
      expect(comp.getDOMNode().querySelector('[aria-valuenow="33"]')).toBeTruthy();
    });
  });

  describe("#toggle", function() {
    it("should toggle a given task status", function() {
      var checkboxes = comp.getDOMNode().querySelectorAll(".list-group-item input[type=checkbox]");

      TestUtils.Simulate.change(checkboxes[1]); // second one, key=1

      expect(fakeUpdate).lastCalledWith({
        type: "todo",
        id: 1,
        title: "todo",
        tasks: [
          {label: "todo1", done: false},
          {label: "todo2", done: false},
          {label: "todo3", done: false}
        ]
      });
    });
  });

  describe("#clearCompleted", function() {
    it("should clear all completed tasks", function() {
      var clearLink = TestUtils.findRenderedDOMComponentWithClass(comp, "clear");

      TestUtils.Simulate.click(clearLink);

      expect(fakeUpdate).lastCalledWith({
        type: "todo",
        id: 1,
        title: "todo",
        tasks: [
          {label: "todo1", done: false},
          {label: "todo3", done: false}
        ]
      });
    });
  });

  describe("#render", function() {
    it("should render expected amount of entries", function() {
      expect(comp.getDOMNode().querySelectorAll(".list-group-item").length).toEqual(3);
    });
  });
});
