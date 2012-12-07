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
/**
 * Parse PS/2 mouse protocol
 * According to http://www.computer-engineering.org/ps2mouse/
 */
function parse(mouse, buffer) {
  var event = {
    leftBtn:    (buffer[0] & 1  ) > 0, // Bit 0
    rightBtn:   (buffer[0] & 2  ) > 0, // Bit 1
    middleBtn:  (buffer[0] & 4  ) > 0, // Bit 2
    state:      (buffer[0] & 8  ) > 0, // Bit 3 
    xSign:      (buffer[0] & 16 ) > 0, // Bit 4
    ySign:      (buffer[0] & 32 ) > 0, // Bit 5
    xOverflow:  (buffer[0] & 64 ) > 0, // Bit 6
    yOverflow:  (buffer[0] & 128) > 0, // Bit 7
    xDelta:      buffer.readInt8(1),   // Byte 2 as signed int
    yDelta:      buffer.readInt8(2)    // Byte 3 as signed int
  };

    console.log(buffer[0].toString(2) + ' ' + buffer[1].toString(2));

	switch (buffer[0] & 7) 
	{
		case 1: 
      event.type='left';
		  break;
		case 2: 
			event.type='right';
		  break;
		case 4:
		  event.type='middle'	;
		  break;
		default: event.type='moved'; 
	}
//	if (event.leftBtn || event.rightBtn || event.middleBtn) {
//    event.type = 'button';
//  } else {
//    event.type = 'moved';
//  }
  return event;
}

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

function err(e) {
  console.log("error " + e);
}

function lel(e){
	console.log("left " + e.state + ' ' + e.time);
}

function rig(e){
	console.log("right " + e.state + ' ' + e.time);
}

function mid(e){
	console.log("middle " + e.state + ' ' + e.time);
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
