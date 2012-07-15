//strategy from https://github.com/nodebits/linux-joystick
var FS = require('fs');


function parse(buffer) {
	return {
		time: buffer.readUInt32LE(0),
		value: buffer.readInt16LE(4),
		type: buffer[6],
		number: buffer[7]
}
}

FS.open("/dev/input/event13", "r", function (err, fd) {
	if (err) throw err;
	var buffer = new Buffer(24);
	function startRead() {
		FS.read(fd, buffer, 0, 24, null, function (err, bytesRead) {
			if (err) throw err;
			console.log("event", parse(buffer));
			startRead();
		});
	}
	startRead();
});

