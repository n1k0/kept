/** @jsx React.DOM */

var React = require("react");

var KeptMenuBar = React.createClass({
  render: function() {
    // FIXME responsive menu display not available without jQuery -_-'
    return (
      <nav className="navbar navbar-default" role="navigation">
        <div className="container-fluid">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">Kept</a>
          </div>
          <div>
            <ul className="nav navbar-nav">
              <li><a href="#" onClick={this.props.newItem("text")}>Text</a></li>
              <li><a href="#" onClick={this.props.newItem("todo")}>Todo</a></li>
              <li><a href="#" onClick={this.props.undo}>Undo</a></li>
              <li><a href="#" onClick={this.props.redo}>Redo</a></li>
              <li><a href="#" onClick={this.props.loadSamples}>Load samples</a></li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
});

module.exports = KeptMenuBar;
