var colors = require('colors');
var _ = require('lodash');
var prefix = 'zetan: ';
var logger = console;

var log = function(){
	arguments[0] = '# z: ' + arguments[0];
	arguments[0] = arguments[0].green;

	logger.log.apply(logger,arguments);
}

log.error = function(mssg){
	mssg = prefix + (mssg||'');
	logger.log.call(mssg.red);
}

log.toggleDebug = function(flag){
	this.showDebug = _.isUndefined(flag) ? !this.showDebug : flag;
}
// TODO: accept multiple params
log.debug = function(){
	if(this.showDebug && arguments[0]){
		
		arguments[0] = '# z debug: ' + arguments[0];
		arguments[0] = arguments[0].yellow;

		logger.log.apply(logger,arguments);
	}
}

module.exports = log;