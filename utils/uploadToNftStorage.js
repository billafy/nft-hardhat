require('dotenv').config();
const { NFTStorage, File } = require('nft.storage')
const mime = require('mime')
const fs = require('fs')
const path = require('path');

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;

const nftStorage = new NFTStorage({token: NFT_STORAGE_KEY});

const storeImages = async (imagesPath) => {
	const fullImagesPath = path.resolve(imagesPath);
	const images = fs.readdirSync(fullImagesPath);
	const tokenUris = [];
	for(const image of images) {
		const imagePath = `${fullImagesPath}/${image}`
		const content = fs.readFileSync(imagePath);
		const type = mime.getType(imagePath);
		const imageStream = new File([content], path.basename(imagePath), {type});

		const imageName = image.replace(`.${type}`, '').split('-')[1].split('.')[0];

		const response = await nftStorage.store({
        	image: imageStream,
        	name: imageName,
	        description: `This is a ${imageName.toUpperCase()}`,
    	})

    	tokenUris.push(response.url);
	};
	return tokenUris;
};

module.exports = {storeImages};