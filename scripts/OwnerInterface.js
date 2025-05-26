const {
  createDonation,
  banUnbanUserF,
  checkWithdrawDonation,
  listUsers,
  banUserGlobal,
} = require("./owner_functions");
const { green, red, yellow } = require("chalk").default;
const { checkWallet } = require("./verify_wallet");
const { selectCampaign } = require("./select_campanie");
async function OwnerInterface(prompt, userProfileAddress, FactoryAddr, wallet) {
  while (true) {
    console.log(yellow("\n MENIU ADMINISTRATOR  "));
    console.log(green("tasta 1 -> creaza campanie de donatii"));
    console.log(green("tasta 2 -> listeaza toti userii"));
    console.log(green("tasta 3 -> baneaza user pentru o campanie"));
    console.log(green("tasta 4 -> debaneaza user pentru o campanie"));
    console.log(green("tasta 5 -> baneaza un user global"));
    console.log(green("tasta 6-> debaneaza un user global"));
    console.log(green("tasta 7-> verifica donatie"));
    console.log(green("tasta 8-> verifica walletul tau"));
    console.log(green("tasta 9-> withdraw si inchidere campanie"));
    console.log(green("orice alta tasta -> iesi"));

    const opt = await prompt(green("\nAlege optiunea :"));
    let address;
    switch (opt) {
      case "1":
        await createDonation(prompt, userProfileAddress, FactoryAddr, wallet);
        await prompt(green("\ncontinua (apasa orice)..."));
        break;

      case "2":
        try {
          address = await listUsers(userProfileAddress, wallet);
          await prompt(green("\ncontinua (apasa orice)..."));
        } catch (err) {
          console.log(red("eroare! "), red(err.message || err.reason));
          await prompt(green("\ncontinua (apasa orice)..."));
          break;
        }
        break;
      case "3":
        try {
          address = await selectCampaign(prompt, FactoryAddr, wallet);
        } catch (err) {
          console.log(red(err.message));
          await prompt(green("\ncontinua (apasa orice)..."));
          break;
        }
        await banUnbanUserF(prompt, address, userProfileAddress, wallet);
        await prompt(green("\ncontinua (apasa orice)..."));
        break;
      case "4":
        try {
          address = await selectCampaign(prompt, FactoryAddr, wallet);
        } catch (err) {
          console.log(red(err.message));
          await prompt(green("\ncontinua (apasa orice)..."));
          break;
        }
        await banUnbanUserF(prompt, address, userProfileAddress, wallet, false);
        await prompt(green("\ncontinua (apasa orice)..."));
        break;
      case "5":
        try {
          await banUserGlobal(prompt, userProfileAddress, FactoryAddr, wallet);
          await prompt(green("\ncontinua (apasa orice)..."));
        } catch (err) {
          console.log(red("eroare! "), red(err.message || err.reason));
          await prompt(green("\ncontinua (apasa orice)..."));
          break;
        }

        break;
      case "6":
        try {
          await banUserGlobal(
            prompt,
            userProfileAddress,
            FactoryAddr,
            wallet,
            false
          );
          await prompt(green("\ncontinua (apasa orice)..."));
        } catch (err) {
          console.log(red("eroare! "), red(err.message || err.reason));
          await prompt(green("\ncontinua (apasa orice)..."));
          break;
        }

        break;
      case "7":
        try {
          address = await selectCampaign(prompt, FactoryAddr, wallet);
        } catch (err) {
          console.log(red(err.message));
          await prompt(green("\ncontinua (apasa orice)..."));
          break;
        }
        try {
          await checkWithdrawDonation(
            prompt,
            userProfileAddress,
            address,
            wallet
          );
          await prompt(green("\ncontinua (apasa orice)..."));
        } catch (err) {
          console.log(red("eroare! "), red(err.message || err.reason));
          await prompt(green("\ncontinua (apasa orice)..."));
        }
        break;

      case "8":
        await checkWallet(wallet);
        await prompt(green("\ncontinua (apasa orice)..."));
        break;

      case "9":
        try {
          address = await selectCampaign(prompt, FactoryAddr, wallet);
        } catch (err) {
          console.log(red(err.message));
          await prompt(green("\ncontinua (apasa orice)..."));
          break;
        }
        await checkWithdrawDonation(
          prompt,
          userProfileAddress,
          address,
          wallet,
          true
        );
        await prompt(green("\ncontinua (apasa orice)..."));
        break;
      default:
        return;
    }
  }
}

module.exports = { OwnerInterface };
