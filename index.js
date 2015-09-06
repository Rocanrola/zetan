/*
index
Add all sub middlewares:
	- apps (load apps from apps folder)
*/
var log = require('./utils/log');
var composable_middleware = require( 'composable-middleware' );
var _ = require( 'lodash' );
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
	config = _.defaultsDeep(config || {}, defaultConfig);
	
	var mw = composable_middleware();
	log.toggleDebug(config.debug);

	mw.use(function(req,res,next){
		req.helpers = helpers;
		next();
	})

	mw.use(require('./api')(config.api));
	mw.use(require('./apps')(config.apps));

	return mw;
}

exports.helpers = helpers;