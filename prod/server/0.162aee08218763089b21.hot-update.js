exports.id=0,exports.modules={"./src/server/server.js":function(e,r,t){"use strict";t.r(r);var n=t("./build/contracts/FlightSuretyApp.json"),o=t("./src/server/config.json"),s=t("web3"),a=t.n(s),c=t("express"),u=t.n(c);function i(e,r,t,n,o,s,a){try{var c=e[s](a),u=c.value}catch(e){return void t(e)}c.done?r(u):Promise.resolve(u).then(n,o)}function l(e){return function(){var r=this,t=arguments;return new Promise((function(n,o){var s=e.apply(r,t);function a(e){i(s,n,o,a,c,"next",e)}function c(e){i(s,n,o,a,c,"throw",e)}a(void 0)}))}}var f=o.localhost,p=new a.a(new a.a.providers.WebsocketProvider(f.url.replace("http","ws")));p.eth.defaultAccount=p.eth.accounts[0];var g=new p.eth.Contract(n.abi,f.appAddress),v=20,h=[];function d(){return m.apply(this,arguments)}function m(){return(m=l(regeneratorRuntime.mark((function e(){var r;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=[],e.next=3,p.eth.getAccounts((function(e,t){console.log("Getting oracle accounts...");for(var n=11,o=n+v;n<o;n++)console.log(t[n]),r.push(t[n])}));case 3:return e.abrupt("return",r);case 4:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function x(e,r){return R.apply(this,arguments)}function R(){return(R=l(regeneratorRuntime.mark((function e(r,t){var n,o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:console.log("Registering Oracles..."),n=0,o=p.utils.toWei("1","ether").toString();case 4:if(!(n<v)){e.next=10;break}return e.next=7,r.methods.registerOracle().send({from:t[n],value:o,gas:3e6},function(){var e=l(regeneratorRuntime.mark((function e(r,t){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r?console.log("received error: "+r):console.log("received result for oracle "+n+": "+t);case 1:case"end":return e.stop()}}),e)})));return function(r,t){return e.apply(this,arguments)}}()).catch((function(e){console.log(e)}));case 7:n++,e.next=4;break;case 10:case"end":return e.stop()}}),e)})))).apply(this,arguments)}l(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,d();case 2:return h=e.sent,console.log(""),e.next=6,x(g,h);case 6:console.log("");case 7:case"end":return e.stop()}}),e)})))(),g.events.OracleRequest({fromBlock:0},function(){var e=l(regeneratorRuntime.mark((function e(r,t){var n,o,s,a,c,u,i;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(console.log("Handling received OracleRequest"),!r){e.next=5;break}console.log("Received error from OracleRequest: "+r),e.next=17;break;case 5:n=t.returnValues.index,o=t.returnValues.airline,s=t.returnValues.flight,a=t.returnValues.timestamp,c=!1,u=regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(20,c){e.next=4;break}return e.next=4,g.methods.submitOracleResponse(n,o,s,a,20).send({from:h[i],gas:3e6},(function(e,r){r&&console.log("Sent Oracle Response for "+i+" Status Code: 20")})).on("receipt",(function(e){try{"FlightStatusInfo"==e.events.FlightStatusInfo.event&&(console.log(e.events.FlightStatusInfo),c=!0)}catch(e){}})).catch((function(e){}));case 4:case"end":return e.stop()}}),e)})),i=0;case 12:if(!(i<v)){e.next=17;break}return e.delegateYield(u(),"t0",14);case 14:i++,e.next=12;break;case 17:case"end":return e.stop()}}),e)})));return function(r,t){return e.apply(this,arguments)}}());var w=u()(),k=Object({BUILD_TARGET:"server"}).PORT||"4500";w.get("/api",(function(e,r){r.send({message:"An API for use with your Dapp!"})})),w.listen(k,(function(){console.log("Listening to requests on http://localhost:".concat(k))})),r.default=w}};