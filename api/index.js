var composable_middleware = require( 'composable-middleware' );
var express = require('express');
var mw = composable_middleware();
var log = require('../utils/log');

var defaultConfig = {
	prefix:'/api/v1'
}
var route = '/:resourceName/:resourceId?';

module.exports = function(config){
	// TODO: Merge config with default config
	config = config || defaultConfig;

	var router = express.Router();
	var fullRoute = config.prefix+route;
	
	router.all(fullRoute,function(req,res,next){
		log(req.params)
		next();
	});

	mw.use(router);

	return mw;
}