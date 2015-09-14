"use strict";

var React = require("react");
var Button = require("react-bootstrap").Button;
var Glyphicon = require("react-bootstrap").Glyphicon;

var GlyphiconLink = React.createClass({
  render: function() {
    return (
      <Button bsStyle="link" {...this.props} ><Glyphicon glyph={this.props.glyph} /></Button>
    );
  }
});

module.exports = GlyphiconLink;
