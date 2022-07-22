require('dotenv').config();
const pinataSdk = require('@pinata/sdk');
const path = require('path');
const fs = require('fs');

const pinataApiKey = process.env.PINATA_API_KEY || '9bbd863ed8acdbd3b951';
const pinataApiSecretKey = process.env.PINATA_API_SECRET_KEY || '0c319d6d12ff95ec7709bc6a5dfd21b399222a67e70870f8b4c0cb74f462fc00';

const pinata = pinataSdk(pinataApiKey, pinataApiSecretKey);

const storeImages = async (imagesPath) => {
	const fullImagesPath = path.resolve(imagesPath);
	const images = fs.readdirSync(fullImagesPath);
	const responses = [];
	for(const image of images) {
		console.log(image);
		const imageStream = fs.createReadStream(`${fullImagesPath}/${image}`);
		try {
			const response = await pinata.pinFileToIPFS(imageStream);
			responses.push(response)
		} catch (error) {
			console.error(error);
		}
	}
	return {responses, images};
};

const storeTokenUriMetadata = async (metadata) => {
	const response = await pinata.pinJSONToIPFS(metadata);
	return response;
};

module.exports = {storeTokenUriMetadata, storeImages};