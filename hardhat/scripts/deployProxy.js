// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const DeOracle = await ethers.getContractFactory("deOracle");
  const deOracle = await upgrades.deployProxy(DeOracle);
  await deOracle.deployed();
  console.log("Box deployed to:", box.address);
}

main();
