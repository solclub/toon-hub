import type { Canvas } from "canvas";
import { createCanvas, loadImage } from "canvas";

interface Source {
  src: string;
  x?: number;
  y?: number;
  opacity?: number;
}

interface Options {
  format?: string;
  quality?: number;
  crossOrigin?: string;
  width?: number;
  height?: number;
}

interface ReturnData {
  canvas: Canvas;
  base: string;
}

const IMAGE_JPEG = "image/jpeg";
const IMAGE_PNG = "image/png";

const mergeImages = async ({
  sources,
  options = {},
}: {
  sources: Source[];
  options?: Options;
}): Promise<ReturnData> => {
  const canvas = createCanvas(800, 800);

  const loadingSources = sources.map(async (source) => {
    const { src, ...data } = typeof source === "string" ? { src: source } : source;

    const img = await loadImage(src, {
      crossOrigin: options.crossOrigin || "anonymous",
    });

    return {
      src,
      img,
      ...data,
    };
  });

  const images = await Promise.all(loadingSources);

  const ctx = canvas.getContext("2d");
  ctx.globalAlpha = 1;

  images.forEach((image) => {
    ctx.globalAlpha = image.opacity ?? 1;
    ctx.drawImage(image.img, image.x ?? 0, image.y ?? 0);
  });

  canvas.width = options.width ?? Math.max(...images.map((image) => image.img.width));
  canvas.height = options.height ?? Math.max(...images.map((image) => image.img.height));

  let base = "";
  if (options.format === IMAGE_JPEG) {
    base = canvas.toDataURL(IMAGE_JPEG, options.quality || 0.92);
  } else if (options.format === IMAGE_PNG) {
    base = canvas.toDataURL(IMAGE_PNG);
  }

  return {
    canvas,
    base,
  };
};

export default mergeImages;
