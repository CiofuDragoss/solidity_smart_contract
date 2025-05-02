const readline = require("readline");
const { signUp } = require("./signUp");
const { userProfile } = require("../info.json");
const { login } = require("./login");
const { OwnerInterface } = require("./OwnerInterface");
const { UserInterface } = require("./userInteface");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function prompt(text) {
  return new Promise((resolve) => rl.question(text, resolve));
}

async function mainMenu() {
  while (true) {
    console.log("MENIU PRINCIPAL");
    console.log("tasta 1 -> Creaza wallet");
    console.log("tasta 2 -> Login in wallet cu cheia priv");
    console.log("tasta 0-> iesi ");

    const opt = await prompt("\nAlege optiunea :");

    if (opt === "1") {
      await signUp(prompt, userProfile);
    } else if (opt === "0") {
      console.log("La revedere!");
      rl.close();
      break;
    } else if (opt === "2") {
      const { isOk, isOwner, wallet } = await login(prompt, userProfile);
      if (isOk) {
        if (isOwner) {
          await OwnerInterface(prompt, userProfile, wallet);
        } else {
          await UserInterface(prompt, wallet);
        }
      }
    }
  }
}

mainMenu();
