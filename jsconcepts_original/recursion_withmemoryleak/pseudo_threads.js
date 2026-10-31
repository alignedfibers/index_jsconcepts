/**************
Wrap in physics class 
***********************/
function simConstantMomentum(childel,boundel,delta){
	//assert: all arguments are present, delta is in EM units, display, size, position, zIndex,
	//console.log('generating momentum function');
	var initialRightMomentum = (delta/3);
	var initialBottomMomentum = (delta/3)*2;
	boundel.append(childel);
	var childHeight = parseFloat(childel.css('height').replace(/px|rem|em/gi,''));
	//condition cases for boundries will be tested to decide
	//the direction the new position will be from current position
	var childWidth = parseFloat(childel.css('width').replace(/px|rem|em/gi,''));
	var parentBottomBound = parseFloat(boundel.css('height').replace(/px|rem|em/gi,''));
	var parentRightBound = parseFloat(boundel.css('width').replace(/px|rem|em/gi,''));
	var currentTop,currentBottom,currentLeft,currentRight,initialBottomMomentum,initialRightMomentum,topChange,leftChange;
	return function(){
		var currentTop = parseFloat(childel.css('top').replace(/px|rem|em/gi,''));
		//var theHeight = parseFloat(childel.css('height').replace(/px|rem|em/gi,''));
		var currentBottom = currentTop+childHeight;
		
		var currentLeft = parseFloat(childel.css('left').replace(/px|rem|em/gi,''));
		//var theWidth = parseFloat(childel.css('width').replace(/px|rem|em/gi,''));
		var currentRight = currentLeft+childWidth;
		
		//var currentBottomBound = parseFloat(boundel.css('height').replace(/px|rem|em/gi,''));
		//var currentRightBound = parseFloat(boundel.css('width').replace(/px|rem|em/gi,''));
		
		//console.log(parseFloat(theHeight)+parseFloat(currentTop));
		//console.log(currentBottomBound);
		
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
		
		var topChange = ((currentTop/16)+initialBottomMomentum);
		var leftChange = ((currentLeft/16)+initialRightMomentum);
		
		childel.css({backgroundColor: 'blue'});
		childel.css({top: topChange+'rem', left: leftChange+'rem'});
		return true;
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

var class_nbCycle = function(fn,timeout,minticks,maxcycles){
	//assert minticks >= timeout, assert a function exists
	//console.log('instantiating class_nbCycle');
	var flagGracefulStop = false;
	var cycleCount = 0;
	var curClock = (new Date).getTime();
	var lastClock = (curClock - minticks);
	//done: decouple, todo: prototype cycle()
	var whatsMemory = 0;
	
	(function cycle(chainCount){

		//chainCount = chainCount+1;
		//console.log("uneeded scope access goes back "+chainCount+" times, thus memory leak.");
		//console.log('enter auto inovoked anonymous cycle');*
		
		if(lastClock < curClock - minticks){
			/*wait before run*/
		}
		
		if(fn()){
			//console.log('momentum succesfully returned control');
			cycleCount++;
			lastclock = (new Date).getTime();
		}else{
			//console.log('momentum did not work');
			return false;
		}
		if(cycleCount >= maxcycles){
			//console.log('maximum cycles reached');
			return true;
		}
		if(flagGracefulStop == true){
			//console.log('graceful stop flag caught');
			return false;
		}
		//console.log('just before setTimeout to cycle again');
		setTimeout(cycle, timeout);
		//console.log('after setTimeout for cycle');
		return;
	})(0);
	/***********
	Set flag to break out
	before next cycle
	**************/
	var gracefulStop = function(){
		flagGracefulStop = true;
		return true; 
	}
}
var boundingDiv = $( "#bounding-div0" );
var childDiv = $( "#child-div" );
var childDiv0 = childDiv.clone();
boundingDiv.append(childDiv);

//This object is a function
var simMomentum = simConstantMomentum(childDiv,boundingDiv,'.125');

//Autoruns a custom loop, returns control before completion
var cycleMomentum1 = new class_nbCycle(simMomentum,30,35,5000000); 

childDiv0.attr('id','child-div0');
boundingDiv.append(childDiv0);
var simMomentum0 = simConstantMomentum(childDiv0,boundingDiv,'.125');
var cycleMomentum0 = new class_nbCycle(simMomentum0,10,15,5000000);


//Lets try it with icons
var boundingDiv = $( "#bounding-div0" );
var childIcon2 = $( "#child-icon2" );
var childIcon3 = childIcon2.clone();
childIcon2.addClass('icon-github-squared');
boundingDiv.append(childIcon2);

var simMomentum2 = simConstantMomentum(childIcon2,boundingDiv,'.125');
var cycleMomentum2 = new class_nbCycle(simMomentum2,2,7,5000000); 

childIcon3.attr('id','child-icon3');
childIcon3.addClass('icon-html5');
boundingDiv.append(childDiv0);
var simMomentum3 = simConstantMomentum(childIcon3,boundingDiv,'.125');
var cycleMomentum3 = new class_nbCycle(simMomentum3,20,25,5000000);

//    var link = document.querySelector('link[rel="import"]');
//    var content = link.import;

    // Grab DOM from warning.html's document.
//    var el = $(content).find('.warning');
//	var el2 = $( "#hot" );

//    el2.append(el);
