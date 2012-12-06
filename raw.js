// read mouse  button events under linux
//			#struct input_event {
//				#        struct timeval time; = {long seconds, long microseconds}
//				#        unsigned short type;
//				#        unsigned short code;
//				#        unsigned int value;
//				#};
//strategy from https://github.com/nodebits/linux-joystick
//grep Handlers=mouse /proc/bus/input/devices
//
var FS = require('fs');
var decoder = require('./decoders');
var		dn_stamp = 0.0,
up_stamp = 0.0,
dn_last = 0.0,
up_last = 0.0,
brew_last = 0.0,
heating = false,
brew_time = 5*60*1000,
warming_interval = 4*60*1000,
happenen = false;


FS.open("/dev/input/event11", "r", function (err, fd) {
	if (err) throw err;
	var buffer = new Buffer(24);
	function startRead() {
		FS.read(fd, buffer, 0, 24, null, function (err, bytesRead) {
			if (err) throw err;

			mouse_event = decoder.mouse_event(buffer);

			if(mouse_event.button == 'R'){
				if(mouse_event.state == 'D') {
					console.log("het:"+Date());
					dn_stamp = mouse_event.time;
					console.log("per:"+Date()+"#"+(dn_stamp - dn_last));
					dn_last = dn_stamp;
					happenen=true;
					heating=true;
				} 
				if(mouse_event.state == 'U'){
					up_stamp = mouse_event.time;
					if((up_stamp - dn_stamp) > brew_time){
						console.log("brw:"+Date());
						brew_last = Date.now();
					}
					console.log("dur:"+ Date()+"#" + (up_stamp-dn_stamp));
					up_last = up_stamp;
					happenen=true;
					heating=false;
				}
			} 	

			startRead();
		});
	}
	startRead();
});

// if nothing happens for 5 minutes, call the coffee pot "off"
function handle_timeout() {
	if(!heating) {
		if(happenen) {
			console.log("on :"+Date());
		}else {
			console.log("off:"+Date());
		}
	}
	if(brew_last != 0.0) {
		console.log("last brew was "+ (Date.now() - brew_last)/60000 + " Minutes Ago");
	}
	startTimeout(handle_timeout, warming_interval);
}

function startTimeout(){
	happenen = false;
	setTimeout(handle_timeout, warming_interval);
}

startTimeout();

