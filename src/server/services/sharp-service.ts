import axios from "axios";
import type { OverlayOptions } from "sharp";
import sharp from "sharp";

interface Source {
  src: string;
  x?: number;
  y?: number;
  opacity?: number;
}

interface Options {
  format?: "jpeg" | "png";
  quality?: number;
  width?: number;
  height?: number;
}

const mergeImages = async ({
  sources,
  options = {},
}: {
  sources: Source[];
  options?: Options;
}): Promise<Buffer> => {
  const images = await Promise.all(
    sources.map(async (source) => {
      const { src, ...data } = typeof source === "string" ? { src: source } : source;
      console.log("imageUrl: ", src);
      const buffer = Buffer.from(
        (await axios.get(src, { responseType: "arraybuffer" })).data,
        "binary"
      );
      const image = isUrl(src) ? sharp(buffer) : sharp(src);

      const metadata = await image.metadata();

      console.log("image processed ✅: ", src);
      return {
        buffer: buffer,
        width: metadata.width || 0,
        height: metadata.height || 0,
        ...data,
      };
    })
  );

  const canvasWidth = options.width || Math.max(...images.map((i) => i.width));
  const canvasHeight = options.height || Math.max(...images.map((i) => i.height));
  const composite = sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).png();

  const overlayImages: OverlayOptions[] = images.map((image) => {
    return {
      input: image.buffer,
      // gravity: "northwest",
      left: image.x || 0,
      top: image.y || 0,
    };
  });
  composite.composite(overlayImages);

  const buffer = await composite.png().toBuffer();

  return buffer;
};

const isUrl = (str: string): boolean => {
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return urlRegex.test(str);
};

export default mergeImages;
