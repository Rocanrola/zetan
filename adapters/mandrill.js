var mandrill = require('mandrill-api/mandrill');
var log = require('../utils/log');
var q = require('q');

module.exports = function(config){
	var mandrill_client = new mandrill.Mandrill(config.apiKey);

	return {
		name:'mandrill',
		send:function(email){
			var deferred = q.defer();
			
			var options = {
				message:email,
				async: false	
			}
			mandrill_client.messages.send(options, function(result) {
				log.debug('email sent',result);
			    deferred.resolve(result);
			}, function(e) {
				log.error('error sending email',e);
			    deferred.reject(e);
			});

			return deferred.promise;
		}
	}
}