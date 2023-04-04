import sharp, { JpegOptions, OverlayOptions } from "sharp";

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

interface ReturnData {
  buffer: Buffer;
  base: string;
}

const mergeImages = async ({
  sources,
  options = {},
}: {
  sources: Source[];
  options?: Options;
}): Promise<ReturnData> => {
  console.log(sources.length);
  const images = await Promise.all(
    sources.map(async (source) => {
      const { src, ...data } = typeof source === "string" ? { src: source } : source;
      const image = sharp(src);
      const metadata = await image.metadata();
      return {
        buffer: await image.toBuffer(),
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

  console.log(images.length);

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
  const base64 = buffer.toString("base64");
  const base = `data:${options.format || "png"};base64,${base64}`;

  //test
  // composite.toFile("C:\\Users\\Jhonny\\Downloads\\sharp\\image.png");

  return {
    buffer,
    base,
  };
};

export default mergeImages;
