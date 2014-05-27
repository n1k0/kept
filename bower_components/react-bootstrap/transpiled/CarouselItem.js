define(
  ["./react-es6","./react-es6/lib/cx","./react-es6/lib/ReactTransitionEvents","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var ReactTransitionEvents = __dependency3__["default"];

    var CarouselItem = React.createClass({displayName: 'CarouselItem',
      propTypes: {
        direction: React.PropTypes.oneOf(['prev', 'next']),
        onAnimateOutEnd: React.PropTypes.func,
        active: React.PropTypes.bool,
        caption: React.PropTypes.renderable
      },

      getInitialState: function () {
        return {
          direction: null
        };
      },

      getDefaultProps: function () {
        return {
          animation: true
        };
      },

      handleAnimateOutEnd: function () {
        if (typeof this.props.onAnimateOutEnd === 'function') {
          this.props.onAnimateOutEnd(this.props.index);
        }
      },

      componentWillReceiveProps: function (nextProps) {
        if (this.props.active !== nextProps.active) {
          this.setState({
            direction: null
          });
        }
      },

      componentDidUpdate: function (prevProps) {
        if (!this.props.active && prevProps.active) {
          ReactTransitionEvents.addEndEventListener(
            this.getDOMNode(),
            this.handleAnimateOutEnd
          );
        }

        if (this.props.active !== prevProps.active) {
          setTimeout(this.startAnimation, 20);
        }
      },

      startAnimation: function () {
        this.setState({
          direction: this.props.direction === 'prev' ?
            'right' : 'left'
        });
      },

      render: function () {
        var classes = {
          item: true,
          active: (this.props.active && !this.props.animateIn) || this.props.animateOut,
          next: this.props.active && this.props.animateIn && this.props.direction === 'next',
          prev: this.props.active && this.props.animateIn && this.props.direction === 'prev'
        };

        if (this.state.direction && (this.props.animateIn || this.props.animateOut)) {
          classes[this.state.direction] = true;
        }

        return this.transferPropsTo(
          React.DOM.div( {className:classSet(classes)}, 
            this.props.children,
            this.props.caption ? this.renderCaption() : null
          )
        );
      },

      renderCaption: function () {
        return (
          React.DOM.div( {className:"carousel-caption"}, 
            this.props.caption
          )
        );
      }
    });

    __exports__["default"] = CarouselItem;
  });