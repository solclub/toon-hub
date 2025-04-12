import ReactPlayer from "react-player";
import { useState } from "react";

type VideoViewType = "NFT_UPGRADE" | "ROLL_WEAPON_SLOT";

const VideosURLs: Record<VideoViewType, string> = {
  NFT_UPGRADE:
    "https://res.cloudinary.com/dfniu7jks/video/upload/v1682957771/video/upgrade-video_vxcsd3.mp4",
  ROLL_WEAPON_SLOT:
    "https://res.cloudinary.com/dveuv13td/video/upload/v1743723147/qswntirrr2gt005swaid.mp4",
};

const VideoView = ({ children, type }: { children: React.ReactNode; type: VideoViewType }) => {
  const [showImage, setShowImage] = useState(false);

  const handleVideoEnded = () => {
    setShowImage(true);
  };

  return (
    <div className="w-fit rounded-2xl">
      {!showImage ? (
        <ReactPlayer
          url={VideosURLs[type]}
          height={480}
          width={480}
          playing={true}
          onEnded={handleVideoEnded}
        />
      ) : (
        <div className="mx-auto w-2/3 rounded-2xl">{children}</div>
      )}
    </div>
  );
};

export default VideoView;
