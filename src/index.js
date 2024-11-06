//import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import jQuery from 'jquery';

import './sfx.js';


import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';



ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


const keyboard = new Keyboard({
  onChange: input => onChange(input),
  onKeyPress: button => onKeyPress(button),
  layout: {
    'default': [
      '1 2 3 4 5 6 7 8 9 0 {bksp}',
      'Q W E R T Y U I O P',
      'A S D F G H J K L {enter}',
      'Z X C V B N M ?',
      '{space}'
    ]
  },
  display: {
    '{bksp}': 'backspace',
    '{enter}': 'versturen',
    '{space}': ' '
  }
});

function onChange(input){
  jQuery(".bpComposerInput").val( input) ;
  jQuery("#input-keyboard").val( input) ;
}

function onKeyPress(button){
  if(button == "{enter}") {
    console.log("Button pressed", button);
   
    //botpressClient.sendMessage(jQuery(".bpComposerInput").val() );

  } 
}

//zet ondertitels standaard aan
jQuery("#toggle-subtitles").trigger("click")

var strSubtitles;
var directionSubtitles;
setInterval(function() {

  var lastItem = jQuery(".bpMessageBlocksTextText").last();

  var newSubtitles = lastItem.text()

  if(newSubtitles != strSubtitles) {

    directionSubtitles = lastItem.parent().parent().data("direction")
    
    strSubtitles= newSubtitles
    jQuery('#subtitles').removeClass()
    jQuery('#subtitles').addClass(directionSubtitles)
    jQuery('#subtitles').text(strSubtitles);
    
  }
  
}, 1000);