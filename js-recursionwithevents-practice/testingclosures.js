/*cnt = 1;
(function test(cnt){
	alert("inside");
	this.count = cnt;
	alert(this.count);
	if(this.count < 4){
		this.count++;
		alert("anything");
		test();
	}
	
})(cnt);*/
/*emps = {"employees":[
    {"firstName":"John", "lastName":"Doe"},
    {"firstName":"Anna", "lastName":"Smith"},
    {"firstName":"Peter", "lastName":"Jones"}
]}
function alertProperty(myEmps){
	var theEmps = myEmps;
	return function(){alert(theEmps.employees[0].firstName)};
	
}
test1 = alertProperty(emps);
//this shows how to scope arguments to a function that can be passed
// and called by another function that is decoupled so you can pass any function in
// just remember that when ever you call the parent function you create a new function in memory
test1();
alert((new Date).getTime());

var class_obj_test = function(fn,myVal){
	var testProp = "my experience is ^> b4";
	(function alertTest(){
		fn();
		alert(testProp);
		alert(myVal);
	})();	
}

test2 = new class_obj_test(test1,"in scope");*/