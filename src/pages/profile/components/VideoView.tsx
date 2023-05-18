import ReactPlayer from "react-player";
import { useState } from "react";

const VideoView = ({ children }: { children: React.ReactNode }) => {
  const [showImage, setShowImage] = useState(false);

  const handleVideoEnded = () => {
    setShowImage(true);
  };

  return (
    <div className="w-fit rounded-2xl">
      {!showImage ? (
        <ReactPlayer
          url={
            "https://res.cloudinary.com/dfniu7jks/video/upload/v1682957771/video/upgrade-video_vxcsd3.mp4"
          }
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
