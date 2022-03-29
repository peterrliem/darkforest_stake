require("dotenv").config();
const abi = require("./stake.json"); // input abi to interact with smart contract
const ethers = require("ethers"); // make use of library

const provider = new ethers.providers.JsonRpcProvider( 
  "https://polygon-rpc.com/" // rpc connection
);
const signer = new ethers.Wallet(process.env.PV_KEY, provider); // create signer with the private key

const STAKE_ADDRESS = "0x8d528e98A69FE27b11bb02Ac264516c4818C3942"; // assign staking address

const stakingContract = new ethers.Contract(STAKE_ADDRESS, abi, signer); // create contract instance

const getNFTContract = async () => {
  const NFTAddress = await stakingContract.cryptoUnicornsAddress(); // fetching crypto unicorn's address from staking contract
  return new ethers.Contract( // create that contract
    NFTAddress,
    [
      "function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data)", // specifing function as indicated in contract abi
    ],
    signer
  );
};

const stakeNFT = async (tokenId) => { // function for staking
  const NFT = await getNFTContract();

  await NFT.safeTransferFrom(
    await signer.getAddress(),
    STAKE_ADDRESS,
    tokenId,
    ethers.constants.HashZero
  );
};

const unstakeNFT = async (tokenId) => { // after staking exit forest function
  const tx = await stakingContract.exitForest(tokenId);
  tx.wait();
};

module.exports = {
  provider,
  signer,
  STAKE_ADDRESS,
  stakingContract,
  getNFTContract,
  stakeNFT,
  unstakeNFT,
};

// export these functions and properties to be used in the main file.
