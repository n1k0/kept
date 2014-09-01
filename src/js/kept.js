/** @jsx React.DOM */

"use strict";

var React = require("react");
var KeptApp = require("./components/KeptApp");
var KeptStore = require("./store");
var DaybedStore = require("./store/daybed");
// var store = new KeptStore();
var store = new DaybedStore({
  "host": "http://localhost:8000",
  token: function() {
    if (window.location.hash !== "") {
      return window.location.hash.slice(1);
    }
  },
  onSession: function(session) {
    console.log("session token", session.token);
    console.log("hash location", window.location.hash);

    if (session.token !== window.location.hash.slice(1)) {
      window.location.hash = session.token;
    }
  }
});
store.setUp().then(function() {
  React.renderComponent(<KeptApp store={store} />,
                        document.getElementById('kept'));
});
