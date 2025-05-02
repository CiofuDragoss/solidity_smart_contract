const { ethers } = require("ethers");

async function checkWallet(wallet) {
  const address = await wallet.getAddress();
  const provider = wallet.provider;
  const balance = await provider.getBalance(address);
  const t_count = await provider.getTransactionCount(address);
  console.log("Adresa portofelului:", address);
  console.log("Sold (ETH):", ethers.formatEther(balance));
  console.log("Număr tranzacții :", t_count);
}

module.exports = { checkWallet };
