const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
async function deployUserProfile() {
  const [owner] = await ethers.getSigners();
  const DonationFactory = await ethers.getContractFactory(
    "DonationFactory",
    owner
  );
  const UserProfile = await ethers.getContractFactory("UserProfile", owner);
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();
  const donationFactory = await DonationFactory.deploy();
  await donationFactory.waitForDeployment();
}
deployUserProfile().catch(console.error);
