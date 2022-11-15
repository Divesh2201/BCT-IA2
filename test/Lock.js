const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("NFTCollection", function () {
  it("Should create and execute NFT transfers", async function () {
    const Collection = await ethers.getContractFactory("NFTCollection");
    const collection = await Collection.deploy();
    await collection.deployed();
    const contract_address = collection.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(contract_address);
    await nft.deployed();
    const nftContractAddress = nft.address;

    await nft.createToken("https://www.umangKaToken.com");
    await nft.createToken("https://www.sahilKaToken.com");
    await nft.createToken("https://www.anuragKaToken.com");

    await collection.createWarranty(nftContractAddress, 1, 29, 7, 2022);
    await collection.createWarranty(nftContractAddress, 2, 31, 7, 2022);
    await collection.createWarranty(nftContractAddress, 3, 29, 7, 2022);

    const [_, buyerAddress] = await ethers.getSigners();
    await collection.connect(buyerAddress).transferWarranty(nftContractAddress, 3);

    const warranty = await collection.getWarranty(3);
    const owner = warranty.owner;

    await nft.destroyToken(3, owner);
    await collection.destroyWarranty(3);

    let items = await collection.fetchAllNFTs();
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId);
      return {
        tokenId: i.tokenId.toString(),
        owner: i.owner,
        tokenUri: tokenUri,
        valid: i.valid,
        expiry: i.expiry
      }
    }));
    
    console.log(items);
  });
});


describe("History", function () {
  it("Should add Records and burn NFT if mentioned in Record.", async function () {
    const Collection = await ethers.getContractFactory("NFTCollection");
    const collection = await Collection.deploy();
    await collection.deployed();
    const contract_address = collection.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(contract_address);
    await nft.deployed();
    const nftContractAddress = nft.address;

    await nft.createToken("https://www.umangKaToken.com");
    await nft.createToken("https://www.sahilKaToken.com");
    await nft.createToken("https://www.anuragKaToken.com");

    await collection.createWarranty(nftContractAddress, 1, 29, 7, 2022);
    await collection.createWarranty(nftContractAddress, 2, 31, 7, 2022);
    await collection.createWarranty(nftContractAddress, 3, 29, 7, 2022);

    const [_, buyerAddress] = await ethers.getSigners();
    await collection.connect(buyerAddress).transferWarranty(nftContractAddress, 3);

    const availedWarrantyForEarphone = await collection.addHistory(2, 30, 7, 2022, "Repaired the earphone in one ear", false);
    const availedWarrantyForComputer = await collection.addHistory(3, 30, 7, 2022, "Replaced Computer Hard drive", true);

    console.log("Availed Earphone Warranty: ", availedWarrantyForEarphone);
    console.log("Availed Computer Warranty: ", availedWarrantyForComputer);

    let warranty = await collection.getWarranty(2);
    expect(warranty.valid).to.equal(false);

    let items = await collection.fetchMyNFTs();
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId);
      return {
        tokenId: i.tokenId.toString(),
        owner: i.owner,
        tokenUri: tokenUri,
        valid: i.valid,
        expiry: i.expiry
      }
    }));
    
    console.log(items);

    let records = await collection.getHistoryForToken(2);
    records = await Promise.all(records.map(async i => {
      return {
        date: i.date,
        description: i.description
      }
    }));
    
    console.log(records);
  });
});
