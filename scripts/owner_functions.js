const { CONNREFUSED } = require("dns");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { blue, red, yellow } = require("chalk").default;
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
  const name = await prompt(
    blue("\nIntroduceti un nume pentru campania de donatii: ")
  );
  let etherValue = await prompt(
    yellow("Introduceti VALOAREA de ETH pe care sa o stranga campania: ")
  );

  let userAdr = await prompt(
    yellow(
      "Introduceti adresa adresa userului TARGET pentru a beneficia de sumele stranse, SAU usernameul acestuia: "
    )
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
          red("\nAdresa sau usernameul nu apartin unui utilizator valid!")
        );
        return;
      }
      user = userAdr;
      userAdr = adrFromUser;
    } catch (err) {
      console.log(
        red("\nAsigurati-va ca ati introdus un user sau adresa valida!")
      );
      console.log(red("\nEroare!: "), red(err.reason));
      return;
    }
  } else {
    user = await userProfileContract.getUsername(userAdr);
  }

  try {
    etherValue = ethers.parseEther(etherValue);
  } catch (err) {
    console.log(red("\neroare! valoare introdusa pentru treshhold invalida!"));
    return;
  }
  const go = await prompt(
    yellow("\nSUNTETI sigur ca lansati campania? Scrieti X pentru anulare: ")
  );
  if (go.trim().toLowerCase() === "x") {
    console.log(yellow("\n OPERATIUNE anulata!"));
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
    console.log(blue("\ncampania de donatii se lanseaza..........."));
    await donation.wait();
    console.log(
      yellow(`\nLANSARE CU SUCCES! Campania ${name} s-a lansat pe blockchain!`)
    );
  } catch (err) {
    console.log(red("\neroare! :", err.reason));
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
  console.log(
    yellow(
      `\nVeti ${ban ? "bana" : "debana"}  userul doar pentru acest contract!`
    )
  );

  let userAdr = await prompt(
    blue(
      "\nIntroduceti adresa userului ce trebuie banat, SAU usernameul acestuia: "
    )
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
          red(
            "\nNu ai introdus o adresa valida, iar usernameul introdus nu apartine unui utilizator! Nu ai banat pe nimeni"
          )
        );
        return;
      }
      user = userAdr;
      userAdr = adrFromUser;
    } catch (err) {
      console.log(
        red("\nAsigurati-va ca ati introdus un user sau adresa valida!")
      );
      console.log(red("\nEroare!: "), red(err.reason));
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
    console.log(
      blue(`\nuserul este in proces de ${ban ? "banare" : "a fi debanat"}`)
    );
    await banUnbanUser.wait();
    console.log(
      yellow(
        `\nUSERUL ${user} cu adresa ${userAdr} a fost ${
          ban ? "banat" : "debanat"
        }`
      )
    );
    return;
  } catch (err) {
    console.log(red("\nEroare! "), red(err.reason));
  }
}

async function checkWithdrawDonation(
  prompt,
  userProfileAddress,
  address,
  wallet,
  w = false
) {
  const donationContract = new ethers.Contract(address, donationsABI, wallet);
  const adrrr = await donationContract.owner();
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
  console.log(yellow(`\nCampania este ${isActive ? "activa" : "dezactivata"}`));
  console.log(
    blue(
      `\nCampania a strans ${ethers.formatEther(
        balance
      )} eth din limita de autoWitdraw de ${ethers.formatEther(threshold)}`
    )
  );

  const donators = await donationContract.getDonors();
  console.log(blue("numar de donatori: ", donators.length));
  console.log(yellow("\nDONATORII SUNT:"));
  const userProfileContract = new ethers.Contract(
    userProfileAddress,
    userProfileABI,
    wallet
  );
  if (donators.length > 0) {
    for (let i = 0; i < donators.length; i++) {
      console.log("\n");
      const username = await userProfileContract.getUsername(donators[i]);
      const balance = await wallet.provider.getBalance(donators[i]);
      const donationValue = await donationContract.getDonation(donators[i]);
      const t_number = await wallet.provider.getTransactionCount(donators[i]);
      console.log(yellow("Username: ") + yellow(username));
      console.log(blue("\nAdresa: ") + blue(donators[i]));
      console.log(
        blue("BALANCE: ") + yellow(ethers.formatEther(balance)) + blue(" ETH")
      );
      console.log(
        blue("NUMAR TRANZACTII ISTORIC pe blockchain: ") + yellow(t_number)
      );
      console.log(
        blue("\nValoarea totala a donatiilor catre aceasta campanie: ") +
          yellow(ethers.formatEther(donationValue)) +
          " ETH"
      );
    }
  } else {
    console.log(blue("\n Nu exista donatori momentan"));
  }
  if (w) {
    const isOk = await prompt(
      yellow(
        "\nSunteti sigur ca faceti WITHDRAW MANUAL  si sa ARHIVATI CAMPANIA? Scrieti X pentru anulare. Daca doriti sa continuati, operatiunea este IREVERSIBILA!: "
      )
    );
    if (isOk.trim().toLowerCase() === "x") return;

    console.log(
      blue(`\n${ethers.formatEther(balance)} sunt in proces de retragere.....`)
    );
    try {
      const withdraw = await donationContract.withdraw();
      await withdraw.wait();
      console.log(yellow("\nretragere completa. CONTRACT DEZACTIVAT!"));
    } catch (err) {
      console.log("\neroare! ", err.reason);
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
    blue(
      "\nIntroduceti adresa userului ce trebuie banat, sau usernameul acestuia: "
    )
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
          red("\nAdresa sau usernameul nu apartin unui utilizator valid!")
        );
        return;
      }
      user = userAdr;
      userAdr = adrFromUser;
    } catch (err) {
      console.log(
        red("\nasigura te ca ai introdus un user sau adresa valida!")
      );
      console.log(red("\nEroare!: "), red(err.reason));
      return;
    }
  } else {
    user = await userProfileContract.getUsername(userAdr);
  }
  const warning = await prompt(
    yellow(
      "\nSunteti sigur ca doriti sa continuati? PENTRU anulare scrieti X: "
    )
  );
  if (warning.trim().toLowerCase() === "x") {
    console.log(yellow("\nOperatiune anulata."));
    return;
  }
  const factory = new ethers.Contract(
    factoryAddress,
    DonationFactoryABI,
    wallet
  );
  console.log("Signer address:ssssss", await wallet.getAddress());

  if (ban) {
    console.log(blue("\nuserul este BANAT global...."));
    await factory.banUserGlobal(userAdr);
    console.log(yellow("USER BANAT!"));
  } else {
    console.log(blue("\nuserul este DEBANAT global...."));
    await factory.unbanUserGlobal(userAdr);
    console.log(blue("USER DEBANAT!"));
  }
}
async function listUsers(userProfileAddress, wallet) {
  console.log(yellow("\nuserii cu conturi active pe blockchain sunt: "));
  const userProfileContract = new ethers.Contract(
    userProfileAddress,
    userProfileABI,
    wallet
  );

  const [users, bal] = await userProfileContract.getAllUsers();
  if (users.length === 0) {
    console.log(yellow("\nNu exista utilizatori inregistrati!"));
    return;
  }

  for (let i = 0; i < users.length; i++) {
    const username = await userProfileContract.getUsername(users[i]);
    console.log(yellow("Username: ") + yellow(username));
    console.log(blue("\nAdresa: ") + blue(users[i]));
    console.log(
      blue("BALANCE: ") + yellow(ethers.formatEther(bal[i])) + blue(" ETH")
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
