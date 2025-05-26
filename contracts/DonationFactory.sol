// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Donation.sol";

contract DonationFactory {

address[] public campaigns;
mapping(bytes32 => bool) public nameInUse;
address public immutable owner;
 modifier onlyOwner() {
        require(msg.sender == owner, "Doar daca esti owner poti sa accesezi functia");
        _;
    }


constructor() {
        
        owner = msg.sender;
    }


 event CampaignCreated(
        address indexed campaign,
        address indexed creator,
        string name,
        uint256 threshold,
        address  donationTarget,
        string usernameTarget
    );

 function createCampaign(
        string calldata _name,
        uint256 _threshold,
        address _userProfile,
        address _target,
        string calldata _usernameTarget
    ) external onlyOwner{
        bytes32 h = keccak256(bytes(_name));
         require(!nameInUse[h], "Nume deja folosit de o campanie activa");
        Donation d = new Donation(_name,msg.sender, _userProfile, _threshold,_target, _usernameTarget,address(this));
        campaigns.push(address(d));
        nameInUse[h] = true;
        emit CampaignCreated(address(d), msg.sender, _name, _threshold,_target,_usernameTarget);
    }

function getCampaigns() external view returns (address[] memory){
    return campaigns;
}
function unbanUserGlobal(address _user) external onlyOwner {
        uint len = campaigns.length;
        for (uint i = 0; i < len; i++) {
            Donation(campaigns[i]).unbanAddress(_user);
        }
    }

    function banUserGlobal(address _user) external onlyOwner {
        uint len = campaigns.length;
        for (uint i = 0; i < len; i++) {
            Donation(campaigns[i]).banAddress(_user);
        }
    }

}