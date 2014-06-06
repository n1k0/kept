/** @jsx React.DOM */

"use strict";

var React = require("react");
var Glyphicon = require("react-bootstrap").Glyphicon;

var GlyphIconLink = React.createClass({
  render: function() {
    return this.transferPropsTo(
      <a><Glyphicon glyph={this.props.glyph} /></a>
    );
  }
});

module.exports = GlyphIconLink;
