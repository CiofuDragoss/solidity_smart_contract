# Solidity smart contract Donations Project

This project uses Hardhat, Solidity, and Node.js to demonstrate basic smart contract functionality and blockchain interactions.

I uploaded the `.env` file with the owner's private key, so you can run the project as fast as possible.

### How to run

```bash

# In the root folder, run the .ps1 file
./start.ps1

```

It will open two PowerShell terminals.

On the left is the Hardhat blockchain node, on the right is our Node.js terminal interface.

On initialization, the UserProfile contract is deployed to the blockchain using the owner's signature.

You can configure Hardhat to create test accounts on startup.

In our setup, the blockchain has only the owner account and the UserProfile contract deployed.

##### If you close the Hardhat terminal, clear the `deployed_donations.json` file before restarting.

![interface](https://github.com/user-attachments/assets/a071cfb9-2e36-4b21-92b9-2f8c8b22376a)

### Blockchain contracts quick explanation

First, let's explain what happens on the blockchain.

We have two smart contracts:

**Donation** will have as many instances as the owner wants. He is the only one who can deploy donation campaigns.

**UserProfile** has only one instance, created at blockchain startup, which interacts with all donation campaigns.

#### Owner interactions:

The owner can ban or unban users in a specific donation campaign by using the user's public address or username. He can withdraw all ETH from a campaign and deactivate it for donations.

#### User interactions:

The user can only donate to a selected campaign from their wallet.

#### The UserProfile contract exposes view and external functions with no modifiers, so anyone can call them.

## Use examples

### Create Wallet

When we create a valid wallet (username not empty or not already taken), we automatically transfer 1 ETH from the owner so the wallet is visible on the blockchain.

![image](https://github.com/user-attachments/assets/b483c6fe-9531-405c-95e9-e54ca72db276)

### User Login

If the owner logs in, he has many more options than a user. In this example, a user logged in and checked their wallet.

A user can only log in with their private key (not username, as stated in the option text—this was fixed in the final commit).

![user\_login](https://github.com/user-attachments/assets/58760649-ea80-479a-a3fb-99a64d2f6573)

### Owner logs in and creates donation campaigns

We see the owner panel after logging in with the private key.

The owner creates a valid donation campaign, then tries again with an invalid ETH amount and receives an error.

#### The created campaigns are saved in a JSON file for ease of use with JavaScript.

![create\_donations\_good](https://github.com/user-attachments/assets/c9857585-8d18-4ac7-874f-4a0f76e2e4bc)

### User donates

The user is prompted with a list of donation campaigns to choose from.

If they are not banned, the campaign is active, and they have enough funds, they can contribute.

![user\_donated](https://github.com/user-attachments/assets/d7349f2d-7966-456e-b400-b5ff41a72ffa)

### User gets banned / unbanned

The owner bans a user (in this case, bossman :)).

![ban user](https://github.com/user-attachments/assets/63b34039-9d78-47dc-bbc9-fc4334e012b7)

#### Now if the user tries to donate to the campaign they are banned from, the donation is denied. They can still donate to other campaigns.

![donation\_if\_banned](https://github.com/user-attachments/assets/2bfe5a5e-bf4e-4b5a-bdf1-3300f9794d9c)

#### The owner can unban the user at any time.

### User tries to donate to a deactivated campaign

The user selects a campaign and tries to donate. If the campaign is deactivated, they receive an error, but can donate to another active campaign.

![nu pot dona , dezactivat](https://github.com/user-attachments/assets/d51551c4-b446-4e19-956b-3b684f20aba2)

### Verify 0.2 ETH donation after deactivation of "pisici"

![donatie\_dupa dezactivare pisici](https://github.com/user-attachments/assets/92b01103-be06-4123-a1d9-b6d4f492a427)

### Owner withdraws funds

First, let's look at the owner's wallet before two withdrawals:

![wallet\_inainte\_owner](https://github.com/user-attachments/assets/86a7ac32-de57-440e-bd7c-b76a09488467)

Each campaign has a threshold. When that threshold is reached, the campaign automatically deactivates and transfers funds to the owner.

In this example, the owner deactivated and withdrew all funds from a campaign:

![dezactivaste\_withdraw](https://github.com/user-attachments/assets/737de817-0554-4ff8-8f88-1af3fa22ad8f)

Here, he withdraws funds without deactivation:

![withdraw\_fara\_kill](https://github.com/user-attachments/assets/ff44d212-c728-40e1-b620-0bc079b2b167)

He withdrew 0.5 ETH from the above campaign (see balance difference).

### Contract auto-withdraw threshold

A user donates to reach the threshold (0.5 ETH):

![donatie in threshold](https://github.com/user-attachments/assets/f84b50cc-c102-4866-be04-60dacba419b4)

Now the owner checks the campaign—it is closed and the balance is zero (all on-chain):

![verificare functie threshold auto contract](https://github.com/user-attachments/assets/c79171d3-44ca-4fcc-85a3-eadab3bc6d7c)





