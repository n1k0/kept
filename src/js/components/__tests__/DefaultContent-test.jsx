"use strict";

var TestUtils = require('react/addons').addons.TestUtils;

jest.dontMock('../DefaultContent');
var DefaultContent = require('../DefaultContent');

describe("#render", function() {
  var comp;

  var fakeCreateText = jasmine.createSpy("fakeCreateText");
  var fakeCreateTodo = jasmine.createSpy("fakeCreateTodo");

  function fakeNewItem(type) {
    return type === "text" ? fakeCreateText : fakeCreateTodo;
  }

  beforeEach(function() {
    comp = TestUtils.renderIntoDocument(<DefaultContent newItem={fakeNewItem} />);
  });

  it("should render HTML content", function() {
    expect(comp.getDOMNode().outerHTML.length > 0).toBe(true);
  });

  it("should add a new text entry when clicking on Text link", function() {
    var newTextLink = TestUtils.findRenderedDOMComponentWithClass(comp, "new-text");

    TestUtils.Simulate.click(newTextLink);

    expect(fakeCreateText).toHaveBeenCalled();
  });

  it("should add a new todo entry when clicking on Todo link", function() {
    var newTodoLink = TestUtils.findRenderedDOMComponentWithClass(comp, "new-todo");

    TestUtils.Simulate.click(newTodoLink);

    expect(fakeCreateTodo).toHaveBeenCalled();
  });
});
