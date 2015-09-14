"use strict";

var React = require("react");

var KeptTodoTask = React.createClass({
  handleChange: function() {
    this.props.toggle(this.props.index);
  },

  render: function() {
    var checkedValue = this.props.data.done ? "checked" : "";
    return (
      <li className="list-group-item">
        <label className={this.props.data.done ? "done" : ""}>
          <input type="checkbox" ref="done" onChange={this.handleChange} checked={checkedValue} />
          <span className="todo-item-label">{this.props.data.label}</span>
        </label>
      </li>
    );
  }
});

module.exports = KeptTodoTask;
