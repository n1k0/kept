/** @jsx React.DOM */

"use strict";

var TestUtils = require('react/addons').addons.TestUtils;

jest.dontMock('../KeptMenuBar');
jest.dontMock('../text/KeptTextForm');
jest.dontMock('../todo/KeptTodoForm');
jest.dontMock('../KeptApp');

var KeptApp = require('../KeptApp');
var KeptTextForm = require("../text/KeptTextForm");
var KeptTodoForm = require("../todo/KeptTodoForm");

describe("KeptApp", function() {
  var comp, fakeStore;

  beforeEach(function() {
    fakeStore = {
      load: function() {
        return [];
      },
      save: function() {
      }
    };
    comp = TestUtils.renderIntoDocument(<KeptApp store={fakeStore} />);
  });

  describe("#render", function() {
    it("should render HTML content", function() {
      expect(comp.getDOMNode().outerHTML.length > 0).toBe(true);
    });
  });

  describe("#formCreator", function() {
    it("should generate a form creation function", function() {
      expect(typeof comp.formCreator("text")).toEqual("function");
      expect(typeof comp.formCreator("todo")).toEqual("function");
    });

    it("should add a text form component to state", function() {
      var textForm = comp.formCreator("text");

      textForm({});

      expect(TestUtils.isComponentOfType(comp.state.form, KeptTextForm)).toBe(true);
    });

    it("should add a todo form component to state", function() {
      var todoForm = comp.formCreator("todo");

      todoForm({});

      expect(TestUtils.isComponentOfType(comp.state.form, KeptTodoForm)).toBe(true);
    });
  });
});
