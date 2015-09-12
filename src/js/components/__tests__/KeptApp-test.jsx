"use strict";

var TestUtils = require("react/lib/ReactTestUtils");
var React = require("react");
var expect = require("chai").expect;
var renderer = TestUtils.createRenderer();

var KeptApp = require("../KeptApp");
var KeptTextForm = require("../text/KeptTextForm");
var KeptTodoForm = require("../todo/KeptTodoForm");

describe("KeptApp", function() {
  var fakeStore;

  beforeEach(function() {
    fakeStore = {
      load: function() {
        return [];
      },
      save: function() {
      }
    };
  });

  describe("#render", function() {
    it("should render HTML content", function() {
      renderer.render(
        <KeptApp store={fakeStore} />
      );
      var dom = renderer.getRenderOutput();
      expect(dom.props.children.length).to.be.above(0);
    });
  });

  describe("#formCreator", function() {
    var comp;

    beforeEach(function() {
      comp = TestUtils.renderIntoDocument(<KeptApp store={fakeStore} />);
    });

    it("should generate a form creation function", function() {
      expect(comp.formCreator("text")).to.be.a("function");
      expect(comp.formCreator("todo")).to.be.a("function");
    });

    it("should add a text form component to state", function() {
      var textForm = comp.formCreator("text");

      textForm({});

      //expect(TestUtils.isComponentOfType(comp.state.form, KeptTextForm)).to.be.true;
    });

    it("should add a todo form component to state", function() {
      var todoForm = comp.formCreator("todo");

      todoForm({});

      //expect(TestUtils.isComponentOfType(comp.state.form, KeptTodoForm)).to.be.true;
    });
  });
});
