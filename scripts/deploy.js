const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
async function deployUserProfile() {
  const [owner] = await ethers.getSigners();

  const UserProfile = await ethers.getContractFactory("UserProfile", owner);
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();
  const address = userProfile.target;
  const output = {
    userProfile: address,
  };

  const filePath = path.resolve(__dirname, "../info.json");
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
}
deployUserProfile().catch(console.error);
