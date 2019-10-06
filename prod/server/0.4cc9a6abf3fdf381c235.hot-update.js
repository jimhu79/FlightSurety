exports.id=0,exports.modules={"./src/server/server.js":function(e,t,r){"use strict";r.r(t);var n=r("./build/contracts/FlightSuretyApp.json"),o=r("./src/server/config.json"),s=r("web3"),c=r.n(s),a=r("express"),u=r.n(a);function i(e,t,r,n,o,s,c){try{var a=e[s](c),u=a.value}catch(e){return void r(e)}a.done?t(u):Promise.resolve(u).then(n,o)}function l(e){return function(){var t=this,r=arguments;return new Promise((function(n,o){var s=e.apply(t,r);function c(e){i(s,n,o,c,a,"next",e)}function a(e){i(s,n,o,c,a,"throw",e)}c(void 0)}))}}var f=o.localhost,p=new c.a(new c.a.providers.WebsocketProvider(f.url.replace("http","ws")));p.eth.defaultAccount=p.eth.accounts[0];var g=new p.eth.Contract(n.abi,f.appAddress),v=20,h=[],d=0;function m(){return x.apply(this,arguments)}function x(){return(x=l(regeneratorRuntime.mark((function e(){var t;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=[],e.next=3,p.eth.getAccounts((function(e,r){console.log("Getting oracle accounts...");for(var n=11,o=n+v;n<o;n++)console.log(r[n]),t.push(r[n])}));case 3:return e.abrupt("return",t);case 4:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function R(e,t){return w.apply(this,arguments)}function w(){return(w=l(regeneratorRuntime.mark((function e(t,r){var n,o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:console.log("Registering Oracles..."),n=0,o=p.utils.toWei("1","ether").toString();case 4:if(!(n<v)){e.next=10;break}return e.next=7,t.methods.registerOracle().send({from:r[n],value:o,gas:3e6},function(){var e=l(regeneratorRuntime.mark((function e(t,r){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t?console.log("received error: "+t):console.log("received result for oracle "+n+": "+r);case 1:case"end":return e.stop()}}),e)})));return function(t,r){return e.apply(this,arguments)}}()).catch((function(e){console.log(e)}));case 7:n++,e.next=4;break;case 10:case"end":return e.stop()}}),e)})))).apply(this,arguments)}l(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,m();case 2:return h=e.sent,console.log(""),e.next=6,R(g,h);case 6:console.log("");case 7:case"end":return e.stop()}}),e)})))(),g.events.OracleRequest({fromBlock:0},function(){var e=l(regeneratorRuntime.mark((function e(t,r){var n,o,s,c,a,u,i;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(console.log("Handling received OracleRequest"),!t){e.next=5;break}console.log("Received error from OracleRequest: "+t),e.next=18;break;case 5:n=r.returnValues.index,o=r.returnValues.airline,s=r.returnValues.flight,c=r.returnValues.timestamp,a=!1,d=0,u=regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(20,a){e.next=4;break}return e.next=4,g.methods.submitOracleResponse(n,o,s,c,20).send({from:h[i],gas:3e6},(function(e,t){t&&console.log("Sent Oracle Response for "+i+" Status Code: 20")})).on("receipt",(function(e){try{"FlightStatusInfo"==e.events.FlightStatusInfo.event&&(console.log(e.events.FlightStatusInfo),a=!0,d=20)}catch(e){}})).catch((function(e){}));case 4:case"end":return e.stop()}}),e)})),i=0;case 13:if(!(i<v)){e.next=18;break}return e.delegateYield(u(),"t0",15);case 15:i++,e.next=13;break;case 18:case"end":return e.stop()}}),e)})));return function(t,r){return e.apply(this,arguments)}}());var k=u()(),b=Object({BUILD_TARGET:"server"}).PORT||"8080";k.get("/getFlightStatus",(function(e,t){t.send({message:d})})),k.listen(b,(function(){console.log("Listening to requests on http://localhost:".concat(b))})),t.default=k}};