# Zeta Negroni: My greatest hits (In progress)

## App Loader

Just plug the middleware

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

An app is a directory inside the "apps" directory

```sh
http://localhost:5678/
# will load the app in the apps/index directory
```

- app.js
- apps
	- index
		- index.js
		- template.html

apps/index.js has to exports render method, middleware method or both

```js
// apps/index/index.js
var q = require('q');

// data is a standar data setted by zetam
// the promise reponse will be render with the template.html if this exists, if not it just repond the object as plain json

exports.render = function(data){
	var deferred = q.defer();
	deferred.resolve({a:'hola'});
	return deferred.promise;
}

// if middleware method it's used to set data to be passed to render method

exports.render = function(req,res,render){
	var data = {
		text:'this is passed to render method',
		params:req.query
	}
	render(data);
}

```

template.html file is a Mustache template. Zetan 




## Browser

Zetan client for browserify
```js
var zetan = require('zetan/browser');
```
Or you can use the preconfigured api client including the script from:

```html
<script src="http://localhost:5678/api/v1/client.js"></script>
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