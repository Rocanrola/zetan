var path = require( 'path' );
var _ = require( 'lodash' );
var composable_middleware = require( 'composable-middleware' );
var express = require('express');

var helpers = require('./helpers');
var utils = require('./utils');
var argv = require('minimist')(process.argv.slice(2));

var log = utils.log;

var defaultConfig = {
	debug:false,
	api:{
		baseDir:'api',
		prefix:'/api/v1'
	},
	apps:{
		baseDir:'apps',
		homeAppName:'index',
		notFoundAppName:'404',
		templatesDefaultFileName:'template.html',
		templatesPrefix:'{{={{{ }}}=}}'
	}
}

module.exports = function(config){
	// merge config
	config = _.defaultsDeep(config || {}, defaultConfig);
	
	var zetan = this;
	var mw = composable_middleware();
	
	// global c object
	global.c = require('tracer').colorConsole();

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
	if(argv.dev){
		log.debug('--dev argument passed');

		log.debug('connect live reload middleware');
		mw.use(require('connect-livereload')());	
	}

	mw.use(require('./api')(config.api));
	mw.use(require('./apps')(config.apps));

	return mw;
}

// exports other things
module.exports.helpers = helpers;
module.exports.utils = utils;
module.exports.serve = function(port,options){
	port = port || 8080;
	var app = express();
	var port = 5678;

	app.use(this(options));

	app.listen(port,function(){
		log.debug('## running on http://localhost:' + port);
	});
}