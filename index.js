/*
index
Add all sub middlewares:
	- apps (load apps from apps folder)
*/
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

var mw = composable_middleware();



module.exports = function(config){
	var zetan = this;
	config = _.defaultsDeep(config || {}, defaultConfig);
	
	log.toggleDebug(config.debug);
	
	mw.use(express.static('public'));
	mw.use(function(req,res,next){
		req.zetan = zetan;
		req.helpers = helpers;
		next();
	})

	mw.use(require('./api')(config.api));
	mw.use(require('./apps')(config.apps));

	return mw;
}

module.exports.helpers = helpers;