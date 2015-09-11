var q = require('q');
var path = require('path');
var mustache = require('mustache');
var fs = require('fs');
var log = require('../utils/log');
var zetan = require('../');
var readFile = require('fs-readfile-promise');


exports.loadTemplate = function(appName,options){
	var appPath = this.resolve(appName,options);
	var templatePath = path.resolve(appPath,options.templatesDefaultFileName);
	
	log.debug('resolved template location:',templatePath);
	return readFile(templatePath).then(function(tpl){
		log.debug('template '+templatePath+' found ..');
		return tpl.toString();
	});
}

exports.render = function(template,data,partials,options){
	template = options.templatesPrefix + template.toString();
	data = data || {};
	partials = partials || {};
	
	data.partial = function(){
		return function(val, render) {
			var partialPath = path.resolve(appPath,render(val));
		    return fs.readFileSync(partialPath).toString();
		}
	};

	return mustache.render(template,data,partials);
}


exports.defaultMiddleware = function(req,res,render){
	var data = {}
	render(data);
}

exports.defaultRender = function(data,zetan){
	var deferred = q.defer();
	deferred.resolve(data);
	return deferred.promise;
}

exports.load = function(appName,options){

	var deferred = q.defer();
	var appPath = this.resolve(appName,options);
	var that = this;
	
	log.debug('attempting to load app');
	log.debug('attempting to load app',appName);
	log.debug('resolved app location:',appPath);

	try{
		var module = require(appPath);
		log.debug('module loaded',appName);

		var middleware = (module.middleware || this.defaultMiddleware);
		var render = (module.render || this.defaultRender);
		
		middleware(options.req,options.res,function(middData){
			render(middData,zetan).then(function(renderData){
				that.loadTemplate(appName,options).then(function(tpl){
					var res = that.render(tpl,renderData,{},options);
					deferred.resolve(res);
				})
			})
		});

	}catch(e){
		log.debug('error loading module', e);
		log.debug('trying to load template ...');
		this.loadTemplate(appName,options).then(deferred.resolve).catch(deferred.reject);
	}

	return deferred.promise;

}

exports.resolve = function(appName,options){
	options = options || {};
	
 	var root = path.dirname(require.main.filename);
	var baseDir = options.baseDir || '';

	return path.resolve(root,baseDir,appName);
}