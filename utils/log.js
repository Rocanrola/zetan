var colors = require('colors');
var prefix = 'zetan: ';
var logger = console;

var log = function(){
	Array.prototype.unshift.call(arguments,'## zetan:'.yellow);

	logger.log.apply(logger,arguments);
}

log.error = function(mssg){
	mssg = prefix + (mssg||'');
	logger.log.call(mssg.red);
}

log.toggleDebug = function(flag){
	log.showDebug = flag || !this.showDebug;
}
// TODO: accept multiple params
log.debug = function(){
	if(log.showDebug && arguments[0]){
		
		arguments[0] = '# z debug: ' + arguments[0];
		arguments[0] = arguments[0].yellow;

		logger.log.apply(logger,arguments);
	}
}

module.exports = log;