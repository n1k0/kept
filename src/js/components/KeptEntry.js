/** @jsx React.DOM */

"use strict";

var React = require("react");
var GlyphiconLink = require("./GlyphiconLink");
var KeptText = require("./KeptText");
var KeptTodo = require("./KeptTodo");
var Panel = require("react-bootstrap").Panel;


var KeptEntry = React.createClass({
  _components: {
    text: function(itemData) {
      return <KeptText data={itemData} />;
    },

    todo: function(itemData) {
      return <KeptTodo data={itemData} update={this.props.update} />;
    }
  },

  getComponent: function(data) {
    return this._components[data.type].call(this, data);
  },

  handleClickEdit: function() {
    this.props.edit(this.props.itemData);
  },

  handleClickDelete: function() {
    if (!confirm("Are you sure?"))
       return;
    this.getDOMNode().classList.add("fade");
    this.timeout = setTimeout(function() {
      this.getDOMNode().classList.remove("fade"); // just don't ask.
      this.props.remove(this.props.itemData);
    }.bind(this), 250); // .fade has a 250ms animation
  },

  handleDragStart: function(event) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData('text/plain', this.props.key);
  },

  handleDragEnter: function(event) {
    event.preventDefault();
  },

  handleDragLeave: function(event) {
    this.unhighlight();
    event.preventDefault();
  },

  handleOnDragOver: function(event) {
    event.preventDefault();
    this.highlight();
  },

  handleOnDrop: function(event) {
    event.preventDefault();
    this.unhighlight();
    this.props.move(event.dataTransfer.getData("text/plain"), this.props.key);
  },

  highlight: function() {
    this.getDOMNode().querySelector(".panel").classList.add("targetted");
  },

  unhighlight: function() {
    this.getDOMNode().querySelector(".panel").classList.remove("targetted");
  },

  render: function() {
    var panelHeader = (
      <h3>
        {this.props.itemData.title || "Untitled"}
        <GlyphiconLink href="#" glyph="trash" onClick={this.handleClickDelete} />
        <GlyphiconLink href="#" glyph="edit" onClick={this.handleClickEdit} />
      </h3>
    );
    return (
      <div className="kept-panel"
           onDragStart={this.handleDragStart}
           onDragEnter={this.handleDragEnter}
           onDragOver={this.handleOnDragOver}
           onDrop={this.handleOnDrop}
           onDragLeave={this.handleDragLeave}
           draggable="true">
        <Panel bsStyle="primary" header={panelHeader}>
          {this.getComponent(this.props.itemData)}
        </Panel>
      </div>
    );
  }
});

module.exports = KeptEntry;
