const { ethers } = require("ethers");
const { blue, red, yellow } = require("chalk").default;
const donationsABI =
  require("../artifacts/contracts/Donation.sol/Donation.json").abi;

async function donate(prompt, address, wallet) {
  let etherValue = await prompt(
    yellow(
      "\nIntroduceti o valoare ETH pe care doriti sa o donati cauzei selectate: "
    )
  );
  try {
    etherValue = ethers.parseEther(etherValue);
  } catch (err) {
    console.log(
      red("\n EROARE! valoare introdusa pentru donat are un format invalid!")
    );
    return;
  }

  const donationContract = new ethers.Contract(address, donationsABI, wallet);

  let letGo = await prompt(
    yellow(
      `urmeaza sa trimiti ${ethers.formatEther(
        etherValue
      )}. ESTI SIGUR ? NU SE POATE ANULA. Pentru anulare tastati X, altfel tranzactia este trimisa si IREVERSIBILA!: `
    )
  );
  if (letGo.trim().toLowerCase() !== "x") {
    try {
      const tx = await donationContract.donate({ value: etherValue });
      console.log(
        blue(`\nUrmeaza sa trimiti ${ethers.formatEther(etherValue)} .....`)
      );
      await tx.wait();
      console.log(yellow("\ndonatie realizata cu succes!"));
    } catch (err) {
      console.log(red("eroare! :"), red(err.reason || "Fonduri insuficiente!"));
    }
  } else {
    console.log(yellow("\nTranzactie anulata!"));
  }
}

module.exports = { donate };
