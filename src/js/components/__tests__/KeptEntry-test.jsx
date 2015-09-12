"use strict";

var React = require("react");
var reactDom = require("react-dom");
var TestUtils = require("react/lib/ReactTestUtils");
var expect = require("chai").expect;
var sinon = require("sinon");

var KeptEntry = require("../KeptEntry");
var KeptText = require("../text/KeptText");
var KeptTodo = require("../todo/KeptTodo");

describe("KeptEntry", function() {
  var comp, fakeUpdate, fakeEdit;

  function renderWithProps(props) {
    return TestUtils.renderIntoDocument(
      <KeptEntry {...props} />
    );
  }

  beforeEach(function() {
    fakeUpdate = sinon.spy();
    fakeEdit = sinon.spy();
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

      TestUtils.Simulate.click(reactDom.findDOMNode(comp.refs.editBt));

      expect(fakeEdit.calledWith({
        type: "text",
        id: 42,
        title: "test text",
        text: "text"
      })).to.be.true;
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

      expect(TestUtils.findRenderedComponentWithType(comp, KeptText)).to.be.ok;
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

      expect(TestUtils.findRenderedComponentWithType(comp, KeptTodo)).to.be.ok;
    });
  });
});
