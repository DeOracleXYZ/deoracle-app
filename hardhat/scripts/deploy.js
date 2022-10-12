async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const DeOracle = await ethers.getContractFactory("deOracle");
  const deOracle = await DeOracle.deploy();

  console.log("deOracle address:", deOracle.address);
}

//last deploy: 0x45Fc8fAC2E806A1AD4CbC9EcC125478897c7A100

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
