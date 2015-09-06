var MongoClient = require('mongodb').MongoClient;
var log = require('../utils/log');
var q = require('q');

module.exports = function(config){
	log.debug('db.adapters.mongo: config: ',config)
	config = config || {};

	if(!config.url){
		log.error('db.adapters.mongo: "url" attribute required');
        return;
	}

	// init

	var adapter = {
		name:'mongo',
		db:null
	};


	adapter.connect = function(){
		var deferred = q.defer();
		var that = this;

		MongoClient.connect(config.url, function(err, connection) {
			if(err){
				deferred.reject(err);
			}else{
				log.debug('db.adapters.mongo.connect: connected');
				adapter.db = connection;
				deferred.resolve(that);
			}
		});

		return deferred.promise;
	}

	adapter.create = function(collectionName,newDoc){
		var deferred = q.defer();

		adapter.db.collection(collectionName).insert([newDoc], function(err, result) {
    		if(err){
				deferred.reject(err);
			}else{
				deferred.resolve(result.ops[0]);
			}
  		});

  		return deferred.promise;
	}

	adapter.update = function(collectionName,query,newDoc){
		
	}

	adapter.delete = function(collectionName,query){
		
	}

	adapter.deleteOne = function(collectionName,query){
		
	}

	adapter.find = function(collectionName,query){
		
	}

	adapter.findOne = function(collectionName,query){
		
	}

	

	return adapter;
}