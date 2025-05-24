const {
  createDonation,
  banUnbanUserF,
  checkWithdrawDonation,
  listUsers,
  banUserGlobal,
} = require("./owner_functions");
const { checkWallet } = require("./verify_wallet");
const { selectCampaign } = require("./select_campanie");
async function OwnerInterface(prompt, userProfileAddress, FactoryAddr, wallet) {
  while (true) {
    console.log("\n");
    console.log("tasta 1 -> creaza campanie de donatii");
    console.log("tasta 2 -> listeaza toti userii");
    console.log("tasta 3 -> baneaza user pentru o campanie");
    console.log("tasta 4 -> debaneaza user pentru o campanie");
    console.log("tasta 5 -> baneaza un user global");
    console.log("tasta 6-> debaneaza un user global");
    console.log("tasta 7-> verifica donatie");
    console.log("tasta 8-> verifica walletul tau");
    console.log("tasta 9-> withdraw si inchidere campanie");
    console.log("tasta 10-> transfera fonduri catre o adresa");
    console.log("orice alta tasta -> iesi");

    const opt = await prompt("\nAlege optiunea :");
    let address;
    switch (opt) {
      case "1":
        await createDonation(prompt, userProfileAddress, FactoryAddr, wallet);
        break;

      case "2":
        try {
          address = await listUsers(userProfileAddress, wallet);
        } catch (err) {
          console.log("eroare! ", err.message || err.reason);
          break;
        }
        break;
      case "3":
        try {
          address = await selectCampaign(prompt, FactoryAddr, wallet);
        } catch (err) {
          console.log(err.message);
          break;
        }
        await banUnbanUserF(prompt, address, userProfileAddress, wallet);
        break;
      case "4":
        try {
          address = await selectCampaign(prompt, FactoryAddr, wallet);
        } catch (err) {
          console.log(err.message);
          break;
        }
        await banUnbanUserF(prompt, address, userProfileAddress, wallet, false);
        break;
      case "5":
        try {
          await banUserGlobal(prompt, userProfileAddress, FactoryAddr, wallet);
        } catch (err) {
          console.log("eroare! ", err.message || err.reason);
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
        } catch (err) {
          console.log("eroare! ", err.message || err.reason);
          break;
        }

        break;
      case "7":
        try {
          address = await selectCampaign(prompt, FactoryAddr, wallet);
        } catch (err) {
          console.log(err.message);
          break;
        }
        try {
          await checkWithdrawDonation(
            prompt,
            userProfileAddress,
            address,
            wallet
          );
        } catch (err) {
          console.log("eroare! ", err.message || err.reason);
        }
        break;

      case "8":
        await checkWallet(wallet);
        break;

      case "9":
        try {
          address = await selectCampaign(prompt, FactoryAddr, wallet);
        } catch (err) {
          console.log(err.message);
          break;
        }
        await checkWithdrawDonation(
          prompt,
          userProfileAddress,
          address,
          wallet,
          true
        );
        break;
      default:
        return;
    }
  }
}

module.exports = { OwnerInterface };
