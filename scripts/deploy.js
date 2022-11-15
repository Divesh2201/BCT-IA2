const hre = require("hardhat");

async function main() {
	const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
	const nftCollection = await NFTCollection.deploy();
	await nftCollection.deployed();
	console.log("NFT Collection deployed to:", nftCollection.address);
	
	const NFT = await hre.ethers.getContractFactory("NFT");
	const nft = await NFT.deploy(nftCollection.address);
	await nft.deployed();
	console.log("NFT deployed to:", nft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	}
);
