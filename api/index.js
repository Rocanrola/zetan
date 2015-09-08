var path = require('path');
var composable_middleware = require( 'composable-middleware' );
var express = require('express');
var _ = require('lodash');
var mw = composable_middleware();
var log = require('../utils/log');


var route = '/:resourceName/:id?';
var rootDir = path.dirname(require.main.filename);

module.exports = function(options){

	var router = express.Router();
	var fullRoute = options.prefix+route;
		
	log.debug('api route',fullRoute);
	log.debug('api options',options)

	router.all(fullRoute,function(req,res,next){

		// data to be passed to method {

		var id = req.params.id;
		var name = req.params.resourceName;
		var method = req.method.toLowerCase();

		var data = {
			resource:{
				name:name,
				id:id
			}
		};
		_.assign(data.auth, req.auth);
		log.debug('data', data);

		// }

		try{
			var modulePath = path.resolve(rootDir,options.baseDir,name);
			log.debug('api module path',modulePath);
			var module = require(modulePath);

			var func = _.get(module, 'alias["'+id+'"]'+'["'+method+'"]') ||
							  _.get(module, method);

			if(func){
				func(data).then(function(obj){
					res.json(obj);
				});
			}else{
				next();
			}

		}catch(e){
			log.debug('api module not found',e);
			next();
		}

	});

	mw.use(router);

	return mw;
}