(function(document,window,undefined){

	var RecursionStack = function(config){
		var function_paks = [],
				dormant_contexts = [],
				contexts = [],
				priority_contexts = [],
				CLOSURE_ID = '',
				last_run_was_priority = false;

		var genUid = function(){
			var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
		  var d0 = Math.random()*0xffffffff|0, d1 = Math.random()*0xffffffff|0;
		  var d2 = Math.random()*0xffffffff|0, d3 = Math.random()*0xffffffff|0;

		  return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
			lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
			lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
			lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
		};
		CLOSURE_ID = genUid();

		window.addEventListener('message',function theEvent(event) {
			var hctx,cr,currentTime;
			if(event.data !== CLOSURE_ID || event.source !== window){return;}
			event.stopPropagation();

			if(typeof priority_contexts === 'object' && priority_contexts.length > 0 && last_run_was_priority === false){
			 last_run_was_priority = true;
			 hctx = priority_contexts[0];
		 	}else{hctx = contexts[0]; last_run_was_priority = false;}
			cr = hctx.currently_running;
			if(cr.is_dormant || cr.is_paused){contexts.shift();__push(hctx);return;}

    	currentTime = new Date().getTime();
    	if(cr.last_run_time === null || currentTime >= cr.last_run_time ){
      	hctx.currently_running.last_run_time = new Date().getTime()+cr.delay;
      	setTimeout(function () { //remove setTimeout
					function_paks[cr.callPackageName][cr.callFunctionName](hctx);
				}, cr.delay);
    	}
			//Check if another step exists, check if the whole sequence should be repeated,
			//Check if whole sequence should be repeated from new start index, (likely skip init step)
			//Decide if we reset, make_dormant, pause or dropascompleted
	    contexts.shift();
	    __push(hctx);
		});

		notify = function(){window.postMessage(CLOSURE_ID,'*');};

		__push = function(ctx){
			if(ctx.is_dormant){dormant_contexts.push(ctx);notify();return;}
			if(ctx.is_priority){priority_contexts.push(ctx);notify();return;}
			contexts.push(ctx);
			notify();
		};

		__loadFunctionPaks = function(paks){
			if(typeof paks !== 'object'){return;}
			for(var key in paks){
				if (paks.hasOwnProperty(key)){
					var pak = paks[key];
					if(typeof function_paks[pak.name] !== 'object'){
						//Just add the pak
						function_paks[pak.name] = pak;
					}
					if(typeof function_paks[pak.name] === 'object' ){
						//Merge any new functions within pak
						for(var func in pak){
							if(func !== 'name' && typeof function_paks[pak.name][func] === 'undefined' && pak.hasOwnProperty(func)){
								function_paks[pak.name][func] = pak[func];
							}
						}
					}
				}
			}
		};
		__validateCallDef = function(call_defs){
			return true;
		};

		__buildContext = function(ctx,op_defs){
				var call_controls = {
					currently_running:{
						/*Non-configurable, must be supplied or generated */
						callPackageName:null,
						callFunctionName:null,
						cycleCount:null,
						is_dormant:false,
						is_paused:false,
						last_run_time:null,
						/*default configuration supplied at closure execution will automatically fill*/
						delay:null,
						maxCycle:null,
						minCycle:null,
						params:null //Mock data excetera
					},
					call_defs_index:-1,
					call_defs:[],
					is_priority:false,
					switchCurrentRunning: function(idx){
						var cd = call_controls.call_defs;
						call_controls.currently_running.lastRunTime = new Date().getTime();
						call_controls.currently_running.callPackageName = cd[idx].pak_name;
						call_controls.currently_running.callFunctionName = cd[idx].func_name;
						call_controls.currently_running.cycleCount = 0;
						call_controls.currently_running.is_dormant = false;
						call_controls.currently_running.is_paused = false;
						if(typeof cd[idx].delay !== 'undefined'){
							call_controls.currently_running.delay = cd[idx].delay;
						}else{call_controls.currently_running.delay = config.default_delay;}
						if(typeof cd[idx].max_cycle !== 'undefined'){
							call_controls.currently_running.maxCycle = cd[idx].max_cycle;
						}else{call_controls.currently_running.maxCycle = config.default_max_cycle;}
						if(typeof cd[idx].minCycle !== 'undefined'){
							call_controls.currently_running.minCycle = cd[idx].min_cycle;
						}else{call_controls.currently_running.minCycle = config.default_min_cycle;}
						if(typeof cd[idx].params !== 'undefined'){
							call_controls.currently_running.params = cd[idx].params;
						}else{call_controls.currently_running.params = null;}
					},
					next:function(){
						call_controls.call_defs_index++;
						call_controls.switchCurrentRunning(call_controls.call_defs_index);
					},
					goDormant:function(){/*Do not run, and move to ignored array until external event calls excite*/},
					excite:function(){/*Move back into live array, run on next cycle, if in live array make priority*/},
					//This feels like AI to me, when one of the leaves has answer or a good guess, move to priority
					pause:function(){/*Do not run, push into live array, ignore until pause state changes to false*/},
					restart:function(){/*Starts back at the very first call*/},
					addCallDef:function(def){if(__validateCallDef(def)){call_controls.call_defs.push(def);}},
					a_value:null
				};
				for(var def_key in op_defs){
					if(op_defs.hasOwnProperty(def_key)){
						call_controls.addCallDef(op_defs[def_key]);
					}
				}
				call_controls.next();
				return {
					external_api:{
						target_obj:ctx,
						pause:call_controls.pause,
						goDormant:call_controls.goDormant,
						excite:call_controls.excite,
						//restart:call_controls.restart,
						addCallDef:call_controls.addCallDef,
						notify:call_controls.notify,
						is_priority:call_controls.is_priority
					},
					internal_api:{
						target_obj:ctx,
						pause:call_controls.pause,
						goDormant:call_controls.goDormant,
						excite:call_controls.excite,
						restart:call_controls.restart,
						notify:call_controls.notify,
						is_priority:call_controls.is_priority,
						currently_running:call_controls.currently_running,
						next:call_controls.next
					}
				};

		};

	return {
		push: function(ctx,op_defs,paks){
			__loadFunctionPaks(paks);
			var new_ctx = __buildContext(ctx,op_defs);
			__push(new_ctx.internal_api);
			return new_ctx.external_api;
		},
		notify: function(){
			notify();
		}
	};
};
window.loopStack = RecursionStack({default_delay:30,default_min_cycle:0,default_max_cycle:0});
})(document,window);


