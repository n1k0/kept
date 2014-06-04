/** @jsx React.DOM */

var React = require("react");
var Modal = require("react-bootstrap").Modal;
var KeptTodoTaskForm = require("./KeptTodoTaskForm");

var KeptTodoForm = React.createClass({
  getDefaultEntries: function() {
    return [{label: ""}];
  },

  getInitialState: function() {
    return {
      tasks: this.props.data && this.props.data.tasks || this.getDefaultEntries()
    };
  },

  addTask: function(event) {
    event.preventDefault();
    this.setState({
      tasks: this.state.tasks.concat(this.getDefaultEntries())
    });
    setTimeout(this.focusLatestInput, 0);
  },

  focusLatestInput: function() {
    var inputs = this.getDOMNode().querySelectorAll("input[type=text]");
    inputs[inputs.length - 1].focus();
  },

  handleCancel: function() {
    this.props.resetForm();
  },

  handleSubmit: function() {
    var id = parseInt(this.refs.id.getDOMNode().value.trim(), 10);
    var process = id ? this.props.update : this.props.create;
    process({
      type: "todo",
      id: id,
      title: this.refs.title.getDOMNode().value.trim(),
      tasks: (this.state.tasks || []).filter(function(task) {
        return !!task.label;
      })
    });
  },

  updateTask: function(key, data) {
    this.setState({
      tasks: this.state.tasks.map(function(task, index) {
        return index === key ? data : task;
      })
    });
  },

  removeTask: function(key) {
    this.setState({
      tasks: this.state.tasks.filter(function(task, index) {
        return index !== key;
      })
    });
  },

  componentDidMount: function() {
    this.focusLatestInput();
  },

  render: function() {
    console.log("---");
    return (
      <Modal title="Create new Todo" onRequestHide={this.props.resetForm} animation={false}>
        <form className="todo-form" role="form" onSubmit={this.addTask}>
          <div className="modal-body">
            <input type="hidden" ref="id" defaultValue={this.props.data.id} />
            <div className="form-group">
              <input ref="title" type="text" className="form-control" placeholder="Title" defaultValue={this.props.data.title} />
            </div>
            <ul className="list-group">{
              this.state.tasks.map(function(task, key) {
                return <KeptTodoTaskForm key={key} data={task} updateTask={this.updateTask} removeTask={this.removeTask} />
              }, this)
            }</ul>
          </div>
          <div className="modal-footer form-group">
            <button className="btn btn-default" type="submit">Add task</button>
            &nbsp;
            <button className="btn btn-primary" type="button" onClick={this.handleSubmit}>Save</button>
            &nbsp;
            <a href="#" onClick={this.handleCancel}>Cancel</a>
          </div>
        </form>
      </Modal>
    );
  }
});

module.exports = KeptTodoForm;
