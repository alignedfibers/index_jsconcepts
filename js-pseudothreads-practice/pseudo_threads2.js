/**************
Wrap in physics class 
***********************/
function simConstantMomentum(childel,boundel,delta){
	//assert: all arguments are present, delta is in EM units, display, size, position, zIndex,
	var initialRightMomentum = (delta/3);
	var initialBottomMomentum = (delta/3)*2;
	boundel.append(childel);
	//condition cases for boundries will be tested to decide
	//the direction the new position will be from current position
	return function(){
		var currentTop = childel.css('top');
		var currentLeft = childel.css('left');
		childel.css('top',(currentTop+initialBottomMomentum));
		childel.css('top',(currentLeft+initialRightMomentum));
		
		/*if(0!=0){
			
		}*/
	}
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


var class_nbCycle = function(fn,timeout,minticks,maxcycles){
	//assert minticks >= timeout, assert a function exists
	var flagGracefulStop = false;
	var cycleCount = 0;
	var curClock = (new Date).getTime();
	var lastClock = (curClock - minticks);
	//done: decouple, todo: prototype cycle()
	(function cycle(){
		if(lastclock < curClock - minticks){
			/*wait before run*/
		}
		
		if(fn()){
			cycleCount++;
			lastclock = (new Date).getTime();
		}else{
			return false;
		}
		if(cycleCount >= maxcycles){
			return true;
		}
		if(flagGracefulStop == true){
			return false;
		}
		setTimeout(cycle, timeout);
	})();
	/***********
	Set flag to break out
	before next cycle
	**************/
	var gracefulStop = function(){
		flagGracefulStop = true;
		return true; 
	}
}
var boundingDiv = $( "#bounding-div" );
var childDiv = $( "#child-div" );
var simMomentum = simConstantMomentum(childDiv,boundingDiv,'.125');

var cycleMomentum = class_nbCycle(simMomentum,300,320,96);