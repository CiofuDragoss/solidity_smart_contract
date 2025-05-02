const fs = require("fs");
const path = require("path");

async function selectCampaign(prompt) {
  const filePath = path.resolve(__dirname, "../deployed_donations.json");
  const json = fs.readFileSync(filePath, "utf-8");
  let data = {};
  if (json.trim().length > 0) {
    data = JSON.parse(json);
    Object.keys(data).forEach((key) => {
      const { name, address, threshold } = data[key];
      console.log(`Campania cu numele -> ${name}`);
      console.log(`adresa : ${address}`);
      console.log(`threshold: ${threshold}`);
    });
  } else {
    throw new Error("Nu exista campanii de donare momentan!");
  }
  const opt = (
    await prompt(
      "Alege una din campaniile de donatie (introducand numele acesteia complet si corect):   "
    )
  ).trim();

  if (!data[opt]) throw new Error("Ai introdus un nume de campanie invalid!");

  let address = data[opt].address;

  return address;
}

module.exports = { selectCampaign };