/**************
Wrap in physics class / Physics Pak
***********************/
function simConstantMomentum(childel,boundel,delta){
	//delta is in rem units
	var initialRightMomentum = (delta/3);
	var initialBottomMomentum = (delta/3)*2;
	boundel.append(childel);
	var childHeight = parseFloat(childel.css('height').replace(/px|rem|em/gi,''));

	var childWidth = parseFloat(childel.css('width').replace(/px|rem|em/gi,''));
	var parentBottomBound = parseFloat(boundel.css('height').replace(/px|rem|em/gi,''));
	var parentRightBound = parseFloat(boundel.css('width').replace(/px|rem|em/gi,''));
	var currentTop,currentBottom,currentLeft,currentRight,topChange,leftChange;
	return function(){
		var currentTop = parseFloat(childel.css('top').replace(/px|rem|em/gi,''));
		var currentBottom = currentTop+childHeight;

		var currentLeft = parseFloat(childel.css('left').replace(/px|rem|em/gi,''));
		var currentRight = currentLeft+childWidth;

		if(currentBottom>=parentBottomBound){
			initialBottomMomentum = -Math.abs(initialBottomMomentum);
		}
		if(currentRight>=parentRightBound){
			initialRightMomentum = -Math.abs(initialRightMomentum);
		}
		if(2>=currentTop){
			initialBottomMomentum = Math.abs(initialBottomMomentum);
		}
		if(2>=currentLeft){
			initialRightMomentum = Math.abs(initialRightMomentum);
		}
		//console.log(currentTop);
		var topChange = ((currentTop/16)+initialBottomMomentum);
		var leftChange = ((currentLeft/16)+initialRightMomentum);

		childel.css({backgroundColor: 'blue'});
		childel.css({top: topChange+'rem', left: leftChange+'rem'});
		return true;
	};
}

var circleTemplate = $( "<div/>", {
    html: "^",
    "class": "circle",
});

function newCircle(x,y){
	var a = $( "<div/>", {
		html: "^",
		"class": "circle",
		"style": "{top:x,left:y}",
	});
	a.uniqueId();
	return a;
}

var boundingDiv = $( "#bounding-div0" );
var childDiv = $( "#child-div" );
var childDiv0 = childDiv.clone();
boundingDiv.append(childDiv);

//This object is a function
var simMomentum = simConstantMomentum(childDiv,boundingDiv,'.125');
loopStack.push(
	{	gravity:"",	movementRate:"", locationId:""	},
	[{pak_name:'simMomentumPack',func_name:'simMomentum',delay:30,max_cycle:0,min_cycle:0}],
	[{name:'simMomentumPack',simMomentum:simMomentum}]
);

childDiv0.attr('id','child-div0');
boundingDiv.append(childDiv0);
var simMomentum0 = simConstantMomentum(childDiv0,boundingDiv,'.125');
//var cycleMomentum0 = new class_nbCycle(simMomentum0,10,15,5000000);
loopStack.push(
	{	gravity:"",	movementRate:"", locationId:""	},
	[{pak_name:'simMomentumPack',func_name:'simMomentum0',delay:10,max_cycle:0,min_cycle:0}],
	[{name:'simMomentumPack',simMomentum0:simMomentum0}]
);

//Lets try it with icons
var boundingDiv = $( "#bounding-div0" );
var childIcon2 = $( "#child-icon2" );
var childIcon3 = childIcon2.clone();
childIcon2.addClass('icon-github-squared');
boundingDiv.append(childIcon2);
var simMomentum2 = simConstantMomentum(childIcon2,boundingDiv,'.125');
loopStack.push(
	{	gravity:"",	movementRate:"", locationId:""	},
	[{pak_name:'simMomentumPack',func_name:'simMomentum2',delay:7,max_cycle:0,min_cycle:0}],
	[{name:'simMomentumPack',simMomentum2:simMomentum2}]
);

childIcon3.attr('id','child-icon3');
childIcon3.addClass('icon-html5');
boundingDiv.append(childDiv0);
var simMomentum3 = simConstantMomentum(childIcon3,boundingDiv,'.125');
//var cycleMomentum3 = new class_nbCycle(simMomentum3,20,25,5000000);
loopStack.push(
	{	gravity:"",	movementRate:"", locationId:""	},
	[{pak_name:'simMomentumPack',func_name:'simMomentum3',delay:20,max_cycle:0,min_cycle:0}],
	[{name:'simMomentumPack',simMomentum3:simMomentum3}]
);
