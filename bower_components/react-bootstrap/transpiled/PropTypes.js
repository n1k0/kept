define(
  ["./react-es6","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var React = __dependency1__["default"];

    __exports__["default"] = {
      componentClass: function (props, propName, componentName) {
        return React.isValidClass(props[propName]);
      }
    };
  });