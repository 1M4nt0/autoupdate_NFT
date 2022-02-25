const fs = require("fs");
let { networkConfig } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = await getChainId();

	log("----------------------------------------");

	const SVGNFT = await deploy("self_updating_NFT", {
		from: deployer,
		log: true,
	});

	log(`You have deployed the NFT contract to ${SVGNFT.address}\n`);

	const svgNFTContract = await hre.ethers.getContractFactory(
		"self_updating_NFT"
	);
	const accounts = await hre.ethers.getSigners();
	const signer = accounts[0];

	let svgNFT = new hre.ethers.Contract(
		SVGNFT.address,
		svgNFTContract.interface,
		signer
	);
	const networkName = networkConfig[chainId]["name"];
	log(
		`Verify with: \n npx hardhat verify --network ${networkName} ${svgNFT.address}\n`
	);

	let transactionResponse = await svgNFT.create();
	let receipt = await transactionResponse.wait(1);

	log(`NFT minted!\n`);
	log(`You can view the tokenUri here: ${await svgNFT.tokenURI(0)}\n`);

	let owner = 0;
	let not_owner = 1;
	let temp;

	for (i = 0; i < 10; i++) {
		log(`Owner is ${owner} and not owner is ${not_owner}!`);
		log(await svgNFT.balanceOf(accounts[owner].address));
		svgNFT = new hre.ethers.Contract(
			SVGNFT.address,
			svgNFTContract.interface,
			accounts[owner]
		);
		transactionResponse1 = await svgNFT.transferFrom(
			accounts[owner].address,
			accounts[not_owner].address,
			0
		);
		await transactionResponse1.wait();
		temp = owner;
		owner = not_owner;
		not_owner = temp;
		log(`Transaction ${i} done!`);
	}

	log(`You can view the tokenUri here: ${await svgNFT.tokenURI(0)}\n`);
};
