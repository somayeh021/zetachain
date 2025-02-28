import { getAddress, isProtocolNetworkName } from "@zetachain/protocol-contracts/dist/lib";
import { ethers, network } from "hardhat";

import { MultiChainValue, MultiChainValue__factory } from "../../typechain-types";
import { getChainId, saveAddress } from "../address.helpers";

const networkName = network.name;

async function main() {
  if (!isProtocolNetworkName(networkName)) throw new Error("Invalid network name");

  const connectorAddress = getAddress("connector", networkName);
  const zetaTokenAddress = getAddress("zetaToken", networkName);

  const Factory = (await ethers.getContractFactory("MultiChainValue")) as MultiChainValue__factory;
  const contract = (await Factory.deploy(connectorAddress, zetaTokenAddress)) as MultiChainValue;
  await contract.deployed();

  console.log("MultiChainValue deployed to:", contract.address);
  saveAddress("multiChainValue", contract.address);

  console.log("MultiChainValue post rutine...");

  networkName !== "goerli_testnet" &&
    (await (await contract.addAvailableChainId(getChainId("goerli_testnet")))
      .wait()
      .catch((e: any) => console.error(e)));

  networkName !== "mumbai_testnet" &&
    (await (await contract.addAvailableChainId(getChainId("mumbai_testnet")))
      .wait()
      .catch((e: any) => console.error(e)));

  networkName !== "bsc_testnet" &&
    (await (await contract.addAvailableChainId(getChainId("bsc_testnet"))).wait().catch((e: any) => console.error(e)));

  networkName !== "zeta_testnet" &&
    (await (await contract.addAvailableChainId(getChainId("zeta_testnet"))).wait().catch((e: any) => console.error(e)));

  console.log("MultiChainValue post rutine finish");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
