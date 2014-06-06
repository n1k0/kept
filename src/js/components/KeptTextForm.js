/** @jsx React.DOM */

"use strict";

var React = require("react");
var Modal = require("react-bootstrap").Modal;

var KeptTextForm = React.createClass({
  handleCancel: function() {
    this.props.resetForm();
  },

  handleSubmit: function() {
    var id = parseInt(this.refs.id.getDOMNode().value.trim(), 10);
    var process = id ? this.props.update : this.props.create;
    process({
      type: "text",
      id: id,
      title: this.refs.title.getDOMNode().value.trim(),
      text: this.refs.text.getDOMNode().value.trim()
    });
  },

  componentDidMount: function() {
    this.getDOMNode().querySelector("textarea").focus();
  },

  render: function() {
    var data = this.props.data;
    return (
      <Modal title="Create new Text" onRequestHide={this.props.resetForm} animation={false}>
        <form role="form" onSubmit={this.handleSubmit}>
          <div className="modal-body">
            <input type="hidden" ref="id" defaultValue={data.id} />
            <div className="form-group">
              <input ref="title" type="text" className="form-control"
                     placeholder="Title" defaultValue={data.title} />
            </div>
            <div className="form-group">
              <textarea ref="text" className="form-control"
                        placeholder="Text (accept markdown contents)…"
                        defaultValue={data.text} rows="8" required />
            </div>
          </div>
          <div className="modal-footer form-group">
            <button type="submit" className="btn btn-primary">Save</button>
            &nbsp;
            <a href="#" onClick={this.handleCancel}>Cancel</a>
          </div>
        </form>
      </Modal>
    );
  }
});

module.exports = KeptTextForm;
