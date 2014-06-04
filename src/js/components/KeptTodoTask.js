/** @jsx React.DOM */

var React = require("react");

var KeptTodoTask = React.createClass({
  handleChange: function() {
    this.props.toggle(this.props.key);
  },

  render: function() {
    var data = this.props.data;
    return (
      <li className="list-group-item">
        <label className={data.done ? "done" : ""}>
          <input type="checkbox" ref="done" onChange={this.handleChange} checked={data.done ? "checked" : ""} />
          <span className="todo-item-label">{data.label}</span>
        </label>
      </li>
    );
  }
});

module.exports = KeptTodoTask;
