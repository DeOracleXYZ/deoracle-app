async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const DeOracle = await ethers.getContractFactory("deOracle");
  const deOracle = await DeOracle.deploy();

  console.log("deOracle address:", deOracle.address);
}

//last deploy: 0xC5F21a54574aA0d0d72b5B122c2B25b53417f3B6

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
