const { ethers } = require("ethers");
const { blue, red, yellow } = require("chalk").default;
async function checkWallet(wallet) {
  const address = await wallet.getAddress();
  const provider = wallet.provider;
  const balance = await provider.getBalance(address);
  const t_count = await provider.getTransactionCount(address);
  console.log(yellow("\nDatele portofelului tau: "));
  console.log(blue("\nAdresa portofelului: "), yellow(address));
  console.log(blue("Sold (ETH): "), yellow(ethers.formatEther(balance)));
  console.log(blue("Număr tranzacții :"), yellow(t_count));
}

module.exports = { checkWallet };
