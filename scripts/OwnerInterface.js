const {
  createDonation,
  banUnbanUserF,
  checkWithdrawDonation,
} = require("./owner_functions");
const { checkWallet } = require("./verify_wallet");
const { selectCampaign } = require("./select_campanie");
async function OwnerInterface(prompt, userProfileAddress, wallet) {
  while (true) {
    console.log("\n");
    console.log("tasta 1 -> creaza campanie de donatii");
    console.log("tasta 2 -> baneaza user");
    console.log("tasta 3 -> debaneaza user");
    console.log("tasta 4-> verifica sold donatie");
    console.log("tasta 5-> verifica walletul tau");
    console.log("tasta 6-> withdraw si inchidere campanie+");
    console.log("orice alta tasta -> iesi");

    const opt = await prompt("\nAlege optiunea :");
    let address;
    switch (opt) {
      case "1":
        await createDonation(prompt, userProfileAddress, wallet);
        break;
      case "2":
        try {
          address = await selectCampaign(prompt);
        } catch (err) {
          console.log("eroare! ", err.message);
          break;
        }
        await banUnbanUserF(prompt, address, userProfileAddress, wallet);
        break;
      case "3":
        try {
          address = await selectCampaign(prompt);
        } catch (err) {
          console.log("eroare! ", err.message);
          break;
        }
        await banUnbanUserF(prompt, address, userProfileAddress, wallet, false);
        break;
      case "4":
        try {
          address = await selectCampaign(prompt);
        } catch (err) {
          console.log("eroare! ", err.message);
          break;
        }
        await checkWithdrawDonation(prompt, address, wallet);
        break;

      case "5":
        await checkWallet(wallet);
        break;

      case "6":
        try {
          address = await selectCampaign(prompt);
        } catch (err) {
          console.log("eroare! ", err.message);
          break;
        }
        await checkWithdrawDonation(prompt, address, wallet, true);
        break;
      default:
        return;
    }
  }
}

module.exports = { OwnerInterface };
