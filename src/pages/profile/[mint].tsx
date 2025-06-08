import { useState, useEffect } from "react";
import Image from "next/image";
import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import Panel from "components/common/Panel";
import Loader from "components/common/Loader";
import NftVersion from "./components/NFTVersion";
import type { UserNFT } from "server/database/models/user-nfts.model";
import { ProductType } from "server/database/models/catalog.model";
import type { RudeNFT } from "server/database/models/nft.model";
import { trpc } from "utils/trpc";
import { getRudeNftName } from "utils/nfttier";
import classNames from "classnames";
import NftHidden from "assets/images/skin.png";
import LeaderBoardIcon from "assets/images/leaderboard_icon.png";
import PowerRatingIcon from "assets/images/power_rating_icon.png";
import TierIcon from "assets/images/tier_icon.png";
import WeaponsIcon from "assets/images/weapons_icon.png";
import { useNFTManager } from "contexts/NFTManagerContext";
import { Modal } from "components/common/Modal";
import FeatureNFT from "pages/profile/components/FeatureNFT";
import { toPascalCase } from "utils/string-utils";
import VideoView from "./components/VideoView";
import type { Product } from "server/database/models/catalog.model";
import type { WarriorEquipment } from "server/database/models/equipped-weapon.model";
import BuyEquipment from "./components/BuyEquipment";
import { isGiblatoonsLive } from "utils/giblatoons";
import GiblatoonBanner from "./components/GiblatoonsBanner";
import MainButton from "components/common/MainButton";

type NFTInfo = RudeNFT & {
  user: UserNFT | undefined;
};

