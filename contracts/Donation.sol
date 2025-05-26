// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IUserProfile {
    function getUsername(address _user) external view returns (string memory);
}

contract Donation {
    address public immutable owner;
    string public  name;
    address public immutable factory;
    uint256 public balance;
    bool public isActive = true;
    address public immutable donationTarget; 
    string public usernameTarget;
    IUserProfile public userProfile;
    uint256 public autoWithdrawThreshold;
    address[] public donors;
    mapping(address => bool) private hasDonated;
    mapping(address => bool) public bannedAddresses;
    mapping(address => uint256) public donations;
    event Donated(address indexed donor, uint256 amount, string username);
    event Withdrawn(address indexed to,string username, uint256 amount);
    event UserBanned(address indexed user, string username);
    modifier onlyIfActive() {
    require(isActive, "Acest contract nu este activ,nu se mai poate dona sau modifica.");
    _;
}

modifier onlyOwner() {
  require(
    msg.sender == owner || msg.sender == factory,
    "Doar owner sau factory poate apela"
  );
  _;
}

    constructor(string memory _name,address _owner, address _userProfileAddr,uint256 _limit,address _target,string memory _usernameTarget,address _factory) {
        userProfile = IUserProfile(_userProfileAddr);
        require(bytes(_name).length > 0, "Numele campaniei nu poate fi gol!");
        require(_target != address(0), "Target invalid");
        require(bytes(userProfile.getUsername(_target)).length > 0,
        "Targetetul nu este un user valid!");
        owner = _owner;
        name = _name;
        autoWithdrawThreshold=_limit;
        donationTarget      = _target; 
        usernameTarget      = _usernameTarget;
        factory = _factory;
    }

    function donate() external payable onlyIfActive{
        require(!bannedAddresses[msg.sender], "Esti banat si nu poti dona.");
        require(msg.value >= 0.1 ether , "Donatia trebuie sa fie cel putin 0.1 ETH");
        
        donations[msg.sender] += msg.value;
        if (!hasDonated[msg.sender]) {
            donors.push(msg.sender);
            hasDonated[msg.sender] = true;
        }
        string memory username = userProfile.getUsername(msg.sender);
        
        
        emit Donated(msg.sender, msg.value, username);
        if (address(this).balance >= autoWithdrawThreshold) {
        uint256 amount = address(this).balance;
        balance+=amount;
        payable(donationTarget).transfer(amount);
        emit Withdrawn(donationTarget,usernameTarget, amount);
        isActive = false;
    }
    }

    function disableContract() internal {
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
    function withdraw() external onlyOwner onlyIfActive{
        _doWithdraw();
    }
    
    function _doWithdraw() internal {
        uint256 bal = address(this).balance;
        balance+=bal;
        require(bal > 0, "Nu exista fonduri de retras");
        payable(donationTarget).transfer(bal);
        disableContract();
        emit Withdrawn(donationTarget,usernameTarget, bal);
    }

    function getDonors() external view returns (address[] memory) {
    return donors;
}

function getDonation(address _donor) external view returns (uint256) {
    return donations[_donor];
}
}
