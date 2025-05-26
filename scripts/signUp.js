const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();
const { blue, red, yellow } = require("chalk").default;
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const owner = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);

const userProfileABI =
  require("../artifacts/contracts/UserProfile.sol/UserProfile.json").abi;

async function signUp(prompt, userProfileAddress) {
  console.log(
    yellow(
      "\n CREARE CONT PE BLOCKCHAIN. Pentru exit scrieti X la username, dupa NU se mai poate anula."
    )
  );

  const username = await prompt(blue("\nIntroduceti un username unic: "));
  if (username.trim().toLowerCase() === "x") {
    console.log(yellow("operatiune anulata"));
    return;
  }

  if (!username) {
    console.log(red("Numele introdus nu poate fi null!"));
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
      red(
        `\nUsername-ul "${username}" este deja folosit de ${existingAddr}. Alege altul.`
      )
    );
    return;
  }
  const newWallet = ethers.Wallet.createRandom().connect(provider);
  try {
    const transaction = await owner.sendTransaction({
      to: newWallet.address,
      value: ethers.parseEther("1.0"),
    });
    console.log(blue("\n.....urmeaza sa primesti fonduri..asteapta"));
    await transaction.wait();
    console.log(blue("\nai primit 1 eth pentru a putea incepe sa donezi!"));
  } catch (err) {
    console.log(red("\neroare! "), red(err.reason || err));
  }
  console.log(
    yellow(
      `\nADRESA TA PRIVATA cu care te Loghezi! se va afisa doar o singura data ,SALVEAZ O : ${newWallet.privateKey}`
    )
  );
  const userProfile = new ethers.Contract(
    userProfileAddress,
    userProfileABI,
    newWallet
  );
  try {
    const inreg = await userProfile.setUsername(username);
    console.log(blue("\n......se seteaza pe blockchain usernameul tau"));
    await inreg.wait();
    console.log(
      yellow(
        `\ncont creat! bun venit pe blockchain ${username}! Nu uita sa iti salvezi adresa privata si usernameul.`
      )
    );
    return;
  } catch (err) {
    console.error(
      red(
        "\n------------------------!!!!!!!!!!EROARE IN TIMPUL CREERI WALLETULUI : "
      ),
      red(err.reason)
    );
    return;
  }
}

module.exports = { signUp };