const Profile: NextPage = () => {
  const [isOnUpgradeVideoModalOpen, setOnUpgradeVideoModalOpen] = useState(false);
  const [isOnBuyWeaponModalOpen, setOnBuyWeaponModalOpen] = useState<{
    state: boolean;
    imageUrl?: string;
  }>({ state: false, imageUrl: "" });
  const [isOpen, setOpen] = useState(false);
  const [profileNavState, setProfileNavState] = useState({ current: 0, before: -1, after: 1 });
  const router = useRouter();
  const { getProduct, paymentChannel } = useNFTManager();
  const { mint } = router.query;
  const utils = trpc.useContext();

  const [featureProduct] = getProduct(ProductType.NFT_FEATURE) ?? [{ options: [] }];

  const { data: profileNFT, isLoading: isProfileLoading } = trpc.nfts.getUserNFTbyMint.useQuery({
    mint: (mint ?? "") as string,
  });

  const { data: isFeaturedData, isLoading: isLoadingFeatured } =
    trpc.featureNft.userFeaturedNftByMint.useQuery({
      mint: (mint ?? "") as string,
    });

  const { data: mintPosition } = trpc.leaderboard.getItemPosition.useQuery({
    mint: mint as string,
  });

  const { data: equippedWeapons } = trpc.weapons.equippedWeapons.useQuery({
    mint: (mint || "") as string,
  });

  const { data: userMints } = trpc.nfts.getUserMints.useQuery();

  useEffect(() => {
    paymentChannel.on("payment_success", handlePaymentSuccess);
    return () => {
      paymentChannel.removeListener("payment_success", handlePaymentSuccess);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaymentSuccess = (type: ProductType, imageUrl?: string) => {
    switch (type) {
      case ProductType.NFT_ART_SWAP:
        break;
      case ProductType.NFT_UPGRADE:
        utils.nfts.getUserNFTbyMint.invalidate();
        setOnUpgradeVideoModalOpen(true);

        break;
      case ProductType.NFT_FEATURE:
        break;

      case ProductType.WEAPON_SLOT:
        utils.weapons.equippedWeapons.invalidate();
        setOnBuyWeaponModalOpen({ state: true, imageUrl });
        break;

      default:
        console.error(type);
        break;
    }
  };

  useEffect(() => {
    if (mint && userMints) {
      if ((userMints ?? []).length > 0) {
        const current = userMints?.indexOf(mint as string);
        function getNextOrBeforeProfile(
          strings: string[],
          isNext: boolean,
          currentIndex: number
        ): number {
          if (isNext) {
            const nextIndex = currentIndex + 1;
            return nextIndex < strings.length ? nextIndex : 0;
          } else {
            const previousIndex = currentIndex - 1;
            return previousIndex >= 0 ? previousIndex : strings.length - 1;
          }
        }
        setProfileNavState({
          current,
          before: getNextOrBeforeProfile(userMints, false, current),
          after: getNextOrBeforeProfile(userMints, true, current),
        });
      }
    }
  }, [mint, userMints]);

  return (
    <div className="overflow-hidden">
      <div className="flex w-full justify-between">
        <div className="p-2 border-[1px] border-zinc-800 rounded-xl">
          <Link href={"/profile/" + userMints?.[profileNavState.before]}>
            <span className="w-5/12 font-sans font-bold text-center">{"< BEFORE"}</span>
          </Link>
        </div>

        <span>
          <div className="hidden w-5/12 text-3xl font-extrabold lg:inline">
            {profileNFT?.name}
          </div>
        </span>

        <div className="p-2 border-[1px] border-zinc-800 rounded-xl">
          <Link href={"/profile/" + userMints?.[profileNavState.after]}>
            <span className="w-5/12 font-sans font-bold">{"NEXT >"}</span>
          </Link>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-x-4">
        <div className="w-full lg:w-2/6">
          <div className="relative h-[500px] w-full rounded-2xl">
            {profileNFT?.image ? (
              <Image
                className="absolute max-h-[500px] rounded-2xl object-cover"
                src={profileNFT?.images.get(profileNFT?.current) ?? profileNFT?.image}
                alt={profileNFT?.name}
                fill
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div>
                  <Loader></Loader>
                </div>
              </div>
            )}
            <div className="absolute right-1 top-1">
              <div className="dropdown">
                <label tabIndex={0} className="m-1 cursor-pointer">
                  <svg
                    className="inline-block h-6 align-middle"
                    id="info-circle"
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="white"
                      d="M12,2A10,10,0,1,0,22,12,10.01114,10.01114,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8.00917,8.00917,0,0,1,12,20Zm0-8.5a1,1,0,0,0-1,1v3a1,1,0,0,0,2,0v-3A1,1,0,0,0,12,11.5Zm0-4a1.25,1.25,0,1,0,1.25,1.25A1.25,1.25,0,0,0,12,7.5Z"
                    ></path>
                  </svg>
                </label>
                <div
                  tabIndex={0}
                  className="card-compact card dropdown-content w-72 bg-black bg-opacity-30 backdrop-blur-sm backdrop-filter"
                >
                  <div className="card-body">
                    <h3 className="card-title">Want to Feature your NFT?</h3>
                    <p>
                      By taking this action, you have the opportunity to be featured on the main
                      page. Featured warriors are updated every 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 h-[60%] w-full  rounded-2xl bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-0 h-[60%] w-full">
              <div className="absolute bottom-8 left-5 lg:left-10 flex flex-col items-center">
                <span className="text-3xl">
                  {toPascalCase(profileNFT?.type ?? "")}
                </span>
                <span className="text-4xl text-[#ffe75c]">
                  {isProfileLoading
                    ? "Loading..."
                    : getRudeNftName(profileNFT?.name) || "Unknown"}
                </span>
              </div>

              <div className="absolute bottom-9 right-5 lg:right-10">
                {featureProduct?.options[0] && profileNFT && (
                  <>
                    {isLoadingFeatured && <Loader></Loader>}
                    {!isFeaturedData?.featuredNFT ? (
                      <>
                        <MainButton
                          color="yellow"
                          buttonClassName="py-2"
                          className="font-sans font-bold"
                          onClick={() => {
                            setOpen(true);
                          }}
                        >
                          FEATURE YOUR TOON!
                        </MainButton>
                      </>
                    ) : (
                      <MainButton color="blue" className="disabled cursor-default">
                        🚀 In Queue!
                      </MainButton>
                    )}

                    <Modal
                      isOpen={isOpen}
                      backdropDismiss={true}
                      handleClose={() => setOpen(false)}
                    >
                      <FeatureNFT
                        nft={profileNFT}
                        featureOption={featureProduct.options[0]}
                        sourceImageUrl={profileNFT?.images?.get(profileNFT?.current)}
                      ></FeatureNFT>
                    </Modal>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 w-full grid grid-cols-2 2xl:grid-cols-4 gap-3 justify-items-center">
            {[
              {
                title: "Leaderboard",
                icon: LeaderBoardIcon,
                value: mintPosition?.item ?? "...",
              },
              {
                title: "Power Rating",
                icon: PowerRatingIcon,
                value: equippedWeapons?.warriorTotalPower?.toFixed(2) ?? profileNFT?.power,
              },
              {
                title: "Tier",
                icon: TierIcon,
                value: profileNFT?.tier,
              },
              {
                title: "Weapons",
                icon: WeaponsIcon,
                value: equippedWeapons?.slots?.filter((x) => x.status === "unlocked")?.length || 0,
              },
            ].map((x) => (
              <div key={x.title} className={classNames("h-[150px] max-w-28 p-2 w-full flex flex-col items-center justify-between gap-4 bg-gray-900 rounded-xl", {
                "loading-effect opacity-20": isProfileLoading,
              })}>
                <span className="text-sm">{x.title}</span>
                <Image
                  className="mx-auto"
                  src={x.icon}
                  alt={x.title}
                  width={x.title === "Weapons" ? 60 : 60}
                />
                <span className="text-[#ffe75c] font-sans font-bold">{x.value}</span>
              </div>
            ))}
          </div>
        </div>
        <Panel className="mt-3 flex w-full flex-wrap rounded-md p-8 lg:mt-0 lg:max-w-[65%] ">
          {profileNFT && profileNFT?.type && (
            <CustomizePanel
              warriorEquipment={equippedWeapons}
              nft={profileNFT}
              upgradeProducts={getProduct(ProductType.NFT_UPGRADE, profileNFT?.type)?.[0]}
              swapProducts={getProduct(ProductType.NFT_ART_SWAP, profileNFT?.type)?.[0]}
              slotProducts={getProduct(ProductType.WEAPON_SLOT)?.[0]}
            ></CustomizePanel>
          )}
        </Panel>
      </div>
      <Modal
        className="w-full "
        isOpen={isOnUpgradeVideoModalOpen}
        backdropDismiss={true}
        handleClose={() => setOnUpgradeVideoModalOpen(false)}
      >
        <VideoView type="NFT_UPGRADE">
          <Image
            src={profileNFT?.images?.get(profileNFT.current) ?? NftHidden}
            alt={"Golem Image"}
            width={800}
            height={800}
          ></Image>
        </VideoView>
      </Modal>

      <Modal
        className="w-full "
        isOpen={isOnBuyWeaponModalOpen.state}
        backdropDismiss={true}
        handleClose={() => setOnBuyWeaponModalOpen({ state: false })}
      >
        <VideoView type="ROLL_WEAPON_SLOT">
          <Image
            src={isOnBuyWeaponModalOpen.imageUrl ?? WeaponsIcon}
            alt={"Golem Image"}
            width={800}
            height={800}
          ></Image>
        </VideoView>
      </Modal>
    </div>
  );
};

type ArmoryProps = {
  nft?: NFTInfo;
  warriorEquipment: WarriorEquipment | null | undefined;
  upgradeProducts: Product | undefined;
  swapProducts: Product | undefined;
  slotProducts: Product | undefined;
};

const CustomizePanel = ({
  warriorEquipment,
  nft,
  upgradeProducts,
  swapProducts,
  slotProducts,
}: ArmoryProps) => {
  const upgradeOpts = upgradeProducts?.options;
  const swapArtOpts = swapProducts?.options;
  const slotOpts = slotProducts?.options;

  console.log("upgradeOpts", upgradeOpts);

  return (
    <>
      <h2 className="w-full text-3xl text-center mb-10">
        Toonify your characters
      </h2>
      <div className="flex justify-center gap-4">
        {upgradeOpts &&
          !isGiblatoonsLive &&
          upgradeOpts
            .filter((x) => x.key === "ORIGINAL")
            .filter((x) =>
              nft?.attributes.find((x) => x.name === "Background")?.value == "God"
                ? x.key == "ORIGINAL" && true && x.isAvailable
                : x.isAvailable
            )
            .map((opt) => (
              <NftVersion
                key={opt.name}
                upgradeOpt={opt}
                swapArtOpt={swapArtOpts?.filter((x) => x.key == opt.key)?.[0]}
                nft={nft}
              />
            ))}
        {upgradeOpts &&
          upgradeOpts
            .filter((x) => x.key === "CARTOON")
            .map((opt) => (
              <GiblatoonBanner key={opt.name} upgradeOpt={opt} nft={nft}></GiblatoonBanner>
            ))}
      </div>
      <div className="flex w-full flex-wrap justify-center gap-4 text-center">
        <h2 className="mb-3 block w-full text-xl">Loot items</h2>
        {nft &&
          warriorEquipment?.slots.map((x, i) => {
            const { status, itemMetadata, updatedAt } = x || {};
            const { slotNumber } = itemMetadata || {};
            const slotOpt = slotOpts?.find((s) => s.key === `SLOT_${slotNumber}`);
            const slotPaymentOption = slotOpt?.paymentOptions?.[0]?.amounts?.[0];
            return (
              <div key={slotNumber} className="w-full text-center lg:w-1/5">
                <BuyEquipment
                  index={i}
                  weaponMetadata={itemMetadata}
                  product={slotOpt}
                  profileView={true}
                  revealed={status === "unlocked"}
                  price={`${slotPaymentOption?.amount} $${slotPaymentOption?.token}`}
                  nft={nft}
                  updatedAt={updatedAt}
                />
              </div>
            );
          })}
      </div>
    </>
  );
};

export default Profile;