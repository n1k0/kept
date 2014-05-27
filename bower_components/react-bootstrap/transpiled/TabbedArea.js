define(
  ["./react-es6","./BootstrapMixin","./utils","./Nav","./NavItem","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    "use strict";
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var BootstrapMixin = __dependency2__["default"];
    var utils = __dependency3__["default"];
    var Nav = __dependency4__["default"];
    var NavItem = __dependency5__["default"];

    function hasTab (child) {
      return !!child.props.tab;
    }

    var TabbedArea = React.createClass({displayName: 'TabbedArea',
      mixins: [BootstrapMixin],

      propTypes: {
        animation: React.PropTypes.bool,
        onSelect: React.PropTypes.func
      },

      getDefaultProps: function () {
        return {
          animation: true
        };
      },

      getInitialState: function () {
        var defaultActiveKey = this.props.defaultActiveKey;

        if (defaultActiveKey == null) {
          var children = this.props.children;
          defaultActiveKey =
            Array.isArray(children) ? children[0].props.key : children.props.key;
        }

        return {
          activeKey: defaultActiveKey,
          previousActiveKey: null
        };
      },

      componentWillReceiveProps: function (nextProps) {
        if (nextProps.activeKey != null && nextProps.activeKey !== this.props.activeKey) {
          this.setState({
            previousActiveKey: this.props.activeKey
          });
        }
      },

      handlePaneAnimateOutEnd: function () {
        this.setState({
          previousActiveKey: null
        });
      },

      render: function () {
        var activeKey =
          this.props.activeKey != null ? this.props.activeKey : this.state.activeKey;

        var nav = this.transferPropsTo(
          Nav( {bsStyle:"tabs", activeKey:activeKey, onSelect:this.handleSelect, ref:"tabs"}, 
              utils.modifyChildren(utils.filterChildren(this.props.children, hasTab), this.renderTab)
          )
        );

        return (
          React.DOM.div(null, 
            nav,
            React.DOM.div( {id:this.props.id, className:"tab-content", ref:"panes"}, 
              utils.modifyChildren(this.props.children, this.renderPane)
            )
          )
        );
      },

      getActiveKey: function () {
        return this.props.activeKey != null ? this.props.activeKey : this.state.activeKey;
      },

      renderPane: function (child) {
        var activeKey = this.getActiveKey();

        return utils.cloneWithProps(
            child,
            {
              active: (child.props.key === activeKey &&
                (this.state.previousActiveKey == null || !this.props.animation)),
              ref: child.props.ref,
              key: child.props.key,
              animation: this.props.animation,
              onAnimateOutEnd: (this.state.previousActiveKey != null &&
                child.props.key === this.state.previousActiveKey) ? this.handlePaneAnimateOutEnd: null
            }
          );
      },

      renderTab: function (child) {
        var key = child.props.key;
        return (
          NavItem(
            {ref:'tab' + key,
            key:key}, 
            child.props.tab
          )
        );
      },

      shouldComponentUpdate: function() {
        // Defer any updates to this component during the `onSelect` handler.
        return !this._isChanging;
      },

      handleSelect: function (key) {
        if (this.props.onSelect) {
          this._isChanging = true;
          this.props.onSelect(key);
          this._isChanging = false;
        } else if (key !== this.getActiveKey()) {
          this.setState({
            activeKey: key,
            previousActiveKey: this.getActiveKey()
          });
        }
      }
    });

    __exports__["default"] = TabbedArea;
  });