"use strict";

var React = require("react");
var TestUtils = require("react/lib/ReactTestUtils");
var expect = require("chai").expect;
var sinon = require("sinon");

var KeptTodo = require("../KeptTodo");

describe("KeptTodo", function() {
  var comp, fakeUpdate;

  function renderWithProps(props) {
    return TestUtils.renderIntoDocument(<KeptTodo {...props} />);
  }

  beforeEach(function() {
    fakeUpdate = sinon.spy();
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
    fakeUpdate.reset();
  });

  describe("#getProgress", function() {
    it("should compute task completion percentage", function() {
      expect(comp.getDOMNode().querySelector('[aria-valuenow="33"]')).to.not.eql(null);
    });
  });

  describe("#toggle", function() {
    it("should toggle a given task status", function() {
      var checkboxes = comp.refs.taskItems.querySelectorAll(".list-group-item input[type=checkbox]");

      TestUtils.Simulate.change(checkboxes[1]); // second one, key=1

      expect(fakeUpdate.calledWith({
        type: "todo",
        id: 1,
        title: "todo",
        tasks: [
          {label: "todo1", done: false},
          {label: "todo2", done: false},
          {label: "todo3", done: false}
        ]
      })).to.eql(true);
    });
  });

  describe("#clearCompleted", function() {
    it("should clear all completed tasks", function() {
      var clearLink = TestUtils.findRenderedDOMComponentWithClass(comp, "clear");

      TestUtils.Simulate.click(clearLink);

      expect(fakeUpdate.calledWith({
        type: "todo",
        id: 1,
        title: "todo",
        tasks: [
          {label: "todo1", done: false},
          {label: "todo3", done: false}
        ]
      })).to.eql(true);
    });
  });

  describe("#render", function() {
    it("should render expected amount of entries", function() {
      expect(comp.refs.taskItems.querySelectorAll(".list-group-item").length).to.eql(3);
    });
  });
});
