//import 'bootstrap/dist/css/bootstrap.css';
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import jQuery from "jquery";

import "./sfx.js";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

//zet ondertitels standaard aan
jQuery("#toggle-subtitles").trigger("click");

var strSubtitles;
var directionSubtitles;
setInterval(function () {
  var lastItem = jQuery(".bpMessageBlocksTextText").last();

  var newSubtitles = lastItem.text();

  if (newSubtitles != strSubtitles) {
    directionSubtitles = lastItem.parent().parent().data("direction");

    strSubtitles = newSubtitles;
    jQuery("#subtitles").removeClass();
    jQuery("#subtitles").addClass(directionSubtitles);
    jQuery("#subtitles").text(strSubtitles);
  }
}, 1000);
