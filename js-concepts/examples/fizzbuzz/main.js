(function(document,window,undefined){
  var results = document.querySelector("#results");
  var runExample = document.querySelector("#runexample");

  runExample.addEventListener('click', function(){
    cp1.edit('cp-fizzbuzz','javascript');
    var rendered = "";
    for (var i=1,output="";i<=100;i++){
      if ((i%3) < 1){output = "Fizz";}
      if ((i%5) < 1){output += "Buzz";}
      if (output === ""){output = i;}
      rendered += output+"\n";
      output = "";
    }
    results.innerHTML = rendered;
  });
})(document,window);
