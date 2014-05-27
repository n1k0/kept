define(
  ["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./CollapsableMixin","./utils","./domUtils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    "use strict";
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var CollapsableMixin = __dependency4__["default"];
    var utils = __dependency5__["default"];
    var domUtils = __dependency6__["default"];


    var Nav = React.createClass({displayName: 'Nav',
      mixins: [BootstrapMixin, CollapsableMixin],

      propTypes: {
        bsStyle: React.PropTypes.oneOf(['tabs','pills']),
        stacked: React.PropTypes.bool,
        justified: React.PropTypes.bool,
        onSelect: React.PropTypes.func,
        isCollapsable: React.PropTypes.bool,
        isOpen: React.PropTypes.bool,
        navbar: React.PropTypes.bool
      },

      getDefaultProps: function () {
        return {
          bsClass: 'nav'
        };
      },

      getCollapsableDOMNode: function () {
        return this.getDOMNode();
      },

      getCollapsableDimensionValue: function () {
        var node = this.refs.ul.getDOMNode(),
            height = node.offsetHeight,
            computedStyles = domUtils.getComputedStyles(node);

        return height + parseInt(computedStyles.marginTop, 10) + parseInt(computedStyles.marginBottom, 10);
      },

      render: function () {
        var classes = this.props.isCollapsable ? this.getCollapsableClassSet() : {};

        classes['navbar-collapse'] = this.props.isCollapsable;

        if (this.props.navbar) {
          return this.renderUl();
        }

        return this.transferPropsTo(
          React.DOM.nav( {className:classSet(classes)}, 
            this.renderUl()
          )
        );
      },

      renderUl: function () {
        var classes = this.getBsClassSet();

        classes['nav-stacked'] = this.props.stacked;
        classes['nav-justified'] = this.props.justified;
        classes['navbar-nav'] = this.props.navbar;

        return (
          React.DOM.ul( {className:classSet(classes), ref:"ul"}, 
            utils.modifyChildren(this.props.children, this.renderNavItem)
          )
        );
      },

      getChildActiveProp: function (child) {
        if (child.props.active) {
          return true;
        }
        if (this.props.activeKey != null) {
          if (child.props.key === this.props.activeKey) {
            return true;
          }
        }
        if (this.props.activeHref != null) {
          if (child.props.href === this.props.activeHref) {
            return true;
          }
        }

        return child.props.active;
      },

      renderNavItem: function (child) {
        return utils.cloneWithProps(
          child,
          {
            active: this.getChildActiveProp(child),
            activeKey: this.props.activeKey,
            activeHref: this.props.activeHref,
            onSelect: utils.createChainedFunction(child.props.onSelect, this.props.onSelect),
            ref: child.props.ref,
            key: child.props.key,
            navItem: true
          }
        );
      }
    });

    __exports__["default"] = Nav;
  });