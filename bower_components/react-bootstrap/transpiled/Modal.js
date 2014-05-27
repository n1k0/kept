define(
  ["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./FadeMixin","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var FadeMixin = __dependency4__["default"];


    // TODO:
    // - aria-labelledby
    // - Add `modal-body` div if only one child passed in that doesn't already have it
    // - Tests

    var Modal = React.createClass({displayName: 'Modal',
      mixins: [BootstrapMixin, FadeMixin],

      propTypes: {
        title: React.PropTypes.renderable,
        backdrop: React.PropTypes.oneOf(['static', true, false]),
        keyboard: React.PropTypes.bool,
        closeButton: React.PropTypes.bool,
        animation: React.PropTypes.bool,
        onRequestHide: React.PropTypes.func.isRequired
      },

      getDefaultProps: function () {
        return {
          bsClass: 'modal',
          backdrop: true,
          keyboard: true,
          animation: true,
          closeButton: true
        };
      },

      render: function () {
        var modalStyle = {display: 'block'};
        var classes = this.getBsClassSet();

        classes['fade'] = this.props.animation;
        classes['in'] = !this.props.animation || !document.querySelectorAll;

        var modal = this.transferPropsTo(
          React.DOM.div(
            {title:null,
            tabIndex:"-1",
            role:"dialog",
            style:modalStyle,
            className:classSet(classes),
            ref:"modal"}, 
            React.DOM.div( {className:"modal-dialog"}, 
              React.DOM.div( {className:"modal-content"}, 
                this.props.title ? this.renderHeader() : null,
                this.props.children
              )
            )
          )
        );

        return this.props.backdrop ?
          this.renderBackdrop(modal) : modal;
      },

      renderBackdrop: function (modal) {
        var classes = {
          'modal-backdrop': true,
          'fade': this.props.animation
        };

        classes['in'] = !this.props.animation || !document.querySelectorAll;

        var onClick = this.props.backdrop === true ?
          this.handleBackdropClick : null;

        return (
          React.DOM.div(null, 
            React.DOM.div( {className:classSet(classes), ref:"backdrop", onClick:onClick} ),
            modal
          )
        );
      },

      renderHeader: function () {
        var closeButton;
        if (this.props.closeButton) {
          closeButton = (
              React.DOM.button( {type:"button", className:"close", 'aria-hidden':"true", onClick:this.props.onRequestHide}, "×")
            );
        }

        return (
          React.DOM.div( {className:"modal-header"}, 
            closeButton,
            this.renderTitle()
          )
        );
      },

      renderTitle: function () {
        return (
          React.isValidComponent(this.props.title) ?
            this.props.title : React.DOM.h4( {className:"modal-title"}, this.props.title)
        );
      },

      componentDidMount: function () {
        document.addEventListener('keyup', this.handleDocumentKeyUp);
      },

      componentWillUnmount: function () {
        document.removeEventListener('keyup', this.handleDocumentKeyUp);
      },

      handleBackdropClick: function (e) {
        if (e.target !== e.currentTarget) {
          return;
        }

        this.props.onRequestHide();
      },

      handleDocumentKeyUp: function (e) {
        if (this.props.keyboard && e.keyCode === 27) {
          this.props.onRequestHide();
        }
      }
    });

    __exports__["default"] = Modal;
  });