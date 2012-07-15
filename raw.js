//strategy from https://github.com/nodebits/linux-joystick
var FS = require('fs');

FS.open("/dev/input/event13", "r", function (err, fd) {
	if (err) throw err;
	var buffer = new Buffer(24);
	function startRead() {
		FS.read(fd, buffer, 0, 24, null, function (err, bytesRead) {
			if (err) throw err;
			console.log("event", buffer);
			// TODO: Parse this event
			startRead();
		});
	}
	startRead();
});

