define(
  ["./react-es6","./react-es6/lib/cx","./PropTypes","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var PropTypes = __dependency3__["default"];

    var Table = React.createClass({displayName: 'Table',
      propTypes: {
        striped: React.PropTypes.bool,
        bordered: React.PropTypes.bool,
        condensed: React.PropTypes.bool,
        hover: React.PropTypes.bool,
        responsive: React.PropTypes.bool
      },

      render: function () {
        var classes = {
          'table': true,
          'table-striped': this.props.striped,
          'table-bordered': this.props.bordered,
          'table-condensed': this.props.condensed,
          'table-hover': this.props.hover
        };
        var table = this.transferPropsTo(
          React.DOM.table( {className:classSet(classes)}, 
            this.props.children
          )
        );

        return this.props.responsive ? (
          React.DOM.div( {className:"table-responsive"}, 
            table
          )
        ) : table;
      }
    });

    __exports__["default"] = Table;
  });