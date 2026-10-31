(function(document,window,undefined){
  var results = document.querySelector("#results");
  var runExample = document.querySelector("#runexample");

  runExample.addEventListener('click', function(){
    cp1.edit('cp-prototype','javascript');
    var AwareObj = function(){
      var target = document.createTextNode(null);
      console.dir(target);
      this.addEventListener = target.addEventListener.bind(target);
      this.removeEventListener = target.removeEventListener.bind(target);
      this.dispatchEvent = target.dispatchEvent.bind(target);
    };

    AwareObj.prototype.emit = function(eventName,data){
      var evt = new CustomEvent(eventName,data);
      this.dispatchEvent(evt);
    };

    var myTarget = new AwareObj();
    myTarget.addEventListener("myevent",function(){alert("Super Awesome");});
    myTarget.emit("myevent",{'detail':"Just some data"});
  });
})(document,window);
