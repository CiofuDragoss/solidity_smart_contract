const { ethers } = require("hardhat");
const fs = require("fs");
const envfile = require("envfile");
const path = require("path");
async function deployUserProfile() {
  const [owner] = await ethers.getSigners();
  const UserProfileContract = await ethers.getContractFactory(
    "UserProfile",
    owner
  );
  const userProfile = await UserProfileContract.deploy();
  await userProfile.waitForDeployment();

  const DFactoryContract = await ethers.getContractFactory(
    "DonationFactory",
    owner
  );
  const donationFactory = await DFactoryContract.deploy();
  await donationFactory.waitForDeployment();
  const envPath = path.resolve(__dirname, "../.env");
  const data = fs.existsSync(envPath)
    ? envfile.parse(fs.readFileSync(envPath, "utf-8"))
    : {};

  data.USERPROFILE_KEY = userProfile.target;
  data.DONATION_FACTORY_KEY = donationFactory.target;
  const newEnvContent = envfile.stringify(data);
  fs.writeFileSync(envPath, newEnvContent, "utf-8");
}
deployUserProfile().catch(console.error);
