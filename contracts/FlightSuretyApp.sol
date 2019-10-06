pragma solidity ^0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./FlightSuretyData.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codes; only code 20 causes any action to be taken
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    //Account used to deploy contract
    address private contractOwner;

    //Blocks all state changes throughout the contract if false
    bool private operational = true;

    FlightSuretyData flightSuretyData;

    struct Flight {
        uint8 statusCode;
        address airline;
    }
    //Maps the flight id to struct
    mapping(string => Flight) private flights;

    //Airline fee to register
    uint256 public constant REGISTRATION_FEE_AIRLINES = 10 ether;

    //Max insurance amount that a passenger can purchase for each flight
    uint256 public constant MAX_INSURANCE = 1 ether;

    //Number of airlines that can register before consensus requirement
    uint256 public constant AIRLINES_ALLOWED_BEFORE_CONSENSUS = 4;

    //Array to record votes for consensus
    address[] consensusVotes = new address[](0);

    /********************************************************************************************/
    /*                                       Events                                             */
    /********************************************************************************************/
    event AirlineRegistered(address airline); //Event triggered when Airline is Registered
    event AirlineFunded(address airline); //Event triggered when Airline is Funded
    event InsureesCredited(address[] passengers); //Event triggered when Passenger is paid insurance
    event InsurancePurchased(address passenger, string flight, uint256 insAmt); //Event triggered when passenger purchases insurance
    event CreditsWithdrawn(address passenger, uint256 amt);

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational == true, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor(address dataContract) public
    {
        contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(dataContract);

        //hard code flights to match DAPP options
        flights["american-flight"] = Flight({statusCode: STATUS_CODE_UNKNOWN, airline: 0xf17f52151EbEF6C7334FAD080c5704D77216b732});
        flights["delta-flight"] = Flight({statusCode: STATUS_CODE_UNKNOWN, airline: 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef});
        flights["united-flight"] = Flight({statusCode: STATUS_CODE_UNKNOWN, airline: 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544});
        flights["alaska-flight"] = Flight({statusCode: STATUS_CODE_UNKNOWN, airline: 0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2});
        flights["jetblue-flight"] = Flight({statusCode: STATUS_CODE_UNKNOWN, airline: 0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e});
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Checks if contract is operational
    *
    * @return true if contract is operational
    */
    function isOperational()
        public
        view
        returns(bool)
    {
        return operational;  // Modify to call data contract's status
    }

    /**
    * @dev Sets operatation status of contract
    *
    */
    function setOperatingStatus(bool mode)
        external
    {
        require(mode != operational, "Mode must be different.");
        require(flightSuretyData.isFunded(msg.sender), "Caller is not a funded airline.");

        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
    * @dev Allows a registered airline to registers up to 4 new airlines, after which consensus will be required.
    *
    */
    function registerAirline(address airline)
       requireIsOperational
       external
    {
        require(flightSuretyData.isRegistered(msg.sender)==true, "Caller is not a registered airline");
        require(flightSuretyData.isFunded(msg.sender)==true, "Caller must be funded");
        require(flightSuretyData.isRegistered(airline)==false, "Airline is already registered. Cannot register again.");
        require(flightSuretyData.getNumRegisteredAirlines()<AIRLINES_ALLOWED_BEFORE_CONSENSUS,"Consensus required to register more than 4 airlines.");

        flightSuretyData.registerAirline(airline, msg.sender);
        emit AirlineRegistered(airline);
    }

    /**
    * @dev Add an airline via consensus vote. Only airlines that are registered
    * and funded may vote. The sender must also be a registered airline.
    * If 50% or more of the registered airlines vote in favor, then the new
    * airline is registered.
    *
    */
    function registerAirlineConsensus(address airlineToRegister, address[] airlinesVoting, bool[] airlineVotes)
        requireIsOperational
        external
    {
        require(flightSuretyData.isRegistered(msg.sender)==true, "Caller is not a registered airline");
        require(flightSuretyData.isRegistered(airlineToRegister)==false, "Airline is already registered. Cannot register again.");
        require(areAllVotingAirlinesRegistered(airlinesVoting)==true,"Not all voting airlines are registered. Only registered airlines may vote.");
        require(areAllVotingAirlinesFunded(airlinesVoting)==true,"Not all airlines are funded. They must be funded to participate in voting");

        uint countYesVotes = 0;
        for (uint i=0; i<airlineVotes.length; i++) {
            if (airlineVotes[i]==true) {
                countYesVotes++;
            }
        }
        if (countYesVotes >= flightSuretyData.getNumRegisteredAirlines().div(2)) {
            flightSuretyData.registerAirline(airlineToRegister, msg.sender);
            emit AirlineRegistered(airlineToRegister);
        }
        else {
            require(false,"Airline not registered because 50% votes were not received.");
        }
    }

    /**
    * @dev Helper function used by registerAirlineConsensus() to check whether
    * all voting airlines are registered. Returns true if all airlines are registered.
    *
    * @return true if all airlines participating in vote are registered
    */
    function areAllVotingAirlinesRegistered(address[] airlinesVoting)
        private
        view
        returns(bool)
    {
        bool result = true;
        for (uint i=0; i<airlinesVoting.length; i++) {
            if (flightSuretyData.isRegistered(airlinesVoting[i])==false)
            {
                result = false;
                break;
            }
        }
        return result;
    }

    /**
    * @dev Helper function used by registerAirlineConsensus() to check whether
    * all voting airlines are funded. Returns true if all airlines are funded.
    *
    * @return true if all airlines participating in vote are funded
    */
    function areAllVotingAirlinesFunded(address[] airlinesVoting) private view returns (bool)
    {
        bool result = true;
        for (uint i=0; i<airlinesVoting.length; i++) {
            if (flightSuretyData.isFunded(airlinesVoting[i])==false)
            {
                result = false;
                break;
            }
        }
        return result;
    }

    /**
    * @dev Allows airline to add funding.
    *
    */
    function fund(address airline)
        external
        payable
        requireIsOperational
   {
       require(msg.value == REGISTRATION_FEE_AIRLINES, "Not enough Ether to fund airline. Requires 10 ETH" );
       require(flightSuretyData.isRegistered(airline)==true, "Airline must be registered first.");
       require(flightSuretyData.isFunded(airline) == false, "Airline is already funded");

       flightSuretyData.fund(airline);
       address(flightSuretyData).transfer(REGISTRATION_FEE_AIRLINES);
       emit AirlineFunded(airline);
   }

   /**
    * @dev Register a future flight for insuring.
    *
    */
    function registerFlight()
        external
        pure
    {
        //don't need to implement; just hard code a few flights in DApp
    }

    /**
    * @dev Allows passenger to buy insurance for specified flight.
    *
    */
    function buyInsurance(address passenger, string flight)
        external
        payable
        requireIsOperational
    {
        require(checkInsAmt(msg.value), "Passengers can pay a max of 1 ETH");
        require(flightSuretyData.isRegistered(flights[flight].airline)==true, "Airline must be registered.");
        require(flightSuretyData.isFunded(flights[flight].airline) == true, "Airline must funded");
        // Assume passenger can only purchase insurance once for each flight.
        // For example a passenger cannoth purchase two insurance contracts for 0.5 ether for the same flight.
        require(flightSuretyData.isInsured(passenger,flight)==false,"Passenger already has insurance for this flight");

        address(flightSuretyData).transfer(msg.value);
        flightSuretyData.buy(passenger, flight, msg.value, msg.sender);
        emit InsurancePurchased(passenger, flight, msg.value);
    }

    /**
    * @dev Used by buyInsurance() to check that amount of insurance being purchased does not exceed 1 ether.
    *
    * @return true if insurance amount is less than or equal to 1 ether and more than zero
    */
    function checkInsAmt(uint256 insAmtWei) private view returns(bool)
    {
        bool result = true;
        if ((insAmtWei/10^18 > MAX_INSURANCE) || (insAmtWei <= 0)) {
            result = false;
        }
        return result;
    }

    /**
    * @dev Called when passenger wants to withdraw insurance payout.
    *
    */
    function pay()
        external
    {
        uint amount = flightSuretyData.pay(msg.sender);
        emit CreditsWithdrawn(msg.sender, amount);
    }

   /**
    * @dev Process payout when airline is the cause of flight delay.
    * This is triggered by Oracles, or by the manual flight status update button on the DAPP.
    * Insurees receive 1.5x insured amount.
    *
    */
    function processFlightStatus(string flight, uint8 statusCode)
        external
    {
        flights[flight].statusCode = statusCode;
        if(statusCode == STATUS_CODE_LATE_AIRLINE){
            address[] memory passengers = flightSuretyData.getPassengersInsured(flight);
            uint amount = 0;
            address passenger;
            uint index;

            for(uint i = 0; i < passengers.length; i++) {
                passenger = passengers[i];
                amount = flightSuretyData.getInsuredAmount(flight, passenger);
                amount = amount.mul(15).div(10);
                flightSuretyData.creditInsuree(flight, passenger, amount);
            }
            emit InsureesCredited(passengers);
        }
    }

    //Generate a request for oracles to fetch flight information
    function fetchFlightStatus
                        (
                            address airline,
                            string flight,
                            uint256 timestamp
                        )
                        external
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        oracleResponses[key] = ResponseInfo({
                                                requester: msg.sender,
                                                isOpen: true
                                            });

        emit OracleRequest(index, airline, flight, timestamp);
    }

    //Returns the flight status
    function getFlightStatus(string flight)
        external
        returns(uint)
    {
        return flights[flight].statusCode;
    }

// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);

    event OracleRegistered(address oracle);

    // Register an oracle with the contract
    function registerOracle()
        external
        payable
    {
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);
        oracles[msg.sender] = Oracle({isRegistered: true, indexes: indexes});
        emit OracleRegistered(msg.sender);
    }

    function getMyIndexes()
        view
        external
        returns(uint8[3])
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse
                        (
                            uint8 index,
                            address airline,
                            string flight,
                            uint256 timestamp,
                            uint8 statusCode
                        )
                        external
    {
        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");

        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            this.processFlightStatus(flight, statusCode);
        }
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address account)
        internal
        returns(uint8[3])
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex(address account)
        internal
        returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion

}
