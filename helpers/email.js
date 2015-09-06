var log = require('../utils/log');

// var adapterShape = {
// 	send:function(){ 
// 		// send email
// 	}
// }

var adapters = {};
var email = {};

email.default=function(adapter){
	adapters.default = adapter;
	log.debug('email.default:',adapter);
}

email.use=function(adapter){
	adapters[adapter.name] = adapter;
	
	if(!adapters.default){
		adapters.default = adapter;
	}

	log.debug('email.use:',adapter);
}

email.send=function(){
	log.debug('email.send:',arguments);
	return adapters.default.send.apply(adapters.default,arguments);
}

module.exports = email;