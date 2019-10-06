import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {
        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));

        this.owner = null;
        this.airlines = [];
        this.airlineNames = [];
        this.passengers = [];
        this.firstAirline = null;
        this.initialize(callback);

        this.flightSuretyAppAddress = config.appAddress;
        this.flightSuretyDataAddress = config.dataAddress;
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, this.flightSuretyAppAddress);
        //calls contract constructor
        this.flightSuretyApp.deploy({
            arguments: [this.flightSuretyDataAddress]
        });
        console.log("Created app with address: "+config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, this.flightSuretyDataAddress);
        //calls contract constructor
        this.flightSuretyData.deploy({
            arguments: [this.firstAirline]
        });
        console.log("Created data with address: "+config.dataAddress);
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {

            this.owner = accts[0];
            this.firstAirline = accts[1];

            let counter = 1;
            console.log("Getting airline accounts: ");
            while(this.airlines.length < 5) {
                console.log(accts[counter]);
                this.airlines.push(accts[counter++]);
            }

            console.log("Getting passenger accounts: ");
            while(this.passengers.length < 5) {
                console.log(accts[counter]);
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    async authorize(callback) {
        console.log("      ***Start contract.js authorize()");
        let self = this;

        await self.flightSuretyData.methods
            .setAuthorizedCaller(self.flightSuretyAppAddress)
            .send({from: self.owner}, (error,result) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('         contract.js authorize(): transaction successful, tnx id: ' + result);
                }
            })
            .on('receipt', function(receipt) {
                console.log('         contract.js authorize(): authorized caller address is now: '+ receipt.events.AuthorizedCallerSet.returnValues[0]);
            });

        await self.flightSuretyData.methods
            .getAuthorizedCaller()
            .call((error,result) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('         contract.js authorize(): getAuthorizedCaller() returned: ' + result);
                    callback(result);
                }
            });
    }

    async register(airline, sender, callback) {
        console.log("      ***Start contract.js register(): received airline address: " + airline)
        let self = this;
        await self.flightSuretyApp.methods
            .registerAirline(airline)
            .send({from: sender, gas:3000000}, (error,result) => {
                if (error) {
                    console.log('         contract.js register(): transaction error: ' + error);
                } else {
                    console.log('         contract.js register(): transaction success: ' + result);
                }
            })
            .on('receipt', function(receipt) {
                console.log(receipt.events);
                return callback(receipt);
            });
    }

    async registerConsensus(airline, airlinesVoting, airlineVotes, sender, callback) {
        console.log("      ***Start contract.js registerConsensus(): received airline address: " + airline)
        let self = this;
        await self.flightSuretyApp.methods
            .registerAirlineConsensus(airline, airlinesVoting, airlineVotes)
            .send({from: sender, gas:3000000}, (error,result) => {
                if (error) {
                    console.log('         contract.js registerConsensus(): transaction error: ' + error);
                } else {
                    console.log('         contract.js registerConsensus(): transaction success: ' + result);
                }
            })
            .on('receipt', function(receipt) {
                console.log(receipt.events);
                return callback(receipt);
            });
    }

    async fund(airline, callback){
        console.log("      ***Start contract.js fund(): received airline address: " + airline)
        let self = this;
        let fundValWei = self.web3.utils.toWei("10", "ether").toString();
        await self.flightSuretyApp.methods
            .fund(airline)
            .send({from: self.owner, value: fundValWei, gas:3000000}, (error,result) => {
                if (error) {
                    console.log('         contract.js fund(): transaction error: ' + error);
                } else {
                    console.log('         contract.js fund(): transaction success: ' + result);
                }
            })
            .on('receipt', function(receipt) {
                console.log(receipt.events);
                return callback(receipt);
            });
    }

    async buyInsurance(passenger,flight,insAmtEth, callback){
        console.log("      ***Start contract.js buyInsurance(): received passenger address: " +passenger+", insurance amt (ether) "+insAmtEth+", for flight "+flight);
        let self = this;
        let insAmtWei = self.web3.utils.toWei(insAmtEth, "ether").toString();;
        await self.flightSuretyApp.methods
            .buyInsurance(passenger,flight)
            .send({from: self.owner, value: insAmtWei, gas:3000000}, (error,result) => {
                if (error) {
                    console.log('         contract.js buyInsurance(): transaction error: ' + error);
                } else {
                    console.log('         contract.js buyInsurance(): transaction success: ' + result);
                }
            })
            .on('receipt', function(receipt) {
                console.log(receipt.events);
                return callback(receipt);
            });
    }

    async submitFlightStatusManual(flight, flightStatus, callback) {
        console.log("      ***Start contract.js submitFlightStatusManual(): received flight: " +flight+", status "+flightStatus);
        let self = this;
        await self.flightSuretyApp.methods
            .processFlightStatus(flight, flightStatus)
            .send({from: self.owner, gas:3000000}, (error,result) => {
                if (error) {
                    console.log('         contract.js submitFlightStatusManual(): transaction error: ' + error);
                } else {
                    console.log('         contract.js submitFlightStatusManual(): transaction success: ' + result);
                }
            })
            .on('receipt', function(receipt) {
                console.log(receipt.events);
                return callback(receipt);
            });
    }

    async checkCredit(passenger, callback) {
        console.log("      ***Start contract.js checkCredit(): received passenger: "+passenger);
        let self = this;
        await self.flightSuretyData.methods
            .getCredits(passenger)
            .call({from: self.owner, gas:3000000}, (error,result) => {
                if (error) {
                    console.log('         contract.js checkCredit(): transaction error: ' + error);
                } else {
                    let credits = self.web3.utils.fromWei(result, "ether").toString();;
                    console.log('         contract.js checkCredit(): transaction success: ' + credits);
                    return callback(credits);
                }
            });
    }

    async checkBalance(callback) {
        console.log("      ***Start contract.js checkBalance()");
        let self = this;
        await self.flightSuretyData.methods
            .getContractBalance()
            .call({from: self.owner, gas:3000000}, (error,result) => {
                if (error) {
                    console.log('         contract.js checkBalance(): transaction error: ' + error);
                } else {
                    let balance = self.web3.utils.fromWei(result, "ether").toString();;
                    console.log('         contract.js checkBalance(): transaction success: ' + balance);
                    return callback(balance);
                }
            });
    }

    async withdraw(passenger, callback) {
        console.log("      ***Start contract.js withdraw(): received passenger: "+passenger);
        let self = this;
        await self.flightSuretyApp.methods
            .pay()
            .send({from: passenger, gas:3000000}, (error,result) => {
                if (error) {
                    console.log('         contract.js withdraw(): transaction error: ' + error);
                } else {
                    console.log('         contract.js withdraw(): transaction success: ' + result);
                }
            })
            .on('receipt', function(receipt) {
                console.log(receipt.events);
                let withdrawnAmt = self.web3.utils.fromWei(receipt.events.CreditsWithdrawn.returnValues[1], "ether").toString();;
                return callback(withdrawnAmt);
            });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        }
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    getFlightStatus(flight, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .getFlightStatus(flight)
            .call({from: self.owner}, (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    callback(result);
                }
            });
    }
}
