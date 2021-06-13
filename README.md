### Moralis playground

Moralis is a service that helps to build serverless web3 dApps.

How to start:

1. Got to [Moralis.io](https://moralis.io/) and create a free account.
2. Create your server. You'll find all the docs here [https://docs.moralis.io/](https://docs.moralis.io/)
3. Clone this repo
4. Fill up your API id and your server URL in the `main.js` file
5. Run `npm install`
6. Run `npm start`
7. Go to the `localhost:3000` in your browser
7. Login with your Metamask wallet

Demo includes: 

1. Interactions with Ethereum blockchain - getting all transactions for logged in account
2. Usage of Moralis storage functionality (Notes section). Logged in user can add and remove notes. (it isn't secured in any form, all is exposed on the frontend, read more about security in [Moralis docs](https://docs.moralis.io/moralis-sdk/security))
3. File uploads handling using IPFS. Users can upload and get the files from IPFS. According to the docs, all is pinned by default.
