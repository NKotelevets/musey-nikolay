//Stukje voor geluidseffecten :-)
import jQuery from "jquery";

var arrSfxKeyDown = new Array();
var arrSfxKeyUp = new Array();
var arrSfxSwitches = new Array();

var curId = 0;
var numKeys = 4;
var numSwitches = 2;
var hadInteraction = false;

for (var i = 0; i < numKeys; i++) {
  var sfxDown = document.createElement("audio");
  sfxDown.setAttribute("src", "../sfx/key_down" + (i + 1) + ".mp3");
  //sfxDown.setAttribute('autoplay', 'autoplay');

  arrSfxKeyDown[i] = sfxDown;

  var sfxUp = document.createElement("audio");
  sfxUp.setAttribute("src", "../sfx/key_up" + (i + 1) + ".mp3");
  //sfxUp.setAttribute('autoplay', 'autoplay');

  arrSfxKeyUp[i] = sfxUp;
}

for (var i = 0; i < numSwitches; i++) {
  var sfxSwitch = document.createElement("audio");
  sfxSwitch.setAttribute("src", "../sfx/switch" + (i + 1) + ".mp3");

  arrSfxSwitches[i] = sfxSwitch;
}

jQuery("body").on("mousedown", function (event) {
  hadInteraction = true;
});

jQuery("body").on(
  "mouseover keydown",
  ".btn:not(.toggle-button), input, textarea",
  function (event) {
    if (hadInteraction) {
      curId = Math.floor(Math.random() * arrSfxKeyDown.length);
      arrSfxKeyDown[curId].play();
    }
  }
);

jQuery("body").on(
  "mouseout keyup",
  ".btn:not(.toggle-button), input, textarea",
  function (event) {
    if (hadInteraction) {
      curId = Math.floor(Math.random() * arrSfxKeyUp.length);
      arrSfxKeyUp[curId].play();
    }
  }
);

jQuery("body").on("mousedown", ".hg-button, .toggle-button", function (event) {
  if (hadInteraction) {
    curId = Math.floor(Math.random() * arrSfxKeyDown.length);
    arrSfxKeyDown[curId].play();
  }
});

jQuery("body").on("mouseup", ".hg-button, .toggle-button", function (event) {
  if (hadInteraction) {
    curId = Math.floor(Math.random() * arrSfxKeyUp.length);
    arrSfxKeyUp[curId].play();
  }
});

jQuery("body").on("mousedown", ".select-person-button", function (event) {
  if (hadInteraction) {
    curId = Math.floor(Math.random() * arrSfxKeyDown.length);
    arrSfxKeyDown[curId].play();
  }
});

jQuery("body").on("mouseup", ".select-person-button", function (event) {
  if (hadInteraction) {
    curId = Math.floor(Math.random() * arrSfxKeyUp.length);
    arrSfxKeyUp[curId].play();
  }
});
