
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Definition


Start-Process -FilePath "powershell.exe" `
  -WorkingDirectory $projectDir `
  -ArgumentList "-NoExit", "-Command", "npx hardhat node"


Start-Process -FilePath "powershell.exe" `
  -WorkingDirectory $projectDir `
  -ArgumentList "-NoExit", "-Command", "npx hardhat run scripts/deploy.js --network localhost; node scripts/interface.js"
