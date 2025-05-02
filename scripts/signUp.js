const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const owner = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);

const userProfileABI =
  require("../artifacts/contracts/UserProfile.sol/UserProfile.json").abi;

async function signUp(prompt, userProfileAddress) {
  console.log("\n CREARE CONT PE BLOCKCHAIN");

  const username = await prompt(" Introdu un username unic: ");
  if (!username) {
    console.log("trebuie sa setezi un username,nu poate fi gol!");
    return;
  }
  const userProfileView = new ethers.Contract(
    userProfileAddress,
    userProfileABI,
    provider
  );
  const existingAddr = await userProfileView.getAddressByUsername(username);
  if (existingAddr !== ethers.ZeroAddress) {
    console.error(
      ` Username-ul "${username}" este deja folosit de ${existingAddr}. Alege altul.`
    );
    return;
  }
  const newWallet = ethers.Wallet.createRandom().connect(provider);
  try {
    const transaction = await owner.sendTransaction({
      to: newWallet.address,
      value: ethers.parseEther("1.0"),
    });
    console.log(".....urmeaza sa primesti fonduri..asteapta");
    await transaction.wait();
    console.log("ai primit 1 eth pentru a putea incepe sa donezi!");
  } catch (err) {
    console.log("eroare! ", err.reason || err);
  }
  console.log(
    `Adresa ta privata cu care te Loghezi! se va afisa doar o singura data ,SALVEAZ O : ${newWallet.privateKey}`
  );
  const userProfile = new ethers.Contract(
    userProfileAddress,
    userProfileABI,
    newWallet
  );
  try {
    const inreg = await userProfile.setUsername(username);
    console.log("......se seteaza pe blockchain usernameul tau");
    await inreg.wait();
    console.log(
      `cont creat! bun venit pe blockchain ${username}! Nu uita sa iti salvezi adresa privata si usernameul.`
    );
    return;
  } catch (err) {
    console.error(
      "\n------------------------!!!!!!!!!!EROARE IN TIMPUL CREERI WALLETULUI :",
      err.reason
    );
    return;
  }
}

module.exports = { signUp };
