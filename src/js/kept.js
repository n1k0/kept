/** @jsx React.DOM */

"use strict";

var React = require("react");
var KeptApp = require("./components/KeptApp");
var KeptStore = require("./store");
var DaybedStore = require("./store/daybed");
// var store = new KeptStore();
var store = new DaybedStore({
  "host": "http://localhost:8000",
  "tokenId": "8ac94860337bcd6497bc6dd7c17836f2ce027fb442666ee8bace96c8c58e3594",
  "tokenKey": "1d24f64c424cdefe4797a13c1d43b73d20988c803a1dcf80a684e6cd336db31e"
});
store.setUp().then(function() {
  React.renderComponent(<KeptApp store={store} />,
                        document.getElementById('kept'));
});
