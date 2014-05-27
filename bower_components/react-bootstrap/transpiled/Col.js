define(
  ["./react-es6","./react-es6/lib/cx","./PropTypes","./constants","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var PropTypes = __dependency3__["default"];
    var constants = __dependency4__["default"];


    var Col = React.createClass({displayName: 'Col',
      propTypes: {
        xs: React.PropTypes.number,
        sm: React.PropTypes.number,
        md: React.PropTypes.number,
        lg: React.PropTypes.number,
        xsOffset: React.PropTypes.number,
        smOffset: React.PropTypes.number,
        mdOffset: React.PropTypes.number,
        lgOffset: React.PropTypes.number,
        xsPush: React.PropTypes.number,
        smPush: React.PropTypes.number,
        mdPush: React.PropTypes.number,
        lgPush: React.PropTypes.number,
        xsPull: React.PropTypes.number,
        smPull: React.PropTypes.number,
        mdPull: React.PropTypes.number,
        lgPull: React.PropTypes.number,
        componentClass: PropTypes.componentClass
      },

      getDefaultProps: function () {
        return {
          componentClass: React.DOM.div
        };
      },

      render: function () {
        var componentClass = this.props.componentClass;
        var classes = {};

        Object.keys(constants.SIZES).forEach(function (key) {
          var size = constants.SIZES[key];
          var prop = size;
          var classPart = size + '-';

          if (this.props[prop]) {
            classes['col-' + classPart + this.props[prop]] = true;
          }

          prop = size + 'Offset';
          classPart = size + '-offset-';
          if (this.props[prop]) {
            classes['col-' + classPart + this.props[prop]] = true;
          }

          prop = size + 'Push';
          classPart = size + '-push-';
          if (this.props[prop]) {
            classes['col-' + classPart + this.props[prop]] = true;
          }

          prop = size + 'Pull';
          classPart = size + '-pull-';
          if (this.props[prop]) {
            classes['col-' + classPart + this.props[prop]] = true;
          }
        }, this);

        return this.transferPropsTo(
          componentClass( {className:classSet(classes)}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = Col;
  });