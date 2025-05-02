const { ethers } = require("ethers");

const donationsABI =
  require("../artifacts/contracts/donations.sol/Donation.json").abi;

async function donate(prompt, address, wallet) {
  let etherValue = await prompt(
    "Introdu o valoare de eth pe care doresti sa o donezi cauzei selectate:   "
  );
  try {
    etherValue = ethers.parseEther(etherValue);
  } catch (err) {
    console.log(
      "\n EROARE! valoare introdusa pentru donat are un format invalid!"
    );
    return;
  }

  const donationContract = new ethers.Contract(address, donationsABI, wallet);

  let letGo = await prompt(
    `urmeaza sa trimiti ${ethers.formatEther(
      etherValue
    )}. ESTI SIGUR ? NU SE POATE ANULA.daca DA, scrie ORICE,pentru exit apasa doar ENTER:   `
  );
  if (letGo) {
    try {
      const tx = await donationContract.donate({ value: etherValue });
      console.log(`urmeaza sa trimiti ${ethers.formatEther(etherValue)} .....`);
      await tx.wait();
      console.log("donatie realizata cu succes!");
    } catch (err) {
      console.log("eroare! :", err.reason || "Fonduri insuficiente!");
    }
  } else {
    console.log("Tranzactie anulata");
  }
}

module.exports = { donate };
