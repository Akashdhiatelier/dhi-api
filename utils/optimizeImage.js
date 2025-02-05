const sharp = require("sharp");

const optimizeImage = async (inputFile, outputFile, quality = 80) => {
  await sharp(inputFile).resize({ width: 1000 }).webp({ quality }).toFile(outputFile);
};

module.exports = optimizeImage;
