const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const userProfileABI =
  require("../artifacts/contracts/UserProfile.sol/UserProfile.json").abi;

const donationsABI =
  require("../artifacts/contracts/donations.sol/Donation.json").abi;

const donationsBytecode =
  require("../artifacts/contracts/donations.sol/Donation.json").bytecode;

async function createDonation(prompt, userProfileAddress, wallet) {
  const name = await prompt("\n introdu un nume pentru campania de donatii: ");
  let etherValue = await prompt(
    " introdu o valoare pentru (numar) pentru cati eth vrei sa strangi:  "
  );

  try {
    etherValue = ethers.parseEther(etherValue);
  } catch (err) {
    console.log("\n EROARE! valoare introdusa pentru treshhold invalida!");
    return;
  }
  const factory = new ethers.ContractFactory(
    donationsABI,
    donationsBytecode,
    wallet
  );
  let donation;
  try {
    donation = await factory.deploy(name, userProfileAddress, etherValue);
    console.log("campania de donatii se lanseaza...........");
    await donation.waitForDeployment();
    console.log(
      `lansare cu succes! Campania ${name} s-a lansat pe blockchain!`
    );
  } catch (err) {
    console.log("\n EROARE! :", err.reason);
    return;
  }

  const filepath = path.resolve(__dirname, "../deployed_donations.json");

  let data = {};
  const json = fs.readFileSync(filepath, "utf-8");
  if (json.trim().length > 0) data = JSON.parse(json);

  data[name] = {
    name,
    address: donation.target,
    threshold: ethers.formatEther(etherValue),
  };
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

async function banUnbanUserF(
  prompt,
  address,
  userProfileAddress,
  wallet,
  ban = true
) {
  console.log("vei bana userul doar pentru acest contract!");

  let userAdr = await prompt(
    "Introduceti adresa userului ce trebuie banat, sau usernameul acestuia:  "
  );

  const userProfileContract = new ethers.Contract(
    userProfileAddress,
    userProfileABI,
    wallet
  );
  let user;
  if (!ethers.isAddress(userAdr)) {
    try {
      const adrFromUser = await userProfileContract.getAddressByUsername(
        userAdr
      );

      if (adrFromUser === ethers.ZeroAddress) {
        console.log(
          "Nu ai introdus o adresa valida, iar usernameul introdus nu apartine unui utilizator! Nu ai banat pe nimeni"
        );
        return;
      }
      user = userAdr;
      userAdr = adrFromUser;
    } catch (err) {
      console.log("asigura te ca ai introdus un user sau adresa valida!");
      console.log("Eroare!: ", err.reason);
      return;
    }
  } else {
    user = await userProfileContract.getUsername(userAdr);
  }

  const donationContract = new ethers.Contract(address, donationsABI, wallet);

  try {
    let banUnbanUser;
    if (ban) {
      banUnbanUser = await donationContract.banAddress(userAdr);
    } else {
      banUnbanUser = await donationContract.unbanAddress(userAdr);
    }
    console.log(`userul este in proces de ${ban ? "banare" : "a fi debanat"}`);
    await banUnbanUser.wait();
    console.log(
      `USERUL ${user} cu adresa ${userAdr} a fost ${ban ? "banat" : "debanat"}`
    );
    return;
  } catch (err) {
    console.log("Eroare! ", err.reason);
  }
}

async function checkWithdrawDonation(prompt, address, wallet, w = false) {
  const donationContract = new ethers.Contract(address, donationsABI, wallet);
  const isActive = await donationContract.isActive();
  const threshold = await donationContract.autoWithdrawThreshold();
  const balance = await wallet.provider.getBalance(address);

  if (!w) console.log(`Campania este ${isActive ? "activa" : "dezactivata"}`);
  console.log(
    `Campania a strans ${ethers.formatEther(
      balance
    )} eth din limita de autoWitdraw de ${ethers.formatEther(threshold)}`
  );

  if (w) {
    const isOk = await prompt(
      "Esti sigur ca doresti sa DAI WITHDRAW? apasa enter pentru IESIRE, scrie orice pentru a continua. NU TE POTI INTOARCE DACA CONTINUI.:    "
    );
    if (isOk === "") return;
    const dezactivate = await prompt(
      "Doresti sa si dezactivezi campania? Scrie orice  daca DA. :    "
    );
    console.log(
      `${ethers.formatEther(balance)} sunt in proces de retragere.....`
    );
    try {
      const withdraw = await donationContract.withdraw();
      await withdraw.wait();
      console.log("retragere completa.");
    } catch (err) {
      console.log("eroare! ", err.reason);
    }
    if (dezactivate) {
      try {
        const kill = await donationContract.disableContract();
        await kill.wait();
        console.log("contract dezactivat!");
      } catch (err) {
        console.log("eroare! ", err.reason);
      }
    }
  }
}

module.exports = { createDonation, banUnbanUserF, checkWithdrawDonation };
