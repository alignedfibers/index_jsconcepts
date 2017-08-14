# js-recursionwithevents-practice
A javascript recursive job runner and prioritization queue.

(This is more than a queue, the jobs in the call def here,
will be able to organize and build their own call chains within the
same definition from which the job was called, each call def works directly 
with only that def, and all calls are made synchronously, but can use recursion
and state as a feedback loop. Multiple defs can run asynchronously to interleave 
processing, it is intended they will message eachother or subscribe to interesting 
events on the fly. This is ultimately a synchronouse recursion loop, that allows 
multiple synchrounous loops to complete asynchonously, and infinitely. It gives the 
method or function access to the internals of context and calldef to allow it the 
opportunity to decide what happens next, or just set a value in the context and forward 
the processing to a decion maker, could use different types of aware functions maybe:
decisionMakers, taskcompleters, helpers that are not to be called but rather organized,
this is a step to decentralized decision making)

This que is intended to allow the developer to interleaf and run recursively in any order, a subset of small 
reusable functions where order and subset are defined by the call defs passed. Recursion can be set on the
whole sequence and on individual functions steps within the sequence. Functions are packaged together in a 
"functionPak" and can be added at anytime including initialization of the recursionStack.

Current Features as of: 3/16/17
--Add Function Paks
--Push a single context, and call a call def with recursion limits set
--Push muliple context / call def pairs with seperate push calls
--Configure recursionStack on initialization
--Max cycle limits currently not being utilized.

Todo:
Add pause, and other features including handling max-cycle.

/*Series of operation/steps are passed and started like so:*/


	buildRunner = RecursionStack(config);

	buildRunner.push(
  /*The context that is stored and referenced at each step*/

	{	gravity:"",	movementRate:"", locationId:""	},

  /*The list of operations, or steps to be completed. max_cycle:0 is infinite
    the step or function being called will be able to set a complete flag to
    move to the next step*/

	[{pak_name:'PackageName',func_name:'FunctionName',delay:10,max_cycle:0,min_cycle:0}],

  /*Option to add functions directly, soon to be avail from config, and dynamic load.*/


	[{name:'PackageName',FunctionName:function(ctx){ctx.}}]
);
