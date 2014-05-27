define(
  ["./react-es6","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /** @jsx React.DOM */

    var React = __dependency1__["default"];

    var Badge = React.createClass({displayName: 'Badge',

      render: function () {
        return this.transferPropsTo(
          React.DOM.span( {className:this.props.children ? 'badge': null}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = Badge;
  });