(function(document,window,undefined){
  var results = document.querySelector("#results");
  var runExample = document.querySelector("#runexample");
  var results1 = results.querySelector("#results1");
  var results2 = results.querySelector("#results2");
  var results3 = results.querySelector("#results3");
  //This is just for demonstration, one can make this more fool proof
  //The downfall of this is it is not safe for all programmers, it's js!
  //As such it is breakable, but could be made safer.
  var fBucket = [];
  fBucket.doubleOp = {f:function(a){return a+a;}};

  var hailmary = (function(){
    var rRefs = [], rStack = [];
    var notify = function(){
      /***********************************************************
       * The method passed to timeout here should be the only method
       * that ever shifts, or removes an array element from rStack
       * this timeout should never be used recursively, and should
       * only ever be called by an independent path
       ************************************************************/

    };
    var setRef = function(externalName,internalName){
      rRefs[internalName] = fBucket[externalName];
    };
    var __notify = function(){
      //althought the notify function called from here
      //has a timeout that may still be running, when
      //notify returns, this function can cleanly returns
      //and be cleaned up by GC, the stack or execution
      //thread for this function never persists because
      //it was never the owner of any references, other
      //than the function prototype that was never passed
      //anywhere, there is zero context or closure that
      //need to be persisted, this is the break point
      //In theory anyways, we will test this
      notify();

      return;
    };
    var addToStack = function(){
      if(rRefs[this.inName] === undefined ){setRef(this.exName,this.inName);}
      rStack.push(this);
      __notify();
    };
    var __register = function(defObj){addToStack.bind(defObj).addToStack();};
    return {
      push:function(defObj){
        __register(defObj);
      },
      notify:__notify

    };
  })();

  runExample.addEventListener('click', function(){
    cp1.edit('cp-async','javascript');
  });
})(document,window);
