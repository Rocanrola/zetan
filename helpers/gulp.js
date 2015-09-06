var glob = require('glob');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var log = require('../utils/log');

exports.browserify = function(config) {

	// config
	// watch:Boolean
	// src:String||Array(Glob Path)

    if(!config){
        log.error('gulp.browserify: config object required');
        return;
    }

    if(!config.src){
        log.error('gulp.browserify: "src" attribute required');
        return;
    }
	if(!config.cb){
		log.error('gulp.browserify: "cb" function required');
		return;
	}


    var ws = [];
    var files = glob.sync(config.src);

    log.debug('test')

    files.forEach(function(file){
        var w = config.watch ? watchify(browserify({ entries: [file] })): browserify({ entries: [file] });
        
        var build = function(){
            console.log(file, ' rebuilt');
            config.cb(w.bundle().pipe(source(file)))
        }

        w.on('update',build);
        build();
    });
}