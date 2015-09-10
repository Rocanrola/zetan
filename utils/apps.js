var q = require('q');
var path = require('path');
var mustache = require('mustache');
var fs = require('fs');
var log = require('../utils/log');
var zetan = require('../');
var readFile = require('fs-readfile-promise');



exports.load = function(appName,options){

	var deferred = q.defer();
	var appPath = this.resolve(appName,options);
	var templatePath = path.resolve(appPath,options.templatesDefaultFileName);
	
	log.debug('loading app',appName);
	log.debug('app path',appPath);
	log.debug('template path',templatePath);

	var respondTemplate = function(data,partials){
		readFile(templatePath).then(function(tpl){
			data = data || {};
			partials = partials || {};
			
			data.partial = function(){
				return function(val, render) {
					var partialPath = path.resolve(appPath,render(val));
				    return fs.readFileSync(partialPath).toString();
				}
			};

			log.debug('template '+templatePath+' found ..');
			var template = options.templatesPrefix + tpl.toString();
			
			var r = mustache.render(template,data,partials);

			deferred.resolve(r);
		}).catch(function(){
			log.debug('template at '+templatePath+' not found.');
			if(data){
				log.debug('responding plain object');
				deferred.resolve(data);
			}else{
				log.debug('not data from module found')
				deferred.reject();
			}
		})
	}

	try{
		var modulePath = require.resolve(appPath);
		log.debug('module path',modulePath);
		var module = require(modulePath);

		var renderMethod = function(data){
			data = data || {}
			var renderPromise = module.render(data,zetan);

			if(!renderPromise || !renderPromise.then){
				log.debug('module.render does not return a promise');
				throw 'error';
			}else{
				renderPromise.then(respondTemplate);
			}
		}
		
		if(module.middleware){
			log.debug('module.middleware method found');
			module.middleware(options.req,options.res,function(data){
				renderMethod(data);
			});
		}else if(module.render){
			log.debug('module.middleware method not found');
			log.debug('module.render method found');
			renderMethod();
		}else{
			deferred.reject()
		}

	}catch(e){
		log.debug('error loading module. loading template ...');
		respondTemplate();
	}

	return deferred.promise;
}


exports.loadTemplate = function(){

}

exports.resolve = function(appName,options){
	options = options || {};
	
 	var root = path.dirname(require.main.filename);
	var baseDir = options.baseDir || '';

	return path.resolve(root,baseDir,appName);
}