import classNames from "classnames";
import React from "react";
import Panel from "./Panel";

export enum FrameType {
  default = "bg-[#BEA97E] bg-gradient-to-t from-[#BEA97E] via-[#6e5a37] to-[#BEA97E]",
  green = "bg-green-400",
  gray = "bg-gray-600",
}

type FrameProps = {
  children: React.ReactNode;
  className?: string;
  index?: number;
  frameType?: FrameType | (() => FrameType);
};

const FrameBox = ({ children, className, index, frameType }: FrameProps) => {
  let frameTypeResult = "";
  if (typeof frameType == "function") {
    frameTypeResult = frameType();
  } else {
    frameTypeResult = frameType ?? FrameType.default;
  }

  return (
    <Panel
      index={index}
      className={classNames(
        className,
        "clip-wrap h-fit  p-[0.27rem]",
        frameTypeResult
      )}
    >
      <div className="clip-css aspect-square bg-black p-0.5">
        <div className="clip-css delay-50 aspect-square bg-slate-900 ">
          {children}
        </div>
      </div>
    </Panel>
  );
};

export default FrameBox;
