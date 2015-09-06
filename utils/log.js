var colors = require('colors');
var prefix = 'zetan: ';

var log = function(){
	Array.prototype.unshift.call(arguments,'## zetan:'.yellow);

	console.log.apply(console,arguments);
}

log.error = function(mssg){
	mssg = prefix + (mssg||'');
	console.log.call(mssg.red);
}

log.toggleDebug = function(flag){
	log.showDebug = flag || !this.showDebug;
}
// TODO: accept multiple params
log.debug = function(){
	if(log.showDebug && arguments[0]){
		
		arguments[0] = '### zetan debug: ' + arguments[0];
		arguments[0] = arguments[0].yellow;

		console.log.apply(console,arguments);
	}
}

module.exports = log;