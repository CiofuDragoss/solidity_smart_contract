const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const owner = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);

async function login(prompt, userProfileAddress) {
  const privAdr = await prompt(
    " Introdu adresa privata pentru a te loga in cont: "
  );

  let wallet;

  try {
    wallet = new ethers.Wallet(privAdr, provider);
  } catch {
    console.log("CHEIA PRIVATA NU ESTE VALIDA!");
    return { isOk: false };
  }
  if (wallet.address.toLowerCase() === owner.address.toLowerCase()) {
    console.log("\n bun venit administratorule!");
    return { isOk: true, isOwner: true, wallet };
  }

  const userProfileABI =
    require("../artifacts/contracts/UserProfile.sol/UserProfile.json").abi;

  const contract = new ethers.Contract(
    userProfileAddress,
    userProfileABI,
    wallet
  );
  const has = await contract.hasProfile(wallet.address);
  if (!has) {
    console.log(
      "Adresa aceasta nu este legata de nici un wallet pe blockchain!"
    );
    return { isOk: false };
  }

  const username = await contract.getUsername(wallet.address);
  console.log(`bine ai venit inapoi draga ${username}!`);
  return { isOk: true, isOwner: false, wallet };
}

module.exports = { login };
