"use strict";

var React = require("react");
var Modal = require("react-bootstrap").Modal;

var KeptTextForm = React.createClass({
  getInitialState: function() {
    return {
      title: this.props.data.title,
      text: this.props.data.text
    };
  },

  handleCancel: function() {
    this.props.resetForm();
  },

  handleChangeTitle: function(event) {
    this.setState({title: event.target.value});
  },

  handleChangeText: function(event) {
    this.setState({text: event.target.value});
  },

  handleSubmit: function() {
    var rawId = this.refs.id.value;
    var process = rawId ? this.props.update : this.props.create;
    process({
      type: "text",
      id: rawId ? parseInt(rawId, 10) : null,
      title: this.refs.title.value.trim(),
      text: this.refs.text.value.trim()
    });
  },

  componentDidMount: function() {
    // FIXME: reimplement this once https://github.com/facebook/jest/issues/75
    //        is fixed.
    // this.getDOMNode().querySelector("textarea").focus();
  },

  render: function() {
    return (
      <Modal.Dialog  show={true}  onHide={this.props.resetForm} animation={false}>
        <Modal.Title>Create new Text</Modal.Title>
        <Modal.Body>
          <form role="form" onSubmit={this.handleSubmit}>
            <input type="hidden" ref="id" defaultValue={this.props.data.id || ""} />
            <div className="form-group">
              <input ref="title" type="text" className="form-control"
                     placeholder="Title" value={this.state.title || ""}
                     onChange={this.handleChangeTitle} />
            </div>
            <div className="form-group">
              <textarea ref="text" className="form-control"
                        placeholder="Text (accept markdown contents)…"
                        value={this.state.text || ""} rows="8" required
                        onChange={this.handleChangeText} />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button type="submit" className="btn btn-primary">Save</button>
          &nbsp;
          <a href="#" onClick={this.handleCancel}>Cancel</a>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
});

module.exports = KeptTextForm;
