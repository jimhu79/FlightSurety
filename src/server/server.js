import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let MAX_NUM_ORACLES = 20;
let oracles = [];

//Get and register 20 Oracles
(async() => {
    oracles = await getOracleAccounts();
    console.log("");
    await registerOracles(flightSuretyApp, oracles);
    console.log("");
})();

async function getOracleAccounts() {
    let oracles = [];
    await web3.eth.getAccounts((error, accts) => {
        console.log("Getting oracle accounts...");
        let i = 11;
        let maxOracles = i+MAX_NUM_ORACLES;
        for (i; i<maxOracles; i++) {
            console.log(accts[i]);
            oracles.push(accts[i]);
        }
    });
    return oracles;
}

async function registerOracles(flightSuretyApp, oracles) {
    //Regster oracles with flightSuretyApp
    console.log("Registering Oracles...");
    let i = 0;
    let registerFee = web3.utils.toWei("1", "ether").toString()
    for (i; i<MAX_NUM_ORACLES; i++) {
        await flightSuretyApp.methods
            .registerOracle()
            .send({ from: oracles[i], value: registerFee, gas:3000000}, async (error, result) => {
                if (error) {
                    console.log("received error: " + error);
                } else {
                    console.log("received result for oracle " + i + ": " + result);
                }
        }).catch(e => {
            console.log(e);
        });
    }
}

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
}, async function (error, event) {
    console.log("Handling received OracleRequest");
    if (error) {
        console.log("Received error from OracleRequest: " + error);
    } else {
        let index = event.returnValues.index;
        let airline = event.returnValues.airline;
        let flight = event.returnValues.flight;
        let time = event.returnValues.timestamp;
        let flightStatusUpdated = false;
        for(var i=0; i<MAX_NUM_ORACLES; i++) {

            //Code 20 indicates the airline cause the flight to be late
            let statusCode = 20;
            if (!flightStatusUpdated) {
                await flightSuretyApp.methods
                    .submitOracleResponse(index, airline, flight, time, statusCode)
                    .send({from: oracles[i], gas:3000000} , (error, result) => {
                        if (result) {
                            console.log("Sent Oracle Response for " + i + " Status Code: " + statusCode);
                        }
                    }).on('receipt', function(receipt) {
                        try {
                            //stop submitting oracle responses if flight status has already been updated
                            if (receipt.events.FlightStatusInfo.event == "FlightStatusInfo") {
                                console.log(receipt.events.FlightStatusInfo);
                                flightStatusUpdated = true;
                            }
                        }
                        catch (e) {
                        }
                    }).catch(e => {
                        //console.log(e);
                    });
            }
        }
    }
});


const app = express();
app.get('/api', (req, res) => {
    res.send({
        message: 'api'
    })
})

export default app;
