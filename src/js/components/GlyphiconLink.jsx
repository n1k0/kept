"use strict";

var React = require("react");
var Glyphicon = require("react-bootstrap").Glyphicon;

var GlyphiconLink = React.createClass({
  render: function() {
    return (
      <a><Glyphicon {...this.props} glyph={this.props.glyph} /></a>
    );
  }
});

module.exports = GlyphiconLink;
