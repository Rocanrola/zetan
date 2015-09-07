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
	console.log('api running on http://localhost:' + port);
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

## Static Files

just create a "public" directory.

## Browser

Zetan client for browserify
```js
var zetan = require('zetan/browser');
```
Or you can use the preconfigured api client including the script from:

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
		console.log('email sent');
	}).catch(function(){
		console.log(':(');
	})
```



## Gulp

### Browserify
// gulpfile.js

var gulpHelper = require('zetan/helpers/gulp');

```js
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