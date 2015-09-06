var log = require('../utils/log');

var db = {
	connections:{}
}

db.use = function(adapter){
	db.connections[adapter.name]=adapter;
	adapter.connect().then(function(){
		console.log('db connecting',adapter.name)
	}).catch(function(){
		log.error('db: conection errror')
	})
}

module.exports = db;