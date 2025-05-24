const { CONNREFUSED } = require("dns");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const userProfileABI =
  require("../artifacts/contracts/UserProfile.sol/UserProfile.json").abi;

const DonationFactoryABI =
  require("../artifacts/contracts/DonationFactory.sol/DonationFactory.json").abi;

const donationsABI =
  require("../artifacts/contracts/Donation.sol/Donation.json").abi;

const donationsBytecode =
  require("../artifacts/contracts/Donation.sol/Donation.json").bytecode;

async function createDonation(
  prompt,
  userProfileAddress,
  factoryAddress,
  wallet
) {
  const name = await prompt("\n introdu un nume pentru campania de donatii: ");
  let etherValue = await prompt(
    " introdu o valoare  pentru tinta de eth a campaniei:  "
  );

  let userAdr = await prompt(
    "Introduceti adresa adresa userului TARGET pentru a beneficia de sumele stranse , sau usernameul acestuia: "
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
        console.log("Adresa sau usernameul nu apartin unui utilizator valid!");
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

  try {
    etherValue = ethers.parseEther(etherValue);
  } catch (err) {
    console.log("\n EROARE! valoare introdusa pentru treshhold invalida!");
    return;
  }
  const factory = new ethers.Contract(
    factoryAddress,
    DonationFactoryABI,
    wallet
  );

  try {
    const donation = await factory.createCampaign(
      name,
      etherValue,
      userProfileAddress,
      userAdr,
      user
    );
    console.log("campania de donatii se lanseaza...........");
    await donation.wait();
    console.log(
      `lansare cu succes! Campania ${name} s-a lansat pe blockchain!`
    );
  } catch (err) {
    console.log("\n EROARE! :", err.reason);
    return;
  }
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

async function checkWithdrawDonation(
  prompt,
  userProfileAddress,
  address,
  wallet,
  w = false
) {
  console.log("🔑 Private Key:", wallet.privateKey);
  const donationContract = new ethers.Contract(address, donationsABI, wallet);
  const adrrr = await donationContract.owner();
  console.log("adresaa contractului de donatii: ", address);
  const isActive = await donationContract.isActive();
  const donationTarget = await donationContract.donationTarget;
  const targetUsername = await donationContract.usernameTarget();
  const threshold = await donationContract.autoWithdrawThreshold();
  let balance;
  if (isActive) {
    balance = await wallet.provider.getBalance(address);
  } else {
    balance = await donationContract.balance();
  }
  console.log(`Campania este ${isActive ? "activa" : "dezactivata"}`);
  console.log(
    `Campania a strans ${ethers.formatEther(
      balance
    )} eth din limita de autoWitdraw de ${ethers.formatEther(threshold)}`
  );

  const donators = await donationContract.getDonors();
  console.log("\nnumar de donatori: ", donators.length);
  console.log("Donatorii sunt:");
  const userProfileContract = new ethers.Contract(
    userProfileAddress,
    userProfileABI,
    wallet
  );

  for (let i = 0; i < donators.length; i++) {
    console.log("\n");
    const username = await userProfileContract.getUsername(donators[i]);
    const balance = await wallet.provider.getBalance(donators[i]);
    const donationValue = await donationContract.getDonation(donators[i]);
    const t_number = await wallet.provider.getTransactionCount(donators[i]);

    console.log(
      `Adresa: ${
        donators[i]
      }\nUsername: ${username}, BALANCE: ${ethers.formatEther(
        balance
      )}\nNUMAR TRANZACTII ISTORIC pe blockchain: ${t_number}\n Valoarea totala a donatiilor catre aceasta campanie: ${ethers.formatEther(
        donationValue
      )} ETH`
    );
  }
  if (w) {
    const isOk = await prompt(
      "Esti sigur ca doresti sa DAI WITHDRAW? apasa enter pentru IESIRE, scrie orice pentru a continua. NU TE POTI INTOARCE DACA CONTINUI.:    "
    );
    if (isOk === "") return;

    console.log(
      `${ethers.formatEther(balance)} sunt in proces de retragere.....`
    );
    try {
      const withdraw = await donationContract.withdraw();
      await withdraw.wait();
      console.log("retragere completa. CONTRACT DEZACTIVAT!");
    } catch (err) {
      console.log("eroare! ", err.reason);
    }
  }
}
async function banUserGlobal(
  prompt,
  userProfileAddress,
  factoryAddress,
  wallet,
  ban = true
) {
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
        console.log("Adresa sau usernameul nu apartin unui utilizator valid!");
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
  const warning = await prompt(
    "\nEsti sigur ca doresti sa banezi userul? PENTRU CONTINUARE scrie DA, atfel scrie orice altceva: "
  );
  if (warning !== "DA") {
    console.log("AI anulat, userul nu a fost banat!");
    return;
  }
  const factory = new ethers.Contract(
    factoryAddress,
    DonationFactoryABI,
    wallet
  );

  if (ban) {
    console.log("userul este banat global....");
    await factory.banUserGlobal(userAdr);
    console.log("USER BANAT!");
  } else {
    console.log("userul este banat global....");
    await factory.unbanUserGlobal(userAdr);
    console.log("USER DEBANAT!");
  }
}
async function listUsers(userProfileAddress, wallet) {
  console.log("\n userii cu conturi active pe blockchain sunt: ");
  const userProfileContract = new ethers.Contract(
    userProfileAddress,
    userProfileABI,
    wallet
  );

  const [users, bal] = await userProfileContract.getAllUsers();
  if (users.length === 0) {
    console.error("Nu exista utilizatori inregistrati!");
    return;
  }

  for (let i = 0; i < users.length; i++) {
    const username = await userProfileContract.getUsername(users[i]);
    console.log(
      `\n Adresa: ${
        users[i]
      }, Username: ${username}, BALANCE: ${ethers.formatEther(bal[i])}`
    );
  }
}

module.exports = {
  createDonation,
  banUnbanUserF,
  checkWithdrawDonation,
  listUsers,
  banUserGlobal,
};
