define(
  ["./react-es6","./react-es6/lib/cloneWithProps","./OverlayMixin","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var cloneWithProps = __dependency2__["default"];
    var OverlayMixin = __dependency3__["default"];
    var utils = __dependency4__["default"];

    var ModalTrigger = React.createClass({displayName: 'ModalTrigger',
      mixins: [OverlayMixin],

      propTypes: {
        modal: React.PropTypes.renderable.isRequired
      },

      getInitialState: function () {
        return {
          isOverlayShown: false
        };
      },

      show: function () {
        this.setState({
          isOverlayShown: true
        });
      },

      hide: function () {
        this.setState({
          isOverlayShown: false
        });
      },

      toggle: function () {
        this.setState({
          isOverlayShown: !this.state.isOverlayShown
        });
      },

      renderOverlay: function () {
        if (!this.state.isOverlayShown) {
          return React.DOM.span(null );
        }

        return cloneWithProps(
          this.props.modal,
          {
            onRequestHide: this.hide
          }
        );
      },

      render: function () {
        var child = React.Children.only(this.props.children);
        return cloneWithProps(
          child,
          {
            onClick: utils.createChainedFunction(child.props.onClick, this.toggle)
          }
        );
      }
    });

    __exports__["default"] = ModalTrigger;
  });