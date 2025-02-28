import { isProtocolNetworkName } from "@zetachain/protocol-contracts";
import { ethers, network } from "hardhat";

import { RewardDistributor__factory, RewardDistributorFactory__factory } from "../../typechain-types";
import { getZEVMAppAddress } from "../address.helpers";

const networkName = network.name;

const readRewardData = async (rewardContractAddress: string) => {
  const [deployer] = await ethers.getSigners();
  const rewardDistributorContract = await RewardDistributor__factory.connect(rewardContractAddress, deployer);

  const stakingTokenA = await rewardDistributorContract.stakingTokenA();
  const stakingTokenB = await rewardDistributorContract.stakingTokenB();

  const rewardsToken = await rewardDistributorContract.rewardsToken();
  const stakingToken = await rewardDistributorContract.stakingToken();
  const periodFinish = await rewardDistributorContract.periodFinish();
  const rewardRate = await rewardDistributorContract.rewardRate();
  const rewardsDuration = await rewardDistributorContract.rewardsDuration();
  const lastUpdateTime = await rewardDistributorContract.lastUpdateTime();
  const rewardPerTokenStored = await rewardDistributorContract.rewardPerTokenStored();
  if (rewardRate.isZero()) return;
  console.table({
    contract: rewardContractAddress,
    lastUpdateTime: `${lastUpdateTime.toString()}-${new Date(lastUpdateTime.toNumber() * 1000).toISOString()}`,
    periodFinish: `${periodFinish.toString()}-${new Date(periodFinish.toNumber() * 1000).toISOString()}`,
    rewardPerTokenStored: rewardPerTokenStored.toString(),
    rewardRate: rewardRate.toString(),
    rewardsDuration: rewardsDuration.toString(),
    rewardsToken: rewardsToken,
    stakingToken: stakingToken,
    stakingTokenA,
    stakingTokenB
  });
};

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!isProtocolNetworkName(networkName)) throw new Error("Invalid network name");

  const factoryContractAddress = getZEVMAppAddress("rewardDistributorFactory");

  const rewardDistributorFactory = RewardDistributorFactory__factory.connect(factoryContractAddress, deployer);
  const incentivesContractsLen = await rewardDistributorFactory.incentivesContractsLen();

  const incentiveContracts: string[] = [];
  for (let i = 0; i < incentivesContractsLen.toNumber(); i++) {
    const incentiveContract = await rewardDistributorFactory.incentivesContracts(i);
    incentiveContracts.push(incentiveContract);
  }

  console.log("incentiveContracts", incentiveContracts);
  incentiveContracts.forEach(async incentiveContract => {
    await readRewardData(incentiveContract);
  });
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
