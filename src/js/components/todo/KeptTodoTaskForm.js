/** @jsx React.DOM */

"use strict";

var React = require("react");

var KeptTodoTaskForm = React.createClass({
  handleUpdate: function() {
    this.props.updateTask(this.props.key, {
      label: this.refs.label.getDOMNode().value.trim(),
      done: this.refs.done.getDOMNode().checked
    });
  },

  handleRemove: function(event) {
    event.preventDefault();
    this.props.removeTask(this.props.key);
  },

  render: function() {
    var data = this.props.data;
    console.log("rendering KeptTodoTaskForm", data.label);
    var checkedValue = data.done ? "checked" : "";
    return (
      <li className="form-inline list-group-item form-group">
        <input ref="done" type="checkbox" onChange={this.handleUpdate} checked={checkedValue} />
        &nbsp;&nbsp;&nbsp;
        <input ref="label" type="text" className="form-control" placeholder="Label…"
               defaultValue={data.label} onBlur={this.handleUpdate} />
        &nbsp;&nbsp;&nbsp;
        <a className="danger" href="#" onClick={this.handleRemove} title="Remove task">
          <span className="glyphicon glyphicon-remove"></span>
        </a>
      </li>
    );
  }
});

module.exports = KeptTodoTaskForm;
