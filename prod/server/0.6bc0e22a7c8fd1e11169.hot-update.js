exports.id=0,exports.modules={"./src/server/server.js":function(e,r,n){"use strict";n.r(r);var t=n("./build/contracts/FlightSuretyApp.json"),o=n("./src/server/config.json"),a=n("web3"),s=n.n(a),c=n("express"),u=n.n(c);function i(e,r,n,t,o,a,s){try{var c=e[a](s),u=c.value}catch(e){return void n(e)}c.done?r(u):Promise.resolve(u).then(t,o)}function l(e){return function(){var r=this,n=arguments;return new Promise((function(t,o){var a=e.apply(r,n);function s(e){i(a,t,o,s,c,"next",e)}function c(e){i(a,t,o,s,c,"throw",e)}s(void 0)}))}}var f=o.localhost,p=new s.a(new s.a.providers.WebsocketProvider(f.url.replace("http","ws")));p.eth.defaultAccount=p.eth.accounts[0];var g=new p.eth.Contract(t.abi,f.appAddress),v=20,d=[];function h(){return m.apply(this,arguments)}function m(){return(m=l(regeneratorRuntime.mark((function e(){var r;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=[],e.next=3,p.eth.getAccounts((function(e,n){console.log("Getting oracle accounts...");for(var t=11,o=t+v;t<o;t++)console.log(n[t]),r.push(n[t])}));case 3:return e.abrupt("return",r);case 4:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function x(e,r){return w.apply(this,arguments)}function w(){return(w=l(regeneratorRuntime.mark((function e(r,n){var t,o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:console.log("Registering Oracles..."),t=0,o=p.utils.toWei("1","ether").toString();case 4:if(!(t<v)){e.next=10;break}return e.next=7,r.methods.registerOracle().send({from:n[t],value:o,gas:3e6},function(){var e=l(regeneratorRuntime.mark((function e(r,n){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r?console.log("received error: "+r):console.log("received result for oracle "+t+": "+n);case 1:case"end":return e.stop()}}),e)})));return function(r,n){return e.apply(this,arguments)}}()).catch((function(e){console.log(e)}));case 7:t++,e.next=4;break;case 10:case"end":return e.stop()}}),e)})))).apply(this,arguments)}l(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,h();case 2:return d=e.sent,console.log(""),e.next=6,x(g,d);case 6:console.log("");case 7:case"end":return e.stop()}}),e)})))(),g.events.OracleRequest({fromBlock:0},function(){var e=l(regeneratorRuntime.mark((function e(r,n){var t,o,a,s,c,u;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(console.log("Handling received OracleRequest"),!r){e.next=5;break}console.log("Received error from OracleRequest: "+r),e.next=17;break;case 5:console.log(n),t=n.returnValues.index,o=n.returnValues.airline,a=n.returnValues.flight,s=n.returnValues.timestamp,c=regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return 20,e.next=3,g.methods.submitOracleResponse(t,o,a,s,20).send({from:d[u],gas:3e6},(function(e,r){r&&console.log("Sent Oracle Response for "+u+" Status Code: 20")})).catch((function(e){}));case 3:case"end":return e.stop()}}),e)})),u=0;case 12:if(!(u<v)){e.next=17;break}return e.delegateYield(c(),"t0",14);case 14:u++,e.next=12;break;case 17:case"end":return e.stop()}}),e)})));return function(r,n){return e.apply(this,arguments)}}());var R=u()();R.get("/api",(function(e,r){r.send({message:"An API for use with your Dapp!"})})),r.default=R}};