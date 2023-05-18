/* eslint-disable @typescript-eslint/no-var-requires */
const { config, v2 } = require("cloudinary");
const fs = require("fs").promises;
const path = require("path");

// Configura Cloudinary con tu Cloud Name, API Key y Secret
config({
  cloud_name: "",
  api_key: "",
  api_secret: "",
});

const rootDir = "../assets/traits";

// Recorre la estructura de carpetas y sube todas las imágenes a Cloudinary
const uploadImages = async (dir) => {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      await uploadImages(filePath);
    } else {
      const { name, dir: traitDir } = path.parse(filePath);
      const [collection, upgradeType, traitName] = traitDir.split(path.sep).slice(-3);

      const publicId = `collections/${collection}/art/${upgradeType}/${traitName}/${name}`;

      await v2.uploader.upload(filePath, {
        resource_type: "image",
        public_id: publicId,
        overwrite: false,
      });
      console.log(`Subida la imagen ${publicId}`);
    }
  }
};

uploadImages(rootDir).catch(console.error);
