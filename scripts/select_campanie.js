const { ethers } = require("ethers");
const { blue, red, yellow } = require("chalk").default;
const DonationFactoryABI =
  require("../artifacts/contracts/DonationFactory.sol/DonationFactory.json").abi;
const donationsABI =
  require("../artifacts/contracts/Donation.sol/Donation.json").abi;
async function selectCampaign(prompt, factoryAddress, wallet) {
  const onlyActive = await prompt(
    yellow(
      "\nVrei sa vezi doar campaniile active? Scrie DA daca doresti asta : "
    )
  );

  onlyActive.trim().toLowerCase() === "da"
    ? console.log(blue("\nAfisam doar campaniile active..."))
    : console.log(blue("\nfisam TOATE campaniile..."));
  const DonationFactory = new ethers.Contract(
    factoryAddress,
    DonationFactoryABI,
    wallet
  );
  let donationCampaigns;
  try {
    donationCampaigns = await DonationFactory.getCampaigns();
  } catch (err) {
    console.log(
      red("\neroare la comunicarea cu blockchainul! "),
      red(err.reason)
    );
    return;
  }
  let campaigns = [];
  if (donationCampaigns.length > 0) {
    for (const addr of donationCampaigns) {
      const donation = new ethers.Contract(addr, donationsABI, wallet);
      if (onlyActive.trim().toLowerCase() === "da") {
        const isActive = await donation.isActive();
        if (!isActive) {
          continue;
        }
      }
      const [name, threshold, active, target, targetUsername] =
        await Promise.all([
          donation.name(),
          donation.autoWithdrawThreshold(),
          donation.isActive(),
          donation.donationTarget(),
          donation.usernameTarget(),
        ]);
      let balance;
      if (active) {
        balance = await wallet.provider.getBalance(addr);
      } else {
        balance = await donation.balance();
      }

      campaigns.push({
        name,
        address: addr,
        threshold: ethers.formatEther(threshold) + " ETH",
        active,
        target,
        targetUsername,
        balance,
      });
    }
  } else {
    throw new Error("Nu exista campanii de donare momentan!");
  }
  if (campaigns.length === 0) {
    throw new Error("Nu exista campanii de donare active momentan!");
  }
  console.log(blue("\nCampanii disponibile: "));
  campaigns.sort((a, b) => Number(b.active) - Number(a.active));
  campaigns.forEach((c, i) => {
    console.log(yellow(`\n${i + 1}. nume: ${c.name}`));
    console.log(
      yellow(
        `campania a strans pana acum: ${ethers.formatEther(c.balance)} ETH`
      )
    );
    console.log(blue(`adresa:   ${c.address}`));
    console.log(blue(`threshold: ${c.threshold}`));
    console.log(blue(`campania este: ${c.active ? "ACTIVA" : "INACTIVA"}`));
    console.log(blue(`BENEFICIARUL campaniei este: ${c.targetUsername}`));
    console.log(blue(`adresa beneficiarului este: ${c.target}`));
  });
  const opt = (
    await prompt(
      yellow(
        "\nAlege una din campaniile de donatie (introducand numele acesteia complet si corect): "
      )
    )
  ).trim();
  const found = campaigns.find((c) => c.name === opt);
  if (!found) {
    throw new Error(
      "Eroare! Nume invalid! Nu s-a găsit nicio campanie cu acest nume."
    );
  }

  return found.address;
}

module.exports = { selectCampaign };
