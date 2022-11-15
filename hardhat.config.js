require("@nomicfoundation/hardhat-toolbox");
const projectID = "50791dddb8444475a11c1c6173faf415"
const fs = require("fs");
// const privateKey = fs.readFileSync(".secret").toString();

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    // rinkeby: {
    //   url: `https://rinkeby.infura.io/v3/${projectID}`,
    //   accounts: [privateKey]
    // }
  },
  solidity: "0.8.9",
};
