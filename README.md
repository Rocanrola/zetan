# Zeta Negroni: My greatest hits (In progress)


## App Loader

just plug the middleware

```js
var express = require('express');
var app = express();
var zetan = require('zetan');
var port = 5678;

app.use(zetan());

app.listen(port,function () {
	// c global object is a tracer logger
	c.log('api running on http://localhost:' + port);
});
```

an app is a directory inside the "apps" directory

```sh
http://localhost:5678/
# will load the app in the apps/index directory

http://localhost:5678/friends
# will load the app in the apps/friends directory
```

- app.js
- apps
	- index
		- index.js
		- template.html
	- friends
		- index.js
		- template.html
	- aboutus
		- template.html

apps have to export a "render" method, a "middleware" method or both.

```js
// File: apps/index/index.js

var q = require('q');

// first param is data setted by zetan
// the promise reponse will be render in the "template.html" if this exists
// if not it just repond the object as plain json

exports.render = function(data,zetan){
	// data.req and data.res is passed 

	var deferred = q.defer();
	deferred.resolve({a:'hola'});
	return deferred.promise;
}

// if middleware method exists it's used to set data to be passed to render method

exports.middleware = function(req,res,render){
	var data = {
		text:'this is passed to the render method',
		params:req.query
	}
	render(data);
}

```

### template.html

template.html file is a Mustache template. 
It receive data sent by the render method. 
It used triple curly braces notation: {{{var}}}

if template exists alone inside the app, zetan will return the static html as response.

#### partial loader

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">	
</head>
<body>
	<!-- partial function can be used within templates -->
	{{{#partial}}}partials/header.html{{{/partial}}}
</body>
</html>

```

## C logger

```js
// c global object added by zetan
c.log('use this instead console.log');
```

## API

in order to create an API resource create a directory inside an api directory.

```js
// File: api/user/index.js

var q = require('q');
var db = require('db');

exports.alias = {
	me:{
		get:function(data){
			// receive data formatted by zetan 
			// it can be overriten using a middleware method

			// it has to return a promise

			return db.find('users',{id:data.auth.id});
		}
	}
}

exports.get = function(data){
	if(data.id){
		return db.find('users',{ id:data.id });
	}else{
		// when is not and "id" zetan has an automatic pagination behaviour
		// the promise has to return an array
		return db.find('users');
	}
}

// override default zetan behaviour including pagination
// exports.middleware = function(req,res,method){
// 	method({
// 		... data to be passed to method or alias
// 	})
// }

```

## Static Files

just create a "public" directory.

## Browser

zetan client for browserify
```js
var zetan = require('zetan/browser');
```
or you can use the preconfigured api client including the script from:

```html
<script src="http://localhost:5678/api/v1/client.js"></script>
```

# Helpers

helpers are attached to "req" object, "zetan" object and can be loaded as modules

from any module:

```js
var emailHelper = require('zetan/helpers/email');
emailHelper.send({...})
```

from an app

```js
exports.render = function(data,zetan){
	zetan.helpers.email.send({...})
}
```

or

```js
exports.middleware = function(req,res,render){
	req.zetan.helpers.email.send({...})
	// or
	req.helpers.email.send({...})
}
```



## Email

### Mandrill

```js
var mandrilAdapter = require('zetan/adapters/mandrill');
var emailHelper = require('zetan/helpers/email');

emailHelper.default(mandrilAdapter({
	apiKey:'o-Opoeml5Jl62sKlr8dxsg'
}));

emailHelper.send({
		"html": '<strong>Hi</strong>',
		"from_name":"Marcelo Zapaia",
	    "subject": "Hi there",
	    "from_email": "noreply@zapaia.com",
	    "to": [{  "email": "friend@email.com" }]
	}).then(function(response){
		c.log('email sent');
	}).catch(function(){
		c.log(':(');
	})
```



## Gulp

### Browserify

```js
// gulpfile.js

var gulpHelper = require('zetan/helpers/gulp');

gulp.task('js',function(){
	return gulpHelper.browserify({ 
		watch:true, // use watchify
		src:'./src/index.js', // it can be a glob pattern like './src/*.js'
		cb:function(bundle){
			bundle.pipe(gulp.dest('./js/dist'))
		}
	})
});
```

### LESS
```js
// process files those names end with "*.public.less"
// in the "apps" directory and place these in "public/dist/apps/{APPNAME}/{FILENAME}.css"
gulp.task('css',gulpHelper.less());
```

### Nodemon
```js
// run index.js with nodemon and add an "--dev" argument
gulp.task('serve',gulpHelper.serve());
```