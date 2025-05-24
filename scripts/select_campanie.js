const { ethers } = require("ethers");
const DonationFactoryABI =
  require("../artifacts/contracts/DonationFactory.sol/DonationFactory.json").abi;
const donationsABI =
  require("../artifacts/contracts/Donation.sol/Donation.json").abi;
async function selectCampaign(prompt, factoryAddress, wallet) {
  const onlyActive = await prompt(
    "Vrei sa vezi doar campaniile active? Scrie DA daca doresti altfel apasa enter : "
  );
  const DonationFactory = new ethers.Contract(
    factoryAddress,
    DonationFactoryABI,
    wallet
  );
  let donationCampaigns;
  try {
    donationCampaigns = await DonationFactory.getCampaigns();
  } catch (err) {
    console.log("eroare la comunicarea cu blockchainul! ", err.reason);
    return;
  }
  let campaigns = [];
  if (donationCampaigns.length > 0) {
    for (const addr of donationCampaigns) {
      const donation = new ethers.Contract(addr, donationsABI, wallet);
      if (onlyActive.trim() === "DA") {
        const isActive = await donation.isActive();
        if (!isActive) {
          continue;
        }
      }
      const [name, threshold, active] = await Promise.all([
        donation.name(),
        donation.autoWithdrawThreshold(),
        donation.isActive(),
      ]);
      campaigns.push({
        name,
        address: addr,
        threshold: ethers.formatEther(threshold) + " ETH",
        active,
      });
    }
  } else {
    throw new Error("Nu exista campanii de donare momentan!");
  }
  if (campaigns.length === 0) {
    throw new Error("Nu exista campanii de donare active momentan!");
  }
  console.log("\nCampanii disponibile:");
  campaigns.forEach((c, i) => {
    console.log(`${i + 1}. nume: ${c.name}`);
    console.log(`address:   ${c.address}`);
    console.log(`threshold: ${c.threshold}`);
    console.log(`campania este: ${c.active ? "ACTIVA" : "INACTIVA"}`);
  });
  const opt = (
    await prompt(
      "Alege una din campaniile de donatie (introducand numele acesteia complet si corect):   "
    )
  ).trim();
  const found = campaigns.find((c) => c.name === opt);
  if (!found) {
    throw new Error(
      "Eroare! Nume invalid! Nu s-a găsit nicio campanie cu acel nume."
    );
  }

  return found.address;
}

module.exports = { selectCampaign };
