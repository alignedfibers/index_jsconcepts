(function(document,window,undefined){
  var results = document.querySelector("#results");
  var runLocalVarExample = document.querySelector("#runlocalvarexample");
  var runParentVarExample = document.querySelector("#runparentvarexample");
  var runGlobalExposeExample = document.querySelector("#runglobalexposeexample");

  runLocalVarExample.addEventListener('click', function(){
    cp1.edit('cp-localvar','javascript');
    var showLocalVar = function(){
      var greeting = "hello";
      var show = function(){
        var greeting = "welcome";
        return greeting;
      };
      results.innerHTML = "The greeting returned from show is: \n"+show();
    };
    showLocalVar();
  });
  runParentVarExample.addEventListener('click', function(){
    cp1.edit('cp-parentvar','javascript');
    var showParentVar = function(){
      var greeting = "hello";
      var show = function(){
        return greeting;
      };
      results.innerHTML = "The greeting returned from show is: \n"+show();
    };
    showParentVar();
  });
  runGlobalExposeExample.addEventListener('click', function(){
  var exposeChildFunction = function(){
    cp1.edit('cp-exposedfunction','javascript');
    var greeting = "hello";
    window.showLexicalAfterFunReturn = function(){
      return greeting;
    };
    return;
  };
  exposeChildFunction();
  results.innerHTML = "The greeting returned"+
      " from showAfterReturn is: \n"+
      showLexicalAfterFunReturn();
  });
})(document,window);
