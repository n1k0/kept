"use strict";

var React = require("react");
var TestUtils = require("react/lib/ReactTestUtils");
var sinon = require("sinon");
var expect = require("chai").expect;

var DefaultContent = require("../DefaultContent");
describe("DefaultContent", function() {
  describe("#render", function() {
    var renderer = TestUtils.createRenderer();
    var result;
    beforeEach(function() {
      renderer.render(
        <DefaultContent />
      );
      result = renderer.getRenderOutput();
    });

    it("should render HTML content", function() {
      expect(result.props.children.length > 0).to.be.true;
    });
  });

  describe("add default items", function() {
    var comp;
    var fakeCreateText = sinon.spy();
    var fakeCreateTodo = sinon.spy();

    function fakeNewItem(type) {
      return type === "text" ? fakeCreateText : fakeCreateTodo;
    }

    beforeEach(function() {
      comp = TestUtils.renderIntoDocument(
        <DefaultContent newItem={fakeNewItem} />
      );
    });

    it("should add a new text entry when clicking on Text link", function() {

      var newTextLink = TestUtils.findRenderedDOMComponentWithClass(comp, "new-text");

      TestUtils.Simulate.click(newTextLink);

      expect(fakeCreateText.calledOnce).to.be.true;
    });

    it("should add a new todo entry when clicking on Todo link", function() {
      var newTodoLink = TestUtils.findRenderedDOMComponentWithClass(comp, "new-todo");

      TestUtils.Simulate.click(newTodoLink);

      expect(fakeCreateTodo.calledOnce).to.be.true;
    });
  });
});
