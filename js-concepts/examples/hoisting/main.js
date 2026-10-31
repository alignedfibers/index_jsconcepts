(function(document,window,undefined){
  var results = document.querySelector("#results");
  var showUndefinedHoisted = document.querySelector("#hvu");
  var showUndeclaredCatchHoisted = document.querySelector("#hvc");
  var showBlockScopeErrHoisted = document.querySelector("#bsm");

  showUndefinedHoisted.addEventListener('click', function(){
    cp1.edit('cp-hvu','javascript');
    var a = "var1";
    var b = "var2";
    try{
      results.innerHTML = " a = "+a+"\n b = "+b+"\n c = "+c;
    }catch(err){
      results.innerHTML = "Exception was thrown: "+err;
    }
    var c = "var3";
  });

  showUndeclaredCatchHoisted.addEventListener('click', function(){
    cp1.edit('cp-hvc','javascript');
    var a = "var1";
    var b = "var2";
    try{
      results.innerHTML = "a = "+a+"\n b = "+b+"\n c = "+c;
    }catch(err){
      results.innerHTML = "Exception was thrown: "+err;
    }
  });
  
  showBlockScopeErrHoisted.addEventListener('click', function () {
    cp1.edit('cp-bsm','javascript');
    var a = "var1";
    var b = "var2";
    var tempvar = a + b;
    try{
      if (a !== b) {
        var tempvar = b + a;
        //Do some work with tempvar
      }
    }catch(err){
      results.innerHTML = "Exception was thrown "+err;
    }
    results.innerHTML = "tempvar = "+tempvar;
  });

})(document,window);
