/**
 * Read Linux mouse(s) in node.js
 * Author: Marc Loehe (marcloehe@gmail.com)
 *
 * Adapted from Tim Caswell's nice solution to read a linux joystick
 * http://nodebits.org/linux-joystick
 * https://github.com/nodebits/linux-joystick
 */

var fs = require('fs'),
    EventEmitter = require('events').EventEmitter;

var decode   = require('./decode_mouse_buffer');

function Mouse(mouseid) {
  this.wrap('onOpen');
  this.wrap('onRead');
  //this.buf = new Buffer(3);
  this.buf = new Buffer(24);
  fs.open('/dev/input/event' + mouseid , 'r', this.onOpen);
}

Mouse.prototype = Object.create(EventEmitter.prototype, {
  constructor: {value: Mouse}
});

Mouse.prototype.wrap = function(name) {
  var self = this;
  var fn = this[name];
  this[name] = function (err) {
    if (err) return self.emit('error', err);
    return fn.apply(self, Array.prototype.slice.call(arguments, 1));
  };
};

Mouse.prototype.onOpen = function(fd) {
  this.fd = fd;
  this.startRead();
};

Mouse.prototype.startRead = function() {
  fs.read(this.fd, this.buf, 0, 24, null, this.onRead);
};

Mouse.prototype.onRead = function(bytesRead) {
//  console.log("prototype.onRead " + this.buf);
  event = decode.mouse_event(this,this.buf);
  event.dev = this.dev;
  this.emit(event.type, event);
  if (this.fd) this.startRead();
};

Mouse.prototype.close = function(callback) {
  fs.close(this.fd, (function(){console.log(this);}));
  this.fd = undefined;
}

/****************
 * Sample Usage *
 ****************/
var startLDown=0.0;
var startMDown=0.0;
var startRDown=0.0;
function err(e) {
  console.log("error " + e);
}

function lel(e){
	console.log("left " + e.state + ' ' + e.time);
  if(e.state == 'D'){
    startLDown = e.time;
  }
  else {
    console.log("deltaTL " + (e.time-startLDown));
  }
}

function rig(e){
	console.log("right " + e.state + ' ' + e.time);
  if(e.state == 'D'){
    startRDown = e.time;
  }
  else {
    console.log("deltaTR " + (e.time-startRDown));
  }
}

function mid(e){
	console.log("middle " + e.state + ' ' + e.time);
  if(e.state == 'D'){
    startMDown = e.time;
  }
  else {
    console.log("deltaTM " + (e.time-startMDown));
  }
}
// read all mouse events from /dev/input/mice
var mouse = new Mouse(12);
mouse.on('L', lel);
mouse.on('R', rig);
mouse.on('M', mid);
mouse.on('error', err);
//mouse.on('moved', console.log);

// to read only a specific mouse by id (e.g. /dev/input/mouse0) use
// var mouse0 = newMouse(0);

// to close mouse
// mouse.close();
// mouse = undefined;
//
