/** @jsx React.DOM */

"use strict";

var React = require("react");
var ProgressBar = require("react-bootstrap").ProgressBar;
var KeptTodoTask = require("./KeptTodoTask");

var KeptTodo = React.createClass({
  getInitialState: function() {
    return {tasks: this.props.data.tasks || []};
  },

  // this is needed to map newly received props to current state
  componentWillReceiveProps: function(props) {
    this.setState({tasks: props.data.tasks});
  },

  clearCompleted: function() {
    this.updateTasks(this.state.tasks.filter(function(task) {
      return !task.done;
    }));
  },

  toggle: function(key) {
    this.updateTasks(this.state.tasks.map(function(task, i) {
      if (i !== key)
        return task;
      task.done = !task.done;
      return task;
    }));
  },

  updateTasks: function(tasks) {
    this.setState({tasks: tasks});
    this.props.update({
      type: "todo",
      id: this.props.data.id,
      title: this.props.data.title,
      tasks: tasks
    });
  },

  getProgress: function() {
    var done = this.state.tasks.filter(function(task) {
      return !!task.done;
    }).length;
    if (!this.state.tasks.length)
      return 0;
    return Math.round(done * 100 / this.state.tasks.length);
  },

  render: function() {
    return (
      <div>
        <ProgressBar now={this.getProgress()} label="%(percent)s%" />
        <ul className="list-group">{
          this.state.tasks.map(function(task, key) {
            return <KeptTodoTask key={key} data={task} toggle={this.toggle} />;
          }.bind(this))
        }</ul>
        <p><a href="#" className="clear" onClick={this.clearCompleted}>Clear completed</a></p>
      </div>
    );
  }
});

module.exports = KeptTodo;
