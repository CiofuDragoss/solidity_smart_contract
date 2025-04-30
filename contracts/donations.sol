// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Donation{

    address public owner;
    mapping(address => bool) public bannedAddresses;
    mapping(address=>uint256) public donations;

    event Donated(address indexed donor,uint256 amount);
    event Withdrawn(address indexed to ,uint256 amount);

    modifier onlyOwner(){
        require(msg.sender==owner, "Doar daca esti owner poti sa accesezi functia");
        _;
    }

    constructor(){
        owner=msg.sender;
    }


function donate() external payable{

    require(!bannedAddresses[msg.sender], "Esti banat si nu poti dona.");

    require(msg.value>=0.1 ether , "Donatia trebuie sa fie cel putin 0.1 eth");

    donations[msg.sender]+=msg.value;

    emit Donated(msg.sender,msg.value);


}

function banAddress(address _address) external onlyOwner{
    bannedAddresses[_address]=true;
}
function unbanAddress(address _address) external onlyOwner {
        bannedAddresses[_address] = false;
    }
}