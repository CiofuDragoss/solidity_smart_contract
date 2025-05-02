require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      accounts: [
        {
          privateKey: process.env.OWNER_PRIVATE_KEY, // <- OWNER
          balance: "100000000000000000000000", // 100 ETH
        },
      ],
    },
  },
};
