(function(document,window,undefined){
	//Allows registration and recursion of static methods in the order as
	//defined in the context and configuration object passed to the push
	//method. config/context provides generator yeilding strings that match
	//the keys/names under which functions have been registered. Configuration
	//also provides any specific values or variables that will require
	//persistence between each itteration. If nothing is provided within
	//config/context, then a new generator will be created from the functions
	//as keyed in the functions array passed, if a function already exists under
	//that key, it will be ignored, if the function array has only indexes such that it
	//is not providing a usable string named key, a random key will be generated.
	//recursionControlValues specifying max/mincycles, delay, isPriority will be
	//set as expressed default within RecursiveStackConfig literal passed to RecursionStack
	//isPriority gaurantees no more than one other context will be able to process
	//a step before it on each itteration(avoiding race condition). RecursionStack is
	//a factory. You can get a RecursionStack like "RecursionStack({defaultConfig})"
	//default config can pre-register functions so they do not require specification
	//when the config/context that use them are pushed. I cannot gaurantee that
	//strings as defined within the generators created by you will be correct, and
	//will not be able to throw an error until it is run. If you specify an array
	//list of blank functions with key names of already registered functions, a
	//generator will be created for you as well. max-cycles:0, is infinite loop
	//min-cycles:0 will always run at least once, these are intended to be immutable
	//if max-cycles is reached or next() returns error, null,undefined or anything
	//other than a string with at least three characters, next will not be called
	//again and context/config will not be placed back on the stack. At this time
	//I am shifting the stack, such that a slight performance benefit may be avail
	//by keeping track of the last index processed, then only manipulating the
	//array when a required splice to remove the context occures

	var RecursionStack = (function(){

	var registeredFunctions = [],contexts = [],priorityContexts = [];
	var RECURSION_STACK_MESSAGE_NAME = 'FROMINSTANCEID';
	window.addEventListener('message',function theEvent(event) {
	  var holdcontext = contexts[0];
	  if ((event.source == window) && (event.data == RECURSION_STACK_MESSAGE_NAME)) {
	    event.stopPropagation();
	    var expectedLastRunTime = holdcontext.lastRunTime;
	    var currentTime = new Date().getTime();
	    if(expectedLastRunTime === null || currentTime >= expectedLastRunTime ){
	      holdcontext.lastdelay =  holdcontext.nextdelay;
	      holdcontext.lastRunTime = new Date().getTime()+holdcontext.lastdelay;
	      setTimeout(function () {
	        //allow for function to vary the delay per recursion
	        registeredFunctions[holdcontext.runNext](holdcontext);
	      }, holdcontext.nextdelay);
	    }
	    contexts.shift();
	    __push(holdcontext);
	  }
	});

	notify = function(){
		window.postMessage(RECURSION_STACK_MESSAGE_NAME,'*');
		//__runNextInQue();
	};

	__push = function(ctx){
		ctx.pushedTime = new Date().getTime();
		if(ctx.isPriority){
			priorityContexts.push(ctx);
		}else{
			contexts.push(ctx);
		}
		notify();
	};
	__register = function(func,name){
		if(typeof registeredFunctions[name] !== 'function'){
			registeredFunctions[name] = func;
		}
	};
	__buildContext = function(a){
		var ctx = a.context;
		if(typeof a.initialRunNext === 'string'){ctx.runNext = a.initialRunNext;}
		if(typeof ctx.runNext !== 'string'){return false;}
		if(typeof registeredFunctions[ctx.runNext] !== 'function' ){return false;}
		if(typeof a.initialDelay !== 'undefined' && (typeof a.initialDelay !== 'number' || a.initialDelay % 1 !== 0)){return false;}
		if(typeof a.initialDelay !== 'undefined'){ctx.nextdelay = Math.abs(a.initialDelay);}
		if(typeof ctx.nextdelay === 'undefined'){ctx.nextdelay = 0;}
		if(typeof a.maxcyc === 'number'){ctx.maxcyc = a.maxcyc;}
		if(typeof a.mincyc === 'number'){ctx.mincyc = a.mincyc;}
		if(typeof a.isPriority !== 'undefined' && typeof a.isPriority === 'boolean'){ctx.isPriority = isPriority; }
		if(typeof ctx.maxcyc !== 'number'){ctx.maxcyc = 0;}
		if(typeof ctx.mincyc !== 'number'){ctx.mincyc = 0;}
		if(typeof ctx.isPriority !== 'boolean'){ctx.isPriority = false;}
		ctx.lastdelay = 0;
		ctx.lastRunTime = null;
		return ctx;
	};

	return {
		push: function(a){
			var ctx = a.context;
			if(typeof a.registerFuncAsName === 'string' && typeof a.func === 'function'){__register(a.func,a.registerFuncAsName);}
			ctx = __buildContext(a);
			if(ctx){__push(ctx);return true;}
			return ctx;
		},
		notify: function(){
			notify();
		}
	};
})(); //for now
window.loopStack = RecursionStack;
})(document,window);












