// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IUserProfile {
    function getUsername(address _user) external view returns (string memory);
}

contract Donation {
    address public owner;
    string public name;
    bool public isActive = true;
    IUserProfile public userProfile;
    uint256 public autoWithdrawThreshold;
    mapping(address => bool) public bannedAddresses;
    mapping(address => uint256) public donations;
    event Donated(address indexed donor, uint256 amount, string username);
    event Withdrawn(address indexed to, uint256 amount);
    event UserBanned(address indexed user, string username);
    modifier onlyIfActive() {
    require(isActive, "Acest contract nu este activ,nu se mai poate dona.");
    _;
}
    modifier onlyOwner() {
        require(msg.sender == owner, "Doar daca esti owner poti sa accesezi functia");
        _;
    }

    constructor(string memory _name, address _userProfileAddr,uint256 _limit) {
        require(bytes(_name).length > 0, "Numele campaniei nu poate fi gol!");
        
        owner = msg.sender;
        name = _name;
        userProfile = IUserProfile(_userProfileAddr);
        autoWithdrawThreshold=_limit;
    }

    function donate() external payable onlyIfActive{
        require(!bannedAddresses[msg.sender], "Esti banat si nu poti dona.");
        require(msg.value >= 0.1 ether , "Donatia trebuie sa fie cel putin 0.1 ETH");

        donations[msg.sender] += msg.value;

        string memory username = userProfile.getUsername(msg.sender);
        emit Donated(msg.sender, msg.value, username);

        if (address(this).balance >= autoWithdrawThreshold) {
        uint256 amount = address(this).balance;
        payable(owner).transfer(amount);
        emit Withdrawn(owner, amount);
        isActive = false;
    }
    }

    function disableContract() external onlyOwner {
    isActive = false;
}
    function banAddress(address _address) external onlyOwner {
        bannedAddresses[_address] = true;
        string memory username = userProfile.getUsername(_address);
        emit UserBanned(_address, username);
    }

    function unbanAddress(address _address) external onlyOwner {
        bannedAddresses[_address] = false;
    }
    function withdraw() external onlyOwner {
        _doWithdraw();
    }
    
    function _doWithdraw() internal {
        uint256 bal = address(this).balance;
        require(bal > 0, "Nu exista fonduri de retras");
        payable(owner).transfer(bal);
        emit Withdrawn(owner, bal);
    }
}
