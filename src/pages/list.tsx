import React from "react";
import Image from "next/image";
import classnames from "classnames";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import FrameBox from "../components/common/FrameBox";
import Loader from "../components/common/Loader";

const Profile = () => {
  const { isLoading, data } = trpc.nfts.getUserNFTs.useQuery();

  return (
    <div className="mt-8 flex flex-wrap">
      <div className="w-full text-2xl">My Collection</div>
      <div className="w-full pt-3 font-thin">Select the characters to customize</div>

      <div className="flex w-full flex-wrap justify-center gap-y-6 gap-x-4 pt-8 pb-20">
        {isLoading && (
          <div>
            <Loader></Loader>
          </div>
        )}
        {(data ?? []).map((x, i) => (
          <FrameBox key={x.mint} index={i + 1}>
            <div
              className={classnames(
                "relative h-full transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-110"
              )}
            >
              <Link href={"/profile/" + x.mint}>
                <Image
                  className="octagon rounded-3xl border-solid "
                  src={x.image}
                  alt="Picture of the author"
                  width={300}
                  height={300}
                ></Image>
                <div className="to-transparen absolute bottom-0 h-3/4 w-full bg-gradient-to-t from-black"></div>
                <div className="absolute bottom-5 w-full items-center text-center text-2xl ">
                  {x.name}
                </div>
              </Link>
            </div>
          </FrameBox>
        ))}
      </div>
    </div>
  );
};

export default Profile;
