"use strict";

var React = require("react");
var reactDom = require("react-dom");
var KeptApp = require("./components/KeptApp");
var KeptStore = require("./store");
var store = new KeptStore();

reactDom.render(<KeptApp store={store} />,
                      document.getElementById("kept"));