/**************
Wrap in physics class
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

/*********************
Remove style and props from code
Build engine to generate new element
by staticComponentId config, decorate incode
**************/

var circleTemplate = $( "<div/>", {
    html: "^",
    "class": "circle",
});

function newCircle(x,y){
	//Assert that position is relative in CSS
	//The element returned from this function has
	// not been given a parent yet
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

//Autoruns a custom loop, returns control before completion
//var cycleMomentum1 = new class_nbCycle(simMomentum,30,35,5000000);
loopStack.push({
		context:{
			gravity:"",
			movementRate:"",
			locationId:"" //calculated points (circle, triangle, square) for interference lookup
		},
		func: simMomentum,//function(ctx){console.dir(ctx);},
		registerFuncAsName: 'simMomentum',
		initialRunNext: 'simMomentum',
		initialDelay:30
});

childDiv0.attr('id','child-div0');
boundingDiv.append(childDiv0);
var simMomentum0 = simConstantMomentum(childDiv0,boundingDiv,'.125');
//var cycleMomentum0 = new class_nbCycle(simMomentum0,10,15,5000000);
loopStack.push({
		context:{
			gravity:"",
			movementRate:"",
			locationId:"" //calculated points (circle, triangle, square) for interference lookup
		},
		func: simMomentum0,//function(ctx){console.dir(ctx);},
		registerFuncAsName: 'simMomentum0',
		initialRunNext: 'simMomentum0',
		initialDelay:10
});

//Lets try it with icons
var boundingDiv = $( "#bounding-div0" );
var childIcon2 = $( "#child-icon2" );
var childIcon3 = childIcon2.clone();
childIcon2.addClass('icon-github-squared');
boundingDiv.append(childIcon2);
var simMomentum2 = simConstantMomentum(childIcon2,boundingDiv,'.125');
//var cycleMomentum2 = new class_nbCycle(simMomentum2,2,7,5000000);
loopStack.push({
		context:{
			gravity:"",
			movementRate:"",
			locationId:"" //calculated points (circle, triangle, square) for interference lookup
		},
		func: simMomentum2,//function(ctx){console.dir(ctx);},
		registerFuncAsName: 'simMomentum2',
		initialRunNext: 'simMomentum2',
		initialDelay:7
});
childIcon3.attr('id','child-icon3');
childIcon3.addClass('icon-html5');
boundingDiv.append(childDiv0);
var simMomentum3 = simConstantMomentum(childIcon3,boundingDiv,'.125');
//var cycleMomentum3 = new class_nbCycle(simMomentum3,20,25,5000000);
loopStack.push({
		context:{
			gravity:"",
			movementRate:"",
			locationId:"" //calculated points (circle, triangle, square) for interference lookup
		},
		func: simMomentum3,//function(ctx){console.dir(ctx);},
		registerFuncAsName: 'simMomentum3',
		initialRunNext: 'simMomentum3',
		initialDelay:20
});
