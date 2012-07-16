// read mouse  button events under linux
//			#struct input_event {
//				#        struct timeval time; = {long seconds, long microseconds}
//				#        unsigned short type;
//				#        unsigned short code;
//				#        unsigned int value;
//				#};
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
function zfill(num, len) {return (Array(len).join("0") + num).slice(-len);}

FS.open("/dev/input/event10", "r", function (err, fd) {
	if (err) throw err;
	var buffer = new Buffer(24);
	function startRead() {
		FS.read(fd, buffer, 0, 24, null, function (err, bytesRead) {
			if (err) throw err;
		var useconds = 0.0,
			 seconds = 0.0,
			 type = 0.0,
       code = 0.0,
       value =0.0,
			 data = '';			 

			seconds = buffer[3]
			seconds += seconds * 255+buffer[2]
			seconds += seconds * 255+buffer[1]
			seconds += seconds * 255+buffer[0]

      useconds = buffer[7]
			useconds += useconds * 255+buffer[6]
			useconds += useconds * 255+buffer[5]
			useconds += useconds * 255+buffer[4]

			type = buffer[9];
			type = type + buffer[10];

			code = buffer[12];
			code = code + buffer[11];

			value = buffer[14];
			value = value + buffer[13];

			data = seconds+':'+zfill(useconds,6)+':'+ zfill(type.toString(2),16)+':'+zfill(code.toString(2),16)+":"+zfill(value.toString(2),16);

			if(!(type == 0 || type == 1)) {
				if(type == 0x10){
					if(code == 0x2) {
						console.log("left dn --> ");
					} 
					if(code == 0x1){
						console.log("left up --> ");
					}
				}
				if(type == 0x12){
					if(code == 0x2) {
						console.log("midd dn --> ");
					} 
					if(code == 0x1){
						console.log("midd up --> ");
					}
				} 	
				if(type == 0x11){
					if(code == 0x2) {
						console.log("righ dn --> ");
					} 
					if(code == 0x1){
						console.log("righ up --> ");
					}
				} 	
			}
			startRead();
		});
	}
	startRead();
});

