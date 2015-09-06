var defaultOptions = {
	host:'http://localhost:5678'
}

var ZetanClient = function(config){
	this.config = _.defaults(config||{},defaultOptions);
}

var zetan = new ZetanClient();

if(typeof window != 'undefined'){ window.zetan = zetan; window.ZetanClient = ZetanClient; }
if(module && module.exports){ module.exports = { client:zetan, ZetanClient:ZetanClient } }