"use strict";

var React = require("react");
var reactDom = require("react-dom");
var TestUtils = require("react/lib/ReactTestUtils");
var expect = require("chai").expect;
var sinon = require("sinon");

var KeptTextForm = require("../KeptTextForm");

describe("KeptTextForm", function() {
  var fakeCreate, fakeUpdate;

  var existingEntry = {
    id: 1,
    type: "text",
    title: "Plop",
    text: "# plop"
  };

  beforeEach(function() {
    fakeCreate = sinon.spy();
    fakeUpdate = sinon.spy();
  });

  describe("#handleSubmit", function() {
    it("should create a new text", function() {
      var comp = TestUtils.renderIntoDocument(
        <KeptTextForm data={{}} create={fakeCreate} update={fakeUpdate} />
      );

      var form = comp.getDOMNode().querySelector("form");

      TestUtils.Simulate.change(form.querySelector("input[type=text]"),
                                {target: {value: "Hello"}});
      TestUtils.Simulate.change(form.querySelector("textarea"),
                                {target: {value: "# world"}});
      TestUtils.Simulate.submit(form);

      expect(fakeCreate.calledWith({
        id: null,
        type: "text",
        title: "Hello",
        text: "# world"
      })).to.be.true;
    });

    it("should update an existing text", function() {
      var comp = TestUtils.renderIntoDocument(
        <KeptTextForm data={existingEntry} create={fakeCreate} update={fakeUpdate} />);

      TestUtils.Simulate.change(reactDom.findDOMNode(comp.refs.title) ,
                                {target: {value: "Plip"}});
      TestUtils.Simulate.change(reactDom.findDOMNode(comp.refs.text),
                                {target: {value: "# plip"}});
      TestUtils.Simulate.submit(reactDom.findDOMNode(comp.refs.title).form);

      expect(fakeUpdate.calledWith({
        id: 1,
        type: "text",
        title: "Plip",
        text: "# plip"
      })).to.be.true;
    });
  });

  describe("#render", function() {
    it("should render HTML content", function() {
      var renderer = TestUtils.createRenderer();
      renderer.render(<KeptTextForm data={existingEntry} />);

      var result = renderer.getRenderOutput();

      expect(result.props.children.length).to.equal(3);
    });
  });
});
