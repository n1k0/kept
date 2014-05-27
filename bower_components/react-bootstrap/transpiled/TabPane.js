define(
  ["./react-es6","./react-es6/lib/cx","./react-es6/lib/ReactTransitionEvents","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var ReactTransitionEvents = __dependency3__["default"];

    var TabPane = React.createClass({displayName: 'TabPane',
      getDefaultProps: function () {
        return {
          animation: true
        };
      },

      getInitialState: function () {
        return {
          animateIn: false,
          animateOut: false
        };
      },

      componentWillReceiveProps: function (nextProps) {
        if (this.props.animation) {
          if (!this.state.animateIn && nextProps.active && !this.props.active) {
            this.setState({
              animateIn: true
            });
          } else if (!this.state.animateOut && !nextProps.active && this.props.active) {
            this.setState({
              animateOut: true
            });
          }
        }
      },

      componentDidUpdate: function () {
        if (this.state.animateIn) {
          setTimeout(this.startAnimateIn, 0);
        }
        if (this.state.animateOut) {
          ReactTransitionEvents.addEndEventListener(
            this.getDOMNode(),
            this.stopAnimateOut
          );
        }
      },

      startAnimateIn: function () {
        if (this.isMounted()) {
          this.setState({
            animateIn: false
          });
        }
      },

      stopAnimateOut: function () {
        if (this.isMounted()) {
          this.setState({
            animateOut: false
          });

          if (typeof this.props.onAnimateOutEnd === 'function') {
            this.props.onAnimateOutEnd();
          }
        }
      },

      render: function () {
        var classes = {
          'tab-pane': true,
          'fade': true,
          'active': this.props.active || this.state.animateOut,
          'in': this.props.active && !this.state.animateIn
        };

        return this.transferPropsTo(
          React.DOM.div( {className:classSet(classes)}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = TabPane;
  });