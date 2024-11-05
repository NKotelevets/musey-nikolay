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
  onKeyPress: button => onKeyPress(button)
});

function onChange(input){
  jQuery(".bpComposerInput").val( input) ;
  jQuery("#input-keyboard").val( input) ;
}

function onKeyPress(button){
  if(button == "{enter}") {
    console.log("Button pressed", button);
    //botpressClient.sendMessage(jQuery(".bpComposerInput").val() );

      jQuery(".bpComposerButtonContainer").trigger("click")
  } 
}

jQuery("#toggle-subtitles").trigger("click")