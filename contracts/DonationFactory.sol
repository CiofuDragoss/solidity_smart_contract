// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Donation.sol";

contract Factory {

address public immutable userProfile;
address[] public campaigns;

constructor(address _userProfile) {
        require(_userProfile != address(0), "Zero address");
        userProfile = _userProfile;
    }


event CampaignCreated(
    address indexed campaign,
    address indexed owner,
    string name,
    uint256 threshold
);

 function createCampaign(
        string calldata _name,
        uint256 _threshold
    ) external {
        Donation d = new Donation(_name, userProfile, _threshold);
        campaigns.push(address(d));
        emit CampaignCreated(address(d), msg.sender, _name, _threshold);
    }

function getCampaigns() external view returns (address[] memory){
    return campaigns;
}

}