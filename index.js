var path = require( 'path' );
var _ = require( 'lodash' );
var composable_middleware = require( 'composable-middleware' );
var express = require('express');

var log = require('./utils/log');
var helpers = require('./helpers');


var defaultConfig = {
	debug:false,
	api:{},
	apps:{
		baseDir:'apps',
		homeAppName:'index',
		notFoundAppName:'404',
		templatesDefaultFileName:'template.html',
		templatesPrefix:'{{={{{ }}}=}}'
	}
}

module.exports = function(config){
	var zetan = this;
	var mw = composable_middleware();

	// merge config
	config = _.defaultsDeep(config || {}, defaultConfig);
	
	// switch on/off debug mode
	log.toggleDebug(config.debug);
	
	// static files
	mw.use(express.static('public'));
	
	// zetan static files
	var staticsDir = path.resolve(__dirname,'statics/');
	mw.use(express.static(staticsDir));

	// attach things to req object
	mw.use(function(req,res,next){
		req.zetan = zetan;
		req.helpers = helpers;
		next();
	})
	
	// add middlewares
	mw.use(require('./api')(config.api));
	mw.use(require('./apps')(config.apps));

	return mw;
}

// exports other things
module.exports.helpers = helpers;