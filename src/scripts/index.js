/* eslint-disable @typescript-eslint/no-var-requires */
const { config, v2 } = require("cloudinary");
const fs = require("fs").promises;
const path = require("path");

// CLOUDINARY_CLOUD_NAME=dfniu7jks
// CLOUDINARY_API_KEY=181522674338471
// CLOUDINARY_API_SECRET=4uwb6LrenXMOz14eYDLXvINDUh0

config({
  cloud_name: "dfniu7jks",
  api_key: "181522674338471",
  api_secret: "4uwb6LrenXMOz14eYDLXvINDUh0",
});

const rootDir = "../assets/weapons";

const uploadImages = async (dir) => {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      await uploadImages(filePath);
    } else {
      const { name, dir: traitDir } = path.parse(filePath);
      const [folder, slot, rarity] = traitDir.split(path.sep).slice(-3);

      if (slot.startsWith("SLOT")) {
        const fixedName = name.toLowerCase().replaceAll("-", "_");
        const publicId = `weapons/${slot.toLowerCase()}/${fixedName}`;

        await v2.uploader.upload(filePath, {
          resource_type: "image",
          public_id: publicId,
          overwrite: false,
        });

        console.log(`Subida la imagen ${publicId}`);
      }
    }
  }
};

uploadImages(rootDir).catch(console.error);
