define(
  ["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./constants","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var constants = __dependency4__["default"];

    var Glyphicon = React.createClass({displayName: 'Glyphicon',
      mixins: [BootstrapMixin],

      propTypes: {
        glyph: React.PropTypes.oneOf(constants.GLYPHS).isRequired
      },

      getDefaultProps: function () {
        return {
          bsClass: 'glyphicon'
        };
      },

      render: function () {
        var classes = this.getBsClassSet();

        classes['glyphicon-' + this.props.glyph] = true;

        return this.transferPropsTo(
          React.DOM.span( {className:classSet(classes)}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = Glyphicon;
  });