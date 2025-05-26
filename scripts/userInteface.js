const { checkWallet } = require("./verify_wallet");
const { selectCampaign } = require("./select_campanie");
const { donate } = require("./user_functions");
const { green, red, yellow } = require("chalk").default;
async function UserInterface(prompt, FactoryAddr, wallet) {
  while (true) {
    console.log(yellow("\nMENIU USER"));
    console.log(green("tasta 1 -> doneaza"));
    console.log(green("tasta 2-> verifica walletul tau"));
    console.log(green("orice alta tasta -> iesi"));

    const opt = await prompt(green("\nAlege optiunea :"));
    let address;

    switch (opt) {
      case "1":
        try {
          address = await selectCampaign(prompt, FactoryAddr, wallet);
        } catch (err) {
          console.log(red(err.message));
          await prompt(green("\ncontinua (apasa orice)..."));
          break;
        }
        await donate(prompt, address, wallet);
        await prompt(green("\ncontinua (apasa orice)..."));
        break;
      case "2":
        await checkWallet(wallet);
        await prompt(green("\ncontinua (apasa orice)..."));
        break;
      default:
        return;
    }
  }
}
module.exports = { UserInterface };
