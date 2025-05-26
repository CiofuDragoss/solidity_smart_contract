const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();
const { blue, red, yellow } = require("chalk").default;
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const owner = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);

async function login(prompt, userProfileAddress) {
  const privAdr = await prompt(
    yellow(
      "Introduceti adresa privata pentru a va loga. Pentru exit scrieti X: "
    )
  );

  if (privAdr.trim().toLowerCase() === "x") {
    console.log(yellow("operatiune anulata"));
    return { isOk: false };
  }
  let wallet;

  try {
    wallet = new ethers.Wallet(privAdr, provider);
  } catch {
    console.log(red("\nCHEIA PRIVATA NU ESTE VALIDA!"));
    return { isOk: false };
  }
  if (wallet.address.toLowerCase() === owner.address.toLowerCase()) {
    console.log(yellow("\nBun venit administratorule!"));
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
      red("\nAdresa aceasta nu este legata de nici un wallet pe blockchain!")
    );
    return { isOk: false };
  }

  const username = await contract.getUsername(wallet.address);
  console.log(yellow(`\nBine ai venit inapoi draga ${username}!`));
  return { isOk: true, isOwner: false, wallet };
}

module.exports = { login };
