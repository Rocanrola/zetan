var _ = require('lodash');

var gulp = require('gulp');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');
var rename = require("gulp-rename");
var plumber = require('gulp-plumber');

// browserify
var glob = require('glob');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');

// less
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

// serve
var nodemon = require("gulp-nodemon");

// zetan
var log = require('../utils/log');

var defaultOptions = {
    less:{
        glob:'./apps/**/*.public.less',
        dest:'./public/dist/css/apps',
        alsoWatch:['./less/**/*.less','./apps/**/*.less'],
        watch:true
    },
    browserify:{
        glob:'./apps/**/*.public.js',
        dest:'./public/dist/js',
        watch:true
    }
}
exports.browserify = function(options) {
    options = _.defaultsDeep(options || {}, defaultOptions.browserify);
    var files = glob.sync(options.glob);

    return function(){
        files.forEach(function(file){
            var w = options.watch ? watchify(browserify({ entries: [file] })): browserify({ entries: [file] });
            
            var build = function(){
                console.log(file, ' rebuilt');
                var stream = w.bundle().
                                pipe(source(file)).
                                pipe(gulp.dest(options.dest)).
                                pipe(livereload());

                if(options.cb){
                    options.cb(stream);
                }
            }

            w.on('update',build);
            build();
        });
    }
}

exports.less = function(options){
    options = _.defaultsDeep(options || {}, defaultOptions.less);

    var that = this;
    var watchOptions = {
        ignoreInitial:false
    }
    var watchFiles = options.alsoWatch.concat([options.glob]);

    log.debug('gulp less options',options);

    var process = function(){
        return gulp.src(options.glob)
                    .pipe(plumber({
                        errorHandler:function(e){
                            console.log(e);
                        }
                    }))
                    .pipe(less())
                    .pipe(autoprefixer("last 1 version", "> 1%", "ie 8", "ie 7"))
                    .pipe(gulp.dest(options.dest))
                    .pipe(livereload());
    }

    if(options.watch){
        return function(){
            return watch(watchFiles,watchOptions, function(){
                return process()       
            });
        }
    }else{
        return process;
    }
}

exports.build = function(options){
    var that = this;
    
    return function(){ 
        that.less({watch:false})().on('end',function(){
            that.minCss(options);
        });

        that.browserify({
            watch:false,
            cb:function(stream){
                stream.on('end',function(){
                    that.minJs(options);
                })
            }
        })();
    }
}

exports.serve = function(options){    
    return function(){
        livereload.listen();

        gulp.watch(['./apps/**/*template.html'], livereload.changed);

        nodemon({
              script: 'index',
              args: ['--dev'],
              ignore: ['public/**', '**/*public.js', 'scripts/**']
        });
    }
}

exports.minJs = function(options){
    options = _.defaultsDeep(options || {}, defaultOptions.browserify);

    return gulp.src([options.dest+'/**/*.js','!**/*.min.js'])
      .pipe(uglify({
          mangle: false
      }))
      .pipe(rename(function (path) {
          path.basename += ".min";
      }))
      .pipe(gulp.dest(options.dest));
}


exports.minCss = function(options){
    options = _.defaultsDeep(options || {}, defaultOptions.less);

    return gulp.src([options.dest+'/**/*.css','!**/*.min.css'])
      .pipe(minifyCSS({
        processImport:false
      }))
      .pipe(rename(function (path) {
          path.basename += ".min";
      }))
      .pipe(gulp.dest(options.dest));
}