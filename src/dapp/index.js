
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {
        displayInitialization(contract.airlines, contract.passengers);

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('operational','Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        DOM.elid('authorize-btn').addEventListener('click', async () => {
            console.log("***Start index.js authorize");
            await contract.authorize((result) => {
                displayOneLine('authorize','Successfully authorized address '+result);
            });
            console.log("***End index.js authorize");
        })

        DOM.elid('register-btn').addEventListener('click', async () => {
            console.log("***Start index.js register");
            let airlineAddress = DOM.elid('airline-register').value.trim();
            let sender = DOM.elid('airline-register-sender').value.trim();
            await contract.register(airlineAddress, sender, (result) => {
                let resultInfo = result.events.AirlineRegistered.returnValues[0];
                console.log("   index.js register: result received is: " + resultInfo);
                display('register','Register Status', 'Successfully registered airline address below:', [{label: 'Result: ', error: false, value: resultInfo}]);
            }).catch(e => {
                console.log("   index.js register: error received is: " +e);
                display('register','Register Status', 'Error occured registering airline address '+airlineAddress, [{label: 'Result: ', error: e, value: e}]);
            });
            console.log("***End index.js register");
        })

        DOM.elid('register-consensus-btn').addEventListener('click', async () => {
            console.log("***Start index.js consensus vote");
            let airlineRegisterAddress = DOM.elid('airline-register-consensus').value.trim();
            let sender = DOM.elid('airline-register-consensus-sender').value.trim();
            let airlinesVoting = new Array();
            let airlineVotes = new Array();
            let i = 1;
            let votingAirlineAddress = "";
            for (i=1; i<=5; i++) {
                let fieldName = "airline"+i+"Vote";
                switch (i) {
                    case 1:
                        votingAirlineAddress = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";
                        break;
                    case 2:
                        votingAirlineAddress = "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef";
                        break;
                    case 3:
                        votingAirlineAddress = "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544";
                        break;
                    case 4:
                        votingAirlineAddress = "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2";
                        break;
                    case 5:
                        votingAirlineAddress = "0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e";
                        break;
                }
                if (DOM.elid(fieldName).value != 'na') {
                    airlinesVoting.push(votingAirlineAddress);
                    if (DOM.elid(fieldName).value == 'yes') {
                        airlineVotes.push(true);
                    }
                    else {
                        airlineVotes.push(false);
                    }
                }
            }

            console.log("   index.js register-consensus: voting to register airline: "+airlineRegisterAddress);
            console.log("   index.js register-consensus: voting airlines are: "+airlinesVoting);
            console.log("   index.js register-consensus: votes are: "+airlineVotes);
            await contract.registerConsensus(airlineRegisterAddress, airlinesVoting, airlineVotes, sender, (result) => {
                let resultInfo = result.events.AirlineRegistered.returnValues[0];
                console.log("   index.js register-consensus: result received is: " + resultInfo);
                display('consensus','Consensus Vote Status', 'Successfully registered (by consensus) airline address below:', [{label: 'Result: ', error: false, value: resultInfo}]);
            }).catch(e => {
                console.log("   index.js register-consensus: error received is: " +e);
                display('consensus','Consensus Vote Status', 'Error occured registering (by consensus) airline address '+airlineRegisterAddress, [{label: 'Result: ', error: e, value: e}]);
            });
            console.log("***End index.js consensus vote");
        })

        DOM.elid('fund-btn').addEventListener('click', async () => {
            console.log("***Start index.js fund");
            let airline = DOM.elid('airline-fund').value;
            let airlineAddress = "0x0";
            if (airline=="american") {
                console.log("   index.js submit-funds: funding registered airline 1 (american)");
                airlineAddress = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";
            }
            else if (airline=="delta") {
                console.log("   index.js fund: funding registered airline 2 (delta)");
                airlineAddress = "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef";
            }
            else if (airline=="united") {
                console.log("   index.js fund: funding registered airline 3 (united)");
                airlineAddress = "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544";
            }
            else if (airline=="alaska") {
                console.log("   index.js fund: funding registered airline 4 (alaska)");
                airlineAddress = "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2";
            }
            else if (airline=="jetblue") {
                console.log("   index.js fund: funding registered airline 5 (jetblue)");
                airlineAddress = "0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e";
            }
            else if (airline=="invalid") {
                //need to have fund() check if airline is registered
                console.log("   index.js fund: funding an unregistered airline");
                airlineAddress = "0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5";
            }

            await contract.fund(airlineAddress,(result) => {
                let resultInfo = result.events.AirlineFunded.returnValues[0];
                console.log("   index.js fund: result received is: " + resultInfo);
                display('fund','Funding Status', 'Funding airline '+airline+' with address below:', [{label: 'Result: ', error:"", value: resultInfo}]);
            }).catch(e => {
                console.log("   index.js fund: error received is: " +e);
                display('fund','Funding Status', 'Error occured funding airline '+airline+' with address '+airlineAddress, [{label: 'Result: ', error:e, value: e}]);
            });

            console.log("***End index.js fund");

        })

        DOM.elid('buy-ins-btn').addEventListener('click', async () => {
            console.log("***Start index.js buy ins");
            let passenger = DOM.elid('passenger-purchasing').value;
            let flight = DOM.elid('flight-selection').value;
            let insAmtEth = DOM.elid('insurance-amt').value.toString();
            await contract.buyInsurance(passenger,flight,insAmtEth,(result) => {
                let resultInfo = result.events.InsurancePurchased.returnValues;
                console.log("   index.js buy ins: result received is: " + resultInfo);
                display('buy-ins','Buy Insurance Status', 'Passenger '+passenger+' successfully bought insurance of '+insAmtEth+' ether for flight '+flight, [{label: 'Result: ', error:"", value: resultInfo[0]+" airline, "+resultInfo[1]+" ,"+resultInfo[2]+" wei"}]);
            }).catch(e => {
                console.log("   index.js fund: error received is: " +e);
                display('buy-ins','Buy Insurance Status', 'Error. Passenger '+passenger+' could not buy insurance of '+insAmtEth+' ether for flight '+flight, [{label: 'Result: ', error:e, value: e}]);
            });

            console.log("***End index.js buy ins");
        })

        DOM.elid('submit-oracle-btn').addEventListener('click', () => {
            console.log("***Start index.js submit to oracles");
            let flight = DOM.elid('flight-update-selection').value;
            contract.fetchFlightStatus(flight, (error, result) => {
                display('flight-update','Oracles Flight Status', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: "Update for " + flight + " is submitted to Oracles. Use the button below to check flight status retuned from Oracles."} ]);
            });
            console.log("***End index.js submit to oracles");
        })

        DOM.elid('get-oracle-status-btn').addEventListener('click', () => {
            console.log("***Start index.js get oracle status");
            let flight = DOM.elid('flight-update-selection').value;
            contract.getFlightStatus(flight, (result) => {
               display('flight-update','Oracles Flight Status', 'Retrieved flight status', [ { label: 'Flight Status', error: "", value: "Flight " + flight + " status code is " + result} ]);
            });
            console.log("***End index.js get oracle status");
        })

        DOM.elid('submit-manual-btn').addEventListener('click', async () => {
            console.log("***Start index.js submit manual");
            let flight = DOM.elid('flight-update-selection').value;
            let flightStatus = DOM.elid('manual-flight-status-selection').value;
            await contract.submitFlightStatusManual(flight, flightStatus,(result) => {
                let resultInfo = result.events.InsureesCredited.returnValues[0];
                console.log("   index.js submit manual: result received is: " + resultInfo);
                display('flight-update','Manual Flight Status', 'Successfully submitted status '+flightStatus+' for flight '+flight, [{label: 'Result: ', error:"", value: resultInfo}]);
            }).catch(e => {
                console.log("   index.js submit manual: error received is: " +e);
                display('flight-update','Manual Flight Status', 'Error submitting status '+flightStatus+' for flight '+flight, [{label: 'Result: ', error:e, value: e}]);
            });
            console.log("***End index.js submit manual");
        })

        DOM.elid('check-credit-btn').addEventListener('click', async () => {
            console.log("***Start index.js check credit");
            let passenger = DOM.elid('passenger-credit-check').value;
            await contract.checkCredit(passenger,(result) => {
                console.log("   index.js check credit: result received is: " + result);
                displayOneLine('credits','Passenger ' + passenger + ' has credits of ' + result);
            }).catch(e => {
                console.log("   index.js check credit: error received is: " +e);
                displayOneLine('credits','Error retrieving credits for passenger ' + passenger + ": " + e);
            });
            console.log("***End index.js check credit");
        })

        DOM.elid('check-balance-btn').addEventListener('click', async () => {
            console.log("***Start index.js check balance");
            await contract.checkBalance((result) => {
                console.log("   index.js check balance: result received is: " + result);
                displayOneLine('balance','Contract balance is ' + result);
            }).catch(e => {
                console.log("   index.js check balance: error received is: " +e);
                displayOneLine('balance','Error retrieving contract balance: ' + e);
            });
            console.log("***End index.js check balance");
        })

        DOM.elid('withdraw-btn').addEventListener('click', async () => {
            console.log("***Start index.js withdraw");
            let passenger = DOM.elid('passenger-credit-check').value;
            await contract.withdraw(passenger, (result) => {
                console.log("   index.js withdraw: result received is: " + result);
                displayOneLine('withdraw','Passenger ' + passenger + ' has withdrawn ' + result);
            }).catch(e => {
                console.log("   index.js withdraw: error received is: " +e);
                displayOneLine('withdraw','Error withdrawing credits for passenger ' + passenger + ": " + e);
            });
            console.log("***End index.js withdraw");
        })

    });


})();

function displayOneLine(divId, message) {
    let displayDiv = DOM.elid(divId);
    displayDiv.append(message);
    DOM.makeNewLine(displayDiv);
}

function displayInitialization(airlines, passengers) {
    let displayDiv = DOM.elid("initialization");
    let section = DOM.section();

    //DOM.appendArray(section, airlines);
    section.appendChild(DOM.h4("Airline Addresses"));
    let i = 0;
    for (i=0; i<airlines.length; i++) {
        DOM.appendText(section, (i+1)+". "+airlines[i]);
        DOM.makeNewLine(section);
    }
    DOM.makeNewLine(section);
    section.appendChild(DOM.h4("Passenger Addresses"));
    for (i=0; i<passengers.length; i++) {
        DOM.appendText(section, (i+1)+". "+passengers[i]);
        DOM.makeNewLine(section);
    }

    displayDiv.append(section);
}

function display(divId, title, description, results) {
    let displayDiv = DOM.elid(divId);
    let section = DOM.section();
    section.appendChild(DOM.h5(title));
    section.appendChild(DOM.h6(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}
