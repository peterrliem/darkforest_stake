const { stakeNFT, unstakeNFT, stakingContract } = require("./action");

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms)); // return the promise that has a set timer that takes place at the very end
};

const clearAndMoveStart = () => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
};

const printProgress = (msg) => {
  clearAndMoveStart();
  process.stdout.write(msg);
};

const main = async () => {
  const tokenID = process.env.TOKEN_ID;

  // Stake NFT
  await stakeNFT(tokenID).catch((e) => { // staking NFT, catch the error if there is an error
    const errorBody = e.error.error.body;
    const errorBodyJSON = JSON.parse(errorBody);
    const errorMsg = errorBodyJSON.error.message;
    console.log("Staking Failed: ", errorMsg);
    process.exit(0); // end the process.
  });

  let unstakeAt = (await stakingContract.unstakesAt(tokenID)).toNumber();
  if (unstakeAt == 0) return; // go for a new iteration

  // let unstakeMilli = unstakeAt * 1000 - Date.now() + 10000; // add 10 seconds to avoid errors
  let unstakeMilli = unstakeAt * 1000 - Date.now() + 10000; // add 10 seconds to avoid errors
  let unstakeSecs = (unstakeMilli / 1000).toFixed();

  let waitInterval = setInterval(() => {
    let msg = `CountDown to unstake: ${unstakeSecs}s`;
    printProgress(msg);
    unstakeSecs -= 1;
  }, 1000);

  // sleep to when unstake opens
  await sleep(unstakeMilli); // after everything is done, clear the console.

  clearInterval(waitInterval);
  clearAndMoveStart();

  await unstakeNFT(tokenID).catch((e) => { 
    const errorBody = e.error.error.body;
    const errorBodyJSON = JSON.parse(errorBody);
    const errorMsg = errorBodyJSON.error.message;
    console.log("Claiming Failed: ", errorMsg);
    process.exit(0); 
  });
};

const run = async () => {
  let count = 0;
  while (true) {
    console.log("Iteration No. ", count);
    await main();
    count += 1; // keeps looping
  }
};

run();
