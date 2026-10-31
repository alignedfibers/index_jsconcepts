/* JavaScript concepts: original authored handlers for Hoisting and Prototype; panel bindings. */
(() => {
  'use strict';
  function runConceptExample(key, output) {
    switch (key) {
      case 'functionscope:runlocalvarexample': {
        var showLocalVar = function(){var greeting="hello";var show=function(){var greeting="welcome";return greeting;};output.textContent="The greeting returned from show is: \n"+show();};showLocalVar();break;
      }
      case 'functionscope:runparentvarexample': {
        var showParentVar=function(){var greeting="hello";var show=function(){return greeting;};output.textContent="The greeting returned from show is: \n"+show();};showParentVar();break;
      }
      case 'functionscope:runglobalexposeexample': {
        var exposeChildFunction=function(){var greeting="hello";window.showLexicalAfterFunReturn=function(){return greeting;};return;};
        exposeChildFunction();output.textContent="The greeting returned from showAfterReturn is: \n"+showLexicalAfterFunReturn();break;
      }
      case 'fizzbuzz:runexample': {
        var rendered='';for(var i=1,out='';i<=100;i++){if((i%3)<1){out='Fizz';}if((i%5)<1){out+='Buzz';}if(out===''){out=i;}rendered+=out+'\n';out='';}
        output.textContent=rendered;break;
      }
    }
  }
  function makePanelEditor(panel) {
    return {
      edit: function(id, language) {
        const key = panel.dataset.concept + ':' + (id === 'cp-prototype' ? 'runexample' : id.substring(3));
        const source = Array.from(panel.querySelectorAll('template[data-concept-source]'))
          .find(t => t.dataset.conceptSource === key);
        const code = panel.querySelector('[data-concept-code]');
        const result = panel.querySelector('[data-concept-result]');
        if(source && code)code.textContent=source.content.textContent;
        if(result)result.textContent='';
      }
    };
  }
  function bindOriginalHoisting(panel) {
    var cp1 = makePanelEditor(panel);
(function(document,window,undefined){
  var results = panel.querySelector("[data-concept-result]");
  var showUndefinedHoisted = panel.querySelector('[data-concept-example="hoisting:hvu"]');
  var showUndeclaredCatchHoisted = panel.querySelector('[data-concept-example="hoisting:hvc"]');
  var showBlockScopeErrHoisted = panel.querySelector('[data-concept-example="hoisting:bsm"]');

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
  }
  function bindOriginalPrototype(panel) {
    var cp1 = makePanelEditor(panel);
(function(document,window,undefined){
  var results = panel.querySelector("[data-concept-result]");
  var runExample = panel.querySelector('[data-concept-example="prototype:runexample"]');

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
  }
  const initializedPanels = new WeakSet();
  // Bind the authored button listeners during capture, before this click reaches
  // the button. The original handler then executes normally on the same click.
  document.addEventListener('click', function(event) {
    const button=event.target.closest('button[data-concept-example]');if(!button)return;
    const panel=button.closest('.concept-demo');if(!panel || initializedPanels.has(panel))return;
    const name=panel.dataset.concept;
    if(name==='hoisting')bindOriginalHoisting(panel);
    else if(name==='prototype')bindOriginalPrototype(panel);
    else return;
    initializedPanels.add(panel);
  }, true);

  document.addEventListener('click', function(event){
    const button=event.target.closest('button[data-concept-example]');if(!button)return;
    const panel=button.closest('.concept-demo');if(!panel)return;
    const key=button.dataset.conceptExample;
    const source=Array.from(panel.querySelectorAll('template[data-concept-source]')).find(t=>t.dataset.conceptSource===key);
    const code=panel.querySelector('[data-concept-code]'),result=panel.querySelector('[data-concept-result]');
    if(!source||!code||!result)return;
    if(key.startsWith('hoisting:') || key.startsWith('prototype:'))return; // Original button listener owns this action.
    code.textContent=source.content.textContent;result.textContent='';
    try{runConceptExample(key,result);}catch(err){result.textContent=String(err);}
  });
})();
