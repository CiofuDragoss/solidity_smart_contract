const { checkWallet } = require("./verify_wallet");
const { selectCampaign } = require("./select_campanie");
const { donate } = require("./user_functions");
async function UserInterface(prompt, wallet) {
  while (true) {
    console.log("\n");
    console.log("tasta 1 -> doneaza");
    console.log("tasta 2-> verifica walletul tau");
    console.log("orice alta tasta -> iesi");

    const opt = await prompt("\nAlege optiunea :");
    let address;

    switch (opt) {
      case "1":
        try {
          address = await selectCampaign(prompt);
        } catch (err) {
          console.log("eroare! ", err.message);
          break;
        }
        await donate(prompt, address, wallet);
        break;
      case "2":
        await checkWallet(wallet);
        break;
      default:
        return;
    }
  }
}
module.exports = { UserInterface };
