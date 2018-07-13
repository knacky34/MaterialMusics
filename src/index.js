const {ipcRenderer} = require('electron');
const fs = require('fs');
const mm = require('musicmetadata');

var player_progress;
var volume_slider;






function init() {
  var elements = document.querySelectorAll('.mdc-ripple');
  for (var i = 0, element; element = elements[i]; i++) {
    mdc.ripple.MDCRipple.attachTo(element);
  }

  player_progress = mdc.slider.MDCSlider.attachTo(document.getElementById('player_progress'));
  volume_slider = mdc.slider.MDCSlider.attachTo(document.getElementById('volume_slider'));

  document.getElementById('btn_settings').onclick = function() {
    ipcRenderer.send('main_settings');
  };
}

window.onload = init;


/*

Decibel to Linear
linear = (Math.pow(10, (parseFloat(decibel) / 20)));

Linear to Decibel
decibel = (Math.log(parseFloat(linear)) / Math.LN10) * 20;

*/
