import Image from "next/image";
import LoaderImage from "../../assets/images/loaderImage.png";

const Loader = ({ width = 50, height = 50, isMargin = true }) => {
  const size = {
    width: `${width}px`,
    height: `${height}px`,
  };
  return (
    <Image
      src={LoaderImage}
      alt="loader"
      className={`m-auto animate-spin ${isMargin && "mt-4"}`}
      style={size}
    />
  );
};

export default Loader;
