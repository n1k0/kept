define(
  ["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var utils = __dependency4__["default"];


    var Tooltip = React.createClass({displayName: 'Tooltip',
      mixins: [BootstrapMixin],

      propTypes: {
        placement: React.PropTypes.oneOf(['top','right', 'bottom', 'left']),
        positionLeft: React.PropTypes.number,
        positionTop: React.PropTypes.number,
        arrowOffsetLeft: React.PropTypes.number,
        arrowOffsetTop: React.PropTypes.number
      },

      getDefaultProps: function () {
        return {
          placement: 'right'
        };
      },

      render: function () {
        var classes = {};
        classes['tooltip'] = true;
        classes[this.props.placement] = true;
        classes['in'] = this.props.positionLeft != null || this.props.positionTop != null;

        var style = {};
        style['left'] = this.props.positionLeft;
        style['top'] = this.props.positionTop;

        var arrowStyle = {};
        arrowStyle['left'] = this.props.arrowOffsetLeft;
        arrowStyle['top'] = this.props.arrowOffsetTop;

        return (
            React.DOM.div( {className:classSet(classes), style:style}, 
              React.DOM.div( {className:"tooltip-arrow", style:arrowStyle} ),
              React.DOM.div( {className:"tooltip-inner"}, 
                this.props.children
              )
            )
          );
      }
    });

    __exports__["default"] = Tooltip;
  });