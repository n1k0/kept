/** @jsx React.DOM */

"use strict";

var React = require("react");
var KeptApp = require("./components/KeptApp");
var KeptStore = require("./store");
var store = new KeptStore();

React.render(<KeptApp store={store} />,
                      document.getElementById('kept'));
