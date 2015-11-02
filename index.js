var path = require( 'path' );
var _ = require( 'lodash' );
var composable_middleware = require( 'composable-middleware' );
var express = require('express');

var helpers = require('./helpers');
var utils = require('./utils');

var log = utils.log;

var argv = require('minimist')(process.argv.slice(2));

var defaultConfig = {
	debug:false,
	api:{
		baseDir:'api',
		prefix:'/api/v1'
	},
	apps:{
		env:'production',
		baseDir:'apps',
		homeAppName:'index',
		notFoundAppName:'404',
		templatesDefaultFileName:'template.html',
		clientSriptDefaultFileName:'client.js',
		stylesheetDefaultFileName:'styles.less',
		minifyCSS:true,
		templatesPrefix:'{{={{{ }}}=}}'
	}
}

var devConfig = {
	debug:true,
	apps:{
		env:'development',
		minifyCSS:false
	}
}

module.exports = function(options){
	// init options
	options = _.defaultsDeep(options || {}, defaultConfig);

	
	if(argv.dev){
		// merge with dev config if --dev arg passed
		options = _.merge(options, devConfig);
		log('--dev passed. options setted: \n',options);
	}

	// switch on/off debug mode
	log.toggleDebug(options.debug);

	var zetan = this;
	var mw = composable_middleware();
	
	// global c object
	global.c = require('tracer').colorConsole();
	
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

	mw.use(require('./api')(options.api));


	mw.use(require('./apps')(options.apps));

	return mw;
}

// exports other things
module.exports.helpers = helpers;
module.exports.utils = utils;
module.exports.serve = function(port,options){
	port = port || 8080;
	var app = express();

	app.use(this(options));

	app.listen(port,function(){
		log.debug('## running on http://localhost:' + port);
	});
	return app;
}

log('if use nodemon: "nodemon index.js --dev --ignore client.js" recommended for dev');