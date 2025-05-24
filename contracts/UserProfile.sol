// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract UserProfile {
    address public immutable owner;

     address[] public users;      
    mapping(address => string) private usernames;

    
    mapping(address => bool) public hasProfile;

    
    mapping(string => address) public nameToAddress;

    
    event UsernameSet(address indexed user, string username);

    
    modifier onlyOwner() {
        require(msg.sender == owner, "Doar ownerul poate face asta");
        _;
    }

    
    constructor() {
        owner = msg.sender;
    }

    
    function setUsername(string calldata _username) external {
        
        require(bytes(_username).length > 0, "Username-ul nu poate fi gol");

        
        require(!hasProfile[msg.sender], "Ai deja un username");

        
        require(nameToAddress[_username] == address(0), "Username deja folosit");

       
        usernames[msg.sender] = _username;
        hasProfile[msg.sender] = true;

        
        nameToAddress[_username] = msg.sender;

       users.push(msg.sender); 
        emit UsernameSet(msg.sender, _username);
    }

   
    function getUsername(address _user) external view returns (string memory) {
        return usernames[_user];
    }

    
    function getAddressByUsername(string calldata _username) external view returns (address) {
        return nameToAddress[_username];
    }

    function getAllUsers() external view returns (address[] memory allUsers, uint256[] memory ethBalances) {
        allUsers = users;
        ethBalances = new uint256[](users.length);
        for (uint256 i = 0; i < users.length; i++) {
            ethBalances[i] = users[i].balance;
        }
    }
}