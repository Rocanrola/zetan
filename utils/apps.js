var q = require('q');
var path = require('path');
var mustache = require('mustache');
var fs = require('fs');
var log = require('../utils/log');
var zetan = require('../');
var readFile = require('fs-readfile-promise');
var browserify = require('browserify');

var less = require('less');
var postcss = require('postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');

exports.loadClient = function(appName,options){
	var deferred = q.defer();
	var appPath = this.resolve(appName,options);
	var scriptPath = path.resolve(appPath,options.clientSriptDefaultFileName);

	log.debug('scriptPath',scriptPath);

	if(fs.existsSync(scriptPath)){
		var b = browserify();
		b.add(scriptPath);

		b.bundle(function(err,buffer){
			deferred.resolve(buffer.toString());
		})
	}else{
		log.debug(appName,'app client file not found')
		deferred.reject();
	}


	return deferred.promise;
}

exports.loadStylesheet = function(appName,options){

	var ps = [autoprefixer];
	
	if(options.minifyCSS){
		ps.push(cssnano());
	}

	var deferred = q.defer();

	var appPath = this.resolve(appName,options);
	var stylesheetPath = path.resolve(appPath,options.stylesheetDefaultFileName);
	var lessOptions = {
		filename:stylesheetPath
	}

	log.debug('stylesheetPath',stylesheetPath);

	if(fs.existsSync(stylesheetPath)){
		readFile(stylesheetPath).then(function(lessCode){
			less.render(lessCode.toString(),lessOptions)
				.then(function(output){
					return postcss(ps).process(output.css)
				})
				.then(function(procesed){
					deferred.resolve(procesed.css);
				})
				.catch(function(err){
					log.debug(err);
					deferred.reject(err);
				});
		})
	}else{
		log.debug(appName,'app stylesheet file not found')
		deferred.reject();
	}


	return deferred.promise;
}

exports.loadTemplate = function(appName,options){
	var appPath = this.resolve(appName,options);
	var templatePath = path.resolve(appPath,options.templatesDefaultFileName);
	
	log.debug('resolved template location:',templatePath);
	return readFile(templatePath).then(function(tpl){
		log.debug('template '+templatePath+' found ..');
		return tpl.toString();
	});
}

exports.render = function(template,data,partials,options,appName){
	template = options.templatesPrefix + template.toString();
	data = data || {};
	partials = partials || {};
	
	var appPath = this.resolve(appName,options);
	
	data.partial = function(){
		return function(val, render) {
			var partialPath = path.resolve(appPath,render(val));
			if(fs.existsSync(partialPath)){
		    	return fs.readFileSync(partialPath).toString();
			}else{
				return '';
			}
		}
	};

	var rendered = mustache.render(template,data,partials);
	return rendered;
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
			log.debug('middleware loaded');
			render(middData,zetan).then(function(renderData){
				log.debug('render method loaded');
				// add extra data
				renderData.appName = appName;

				that.loadTemplate(appName,options).then(function(tpl){
					log.debug('template loaded');
					var res = that.render(tpl,renderData,{},options,appName);
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