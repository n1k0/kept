/** @jsx React.DOM */

"use strict";

var React = require("react");
var marked = require("marked");

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

var KeptText = React.createClass({
  render: function() {
    return (
      <div className="text-entry">
        <div className="text-entry-text"
             dangerouslySetInnerHTML={{__html: marked(this.props.data.text)}} />
      </div>
    );
  }
});

module.exports = KeptText;
