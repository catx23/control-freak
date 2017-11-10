require([
	'dcl/dcl',
	'xide/mixins/EventedMixin',
	"dojo/node!lodash",
	"dojo/node!commander",
	"require",
	"dojo/Deferred"
], function (dcl,EventedMixin,_,commander,require,Deferred) {
	global['_'] = _;
	global['commander'] = commander;
	var Module = dcl(EventedMixin.dcl,{
		init:function(){
		}
	});
	var instance = new Module();
	try {
		require(['nxappmain/main_server'], function (ctx) {

		});

	}catch(e){
		console.error('error main ',e);
	}

	return instance;
});
