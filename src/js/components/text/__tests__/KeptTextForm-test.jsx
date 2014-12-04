"use strict";

var React = require('react');
var TestUtils = require('react/addons').addons.TestUtils;

jest.dontMock('react-bootstrap');
jest.dontMock('../KeptTextForm');
var KeptTextForm = require('../KeptTextForm');

describe("KeptTextForm", function() {
  var fakeCreate, fakeUpdate;

  var existingEntry = {
    id: 1,
    type: "text",
    title: "Plop",
    text: "# plop"
  };

  beforeEach(function() {
    fakeCreate = jest.genMockFn();
    fakeUpdate = jest.genMockFn();
  });

  describe("#handleSubmit", function() {
    it("should create a new text", function() {
      var comp = TestUtils.renderIntoDocument(
        <KeptTextForm data={{}} create={fakeCreate} update={fakeUpdate} />);
      var form = comp.getDOMNode().querySelector("form");

      TestUtils.Simulate.change(form.querySelector("input[type=text]"),
                                {target: {value: "Hello"}});
      TestUtils.Simulate.change(form.querySelector("textarea"),
                                {target: {value: "# world"}});
      TestUtils.Simulate.submit(form);

      expect(fakeCreate).toBeCalledWith({
        id: null,
        type: "text",
        title: "Hello",
        text: "# world"
      });
    });

    it("should update an existing text", function() {
      var comp = TestUtils.renderIntoDocument(
        <KeptTextForm data={existingEntry} create={fakeCreate} update={fakeUpdate} />);
      var form = comp.getDOMNode().querySelector("form");

      TestUtils.Simulate.change(form.querySelector("input[type=text]"),
                                {target: {value: "Plip"}});
      TestUtils.Simulate.change(form.querySelector("textarea"),
                                {target: {value: "# plip"}});
      TestUtils.Simulate.submit(form);

      expect(fakeUpdate).toBeCalledWith({
        id: 1,
        type: "text",
        title: "Plip",
        text: "# plip"
      });
    });
  });

  describe("#render", function() {
    it("should render HTML content", function() {
      var comp = TestUtils.renderIntoDocument(<KeptTextForm data={existingEntry} />);

      expect(comp.getDOMNode().querySelector("form")).toBeTruthy();
    });
  });
});
