const { run } = require("hardhat");

module.exports = async (address, constructorArguments) => {
	try {
		await run("verify:verify", {
			address,
			constructorArguments,
		});
	} catch (err) {
		console.error(err);
	}
};