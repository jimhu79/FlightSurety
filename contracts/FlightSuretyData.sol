pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private authorizedCaller = address(0);

    // Account used to deploy contract
    address private contractOwner;

    // Blocks all state changes throughout the contract if false
    bool private operational = true;

    struct Airline {
        bool isRegistered;
        bool isFunded;
        address airlineAddress;
    }
    //Maps airline address to struct
    mapping(address => Airline) public registeredAirlines;
    //Array of airline addresses; easier to get all of the registered airlines
    address[] public registered;

    //ACTIVE is the initial contract state after passenger has purchased insurance.
    //VOID is not currently used, but if the airline is not at fault for a late flight, then this status could be used to indicate the passenger should not receive a payouts
    //PAID indicates that the payout has been credited to the passenger
    enum InsContractStatusEnum {VOID,ACTIVE,PAID}
    struct InsContract {
        string flight;
        address passenger;
        uint256 insPaid;
        InsContractStatusEnum status;
    }
    //Maps passenger address to insurance contracts
    mapping(address => InsContract[]) private passengerInsurance;

    //Maps the flight to passenger address
    mapping(string => address[]) flightInsPassengers;

    //Maps passenger address to insurance credits
    mapping(address => uint256) private credits;

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor(address airline) public payable
    {
        contractOwner = msg.sender;
        registerFirstAirline(airline);
    }

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event AuthorizedCallerSet(address authorized);

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the authorized caller to be the function caller
    */
    modifier requireAuthorizedCaller()
    {
        require(authorizedCaller == msg.sender, "Caller is not authorized");
        _;
    }

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;
    }

    /**
    * @dev Modifier that requires the contract owner to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /**
    * @dev Modifier that requires that the function be called by or is passed a registered airline
    */
    modifier requireRegisteredAirline(address airline)
    {
        require(registeredAirlines[airline].isRegistered == true, "Caller is not a registered airline");
        _;
    }

    /**
    * @dev Modifier that requires that the function be called by or is passed a funded airline
    */
    modifier requireFundedAirline(address airline)
    {
        require(registeredAirlines[airline].isFunded == true, "Caller is not a funded airline");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Authorize the provided caller (this would be the FlightSuretyApp)
    */
    function setAuthorizedCaller(address authorized) public requireContractOwner
    {
        authorizedCaller = authorized;
        emit AuthorizedCallerSet(authorized);
    }

    /**
    * @dev Retrieve the authorized caller address. For testing purposes only.
    *
    * @return returns the authorized caller
    */
    function getAuthorizedCaller() public view returns(address)
    {
        return authorizedCaller;
    }

    /**
    * @dev Check operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational()
                            public
                            view
                            returns(bool)
    {
        return operational;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus(bool mode)
                            external
                            requireContractOwner
    {
        operational = mode;
    }

    /**
    * @dev Check if caller is authorized to access contract functions
    *
    * @return A bool that is the current operating status
    */
    function isAuthorized(address caller) public view returns(bool)
    {
        return (authorizedCaller == caller);
    }

    /**
    * @dev Check if airline is registered
    *
    * @return true if airline is registered already
    */
    function isRegistered(address airline) public view returns(bool)
    {
        return registeredAirlines[airline].isRegistered;
    }

    /**
    * @dev Check if airline is funded
    *
    * @return true if airline is already funded
    */
    function isFunded(address airline) public view returns(bool)
    {
        return registeredAirlines[airline].isFunded;
    }

    /**
     * @dev Check if the passenger is already insured for a flight
     *
     * @return true if the passenger is insured for the flight
     */
    function isInsured(address passenger, string flight)
        external
        view
        requireAuthorizedCaller
        returns(bool)
    {
        bool result = false;
        address[] insuredFlightPassengers = flightInsPassengers[flight];
        for (uint i=0; i<insuredFlightPassengers.length; i++) {
            if (passenger == insuredFlightPassengers[i]) {
                result = true;
                break;
            }
        }
        return result;
    }

    /**
     * @dev Gets the list of insured passengers for a flight to process payout.
     *
     * @return Array of passenger addresses
     */
     function getPassengersInsured(string flight)
         external
         view
         requireAuthorizedCaller
         requireIsOperational
         returns(address[] passengers)
     {
         return flightInsPassengers[flight];
     }

     /**
      * @dev Gets the insured amount for a passenger for the specified flight
      *
      * @return the amount insured
      */
    function getInsuredAmount(string  flight, address passenger)
        external
        view
        requireIsOperational
        requireAuthorizedCaller
        returns(uint amount)
    {
        amount = 0;
        InsContract[] insContracts = passengerInsurance[passenger];
        for (uint i=0; i<insContracts.length; i++) {
            if (insContracts[i].status == InsContractStatusEnum.ACTIVE) {
                amount = insContracts[i].insPaid;
                break;
            }
        }
        return amount;
    }

    /**
     * @dev Gets the passenger credits
     *
     * @return amount of passenger credits
     */
    function getCredits(address passenger)
        external
        view
        requireIsOperational
        returns(uint creditsWei)
    {
        return credits[passenger];
    }

    /**
     * @dev Gets the contract balance
     *
     * @return contract balance
    */
    function getContractBalance()
        external
        view
        requireIsOperational
        returns(uint256)
    {
        return address(this).balance;
    }
    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Register the first airline. This is performed during initialization.
     *
     */
    function registerFirstAirline (address airline)
        internal
        requireIsOperational
    {
        require(msg.sender == contractOwner, "Only the contract owner may call this function");
        registeredAirlines[airline] = Airline({isRegistered: true, isFunded: false, airlineAddress: airline});
        registered.push(airline);
    }

   /**
    * @dev Register an airline
    *
    */
    function registerAirline(address airline, address sender)
        external
        requireIsOperational
        requireAuthorizedCaller
        requireRegisteredAirline(sender)
    {
        require(!registeredAirlines[airline].isRegistered, "Airline is already registered.");
        registeredAirlines[airline] = Airline({isRegistered: true, isFunded: false, airlineAddress: airline});
        registered.push(airline);
    }

    /**
    * @dev Get number of airlines registered
    *
    * @return the number of registered airlines
    */
    function getNumRegisteredAirlines()
        external
        view
        requireIsOperational
        returns(uint256)
    {
        return registered.length;
    }

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining.
     *
     */
     function fund(address airline)
         public
         requireIsOperational
         requireAuthorizedCaller
     {
         registeredAirlines[airline].isFunded = true;
     }

    /**
     * @dev Allows passengers to buy specified amount of insurance for a flight
     *
     */
    function buy(address passenger, string flight, uint256 insAmount, address sender)
        public
        requireIsOperational
        requireAuthorizedCaller
    {
        passengerInsurance[passenger].push(InsContract({flight: flight, passenger: passenger, insPaid: insAmount, status: InsContractStatusEnum.ACTIVE}));
        flightInsPassengers[flight].push(passenger);
    }

    /**
     * @dev Credits payouts to insurees.
     *
     */
    function creditInsuree(string flight, address passenger, uint amount)
        external
        requireIsOperational
        requireAuthorizedCaller
    {
        InsContract[] insContracts = passengerInsurance[passenger];
        for (uint i=0; i<insContracts.length; i++) {
            if ((keccak256(abi.encodePacked((insContracts[i].flight)))) == (keccak256(abi.encodePacked(flight)))) {
                insContracts[i].status = InsContractStatusEnum.PAID;
                credits[passenger] = credits[passenger].add(amount);
                break;
            }
        }

    }

    /**
     * @dev Transfers eligible payout funds to insuree.
     *
     * @return the amount that is paid to the insuree
    */
    function pay(address passenger)
        external
        payable
        requireIsOperational
        returns(uint)
    {
        require(credits[passenger] > 0, "There are no credits available.");
        uint amount  = credits[passenger];
        credits[passenger] = 0;
        //contractBalance = contractBalance.sub(amount);
        passenger.transfer(amount);
        return amount;
    }

    /**
    * @dev Enables the FlightSuretyApp to transfer money to this contract. Fallback function for funding smart contract.
    *
    */
    function()
        external
        payable
    {
        //fund();
    }


}
