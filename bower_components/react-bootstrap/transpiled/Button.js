define(
  ["./react-es6","./react-es6/lib/cx","./BootstrapMixin","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];

    var Button = React.createClass({displayName: 'Button',
      mixins: [BootstrapMixin],

      propTypes: {
        active:   React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        block:    React.PropTypes.bool,
        navItem:    React.PropTypes.bool,
        navDropdown: React.PropTypes.bool
      },

      getDefaultProps: function () {
        return {
          bsClass: 'button',
          bsStyle: 'default',
          type: 'button'
        };
      },

      render: function () {
        var classes = this.props.navDropdown ? {} : this.getBsClassSet();
        var renderFuncName;

        classes['active'] = this.props.active;
        classes['btn-block'] = this.props.block;

        if (this.props.navItem) {
          return this.renderNavItem(classes);
        }

        renderFuncName = this.props.href || this.props.navDropdown ?
          'renderAnchor' : 'renderButton';

        return this[renderFuncName](classes);
      },

      renderAnchor: function (classes) {
        var href = this.props.href || '#';
        classes['disabled'] = this.props.disabled;

        return this.transferPropsTo(
          React.DOM.a(
            {href:href,
            className:classSet(classes),
            role:"button"}, 
            this.props.children
          )
        );
      },

      renderButton: function (classes) {
        return this.transferPropsTo(
          React.DOM.button(
            {className:classSet(classes)}, 
            this.props.children
          )
        );
      },

      renderNavItem: function (classes) {
        var liClasses = {
          active: this.props.active
        };

        return (
          React.DOM.li( {className:classSet(liClasses)}, 
            this.renderAnchor(classes)
          )
        );
      }
    });

    __exports__["default"] = Button;
  });