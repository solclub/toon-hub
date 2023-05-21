import { useState, useEffect } from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { EquipmentRarity } from "components/common/Equipment";
import Equipment, { EquipmentRarityLabels } from "components/common/Equipment";
import { CountDown } from "components/common/CountDown";
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

import ComingSoonImg from "assets/images/coming_soon.png";
import LeaderBoardIcon from "assets/images/leaderboard_icon.png";
import PowerRatingIcon from "assets/images/power_rating_icon.png";
import TierIcon from "assets/images/tier_icon.png";
import WeaponsIcon from "assets/images/weapons_icon.png";
import gem from "assets/weapons/SLOT1/COMMON/Stoneheart.png";
import gem2 from "assets/weapons/SLOT3/LEGENDARY/Ancient-Hammer.png";
import gem3 from "assets/weapons/SLOT4/MYTHIC/Life-taker.png";
import WeaponChest from "assets/weapons/weapon-chest.png";
import { useNFTManager } from "contexts/NFTManagerContext";
import { Modal } from "components/common/Modal";
import FeatureNFT from "pages/profile/components/FeatureNFT";
import { toPascalCase } from "utils/string-utils";
import VideoView from "./components/VideoView";
import type { Product } from "server/database/models/catalog.model";

type Weapon = {
  image: string | StaticImageData;
  name: string;
  points: number;
  price: string;
  rarity: EquipmentRarity;
  expireDate: Date;
  owned: boolean;
};

type NFTInfo = RudeNFT & {
  user: UserNFT | undefined;
};

const sampleWeapons: Weapon[] = [
  {
    image: gem,
    name: "Common",
    points: 5000,
    price: "$ 0.3 Sol",
    owned: true,
    expireDate: new Date("02/18/2023"),
    rarity: "COMMON",
  },
  {
    image: WeaponChest,
    name: "Rare",
    points: 5000,
    price: "$ 0.3 Sol",
    owned: false,
    expireDate: new Date("02/18/2023"),
    rarity: "NONE",
  },
  {
    image: gem2,
    name: "Legendary",
    points: 5000,
    price: "$ 0.3 Sol",
    owned: true,
    expireDate: new Date("02/18/2023"),
    rarity: "LEGENDARY",
  },
  {
    image: gem3,
    name: "Secret",
    points: 5000,
    price: "$ 0.3 Sol",
    owned: true,
    expireDate: new Date("02/18/2023"),
    rarity: "MYTHIC",
  },
];

const Profile: NextPage = () => {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [isOnUpgradeVideoModalOpen, setOnUpgradeVideoModalOpen] = useState(false);
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

  const { data: userMints } = trpc.nfts.getUserMints.useQuery();
  const weaponsEquiped = "0";

  useEffect(() => {
    paymentChannel.on("payment_success", handlePaymentSuccess);
    return () => {
      paymentChannel.removeListener("payment_success", handlePaymentSuccess);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaymentSuccess = (type: ProductType) => {
    console.log("emmiter: ", type);
    switch (type) {
      case ProductType.NFT_ART_SWAP:
        break;
      case ProductType.NFT_UPGRADE:
        utils.nfts.getUserNFTbyMint.invalidate();
        setOnUpgradeVideoModalOpen(true);

        break;
      case ProductType.NFT_FEATURE:
        break;

      default:
        console.error(type);
        break;
    }
  };

  useEffect(() => {
    setWeapons(sampleWeapons);
  }, [mint]);

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
        console.log(current, userMints);
        setProfileNavState({
          current,
          before: getNextOrBeforeProfile(userMints, false, current),
          after: getNextOrBeforeProfile(userMints, true, current),
        });
      }
    }
  }, [mint, userMints]);

  return (
    <div>
      <div className="mt-10 flex w-full justify-between">
        <span>
          <Link href={"/profile/" + userMints?.[profileNavState.before]}>
            <svg
              className="my-auto inline"
              width="12"
              height="20"
              viewBox="0 0 12 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.222 0.168027C10.2214 0.168644 10.2204 0.168626 10.2198 0.167991C10.1942 0.140083 10.1676 0.111849 10.1394 0.0829967C10.1345 0.0780216 10.13 0.0723566 10.1258 0.066746C9.9752 -0.136652 9.71087 0.170896 9.53628 0.374039C9.48731 0.431017 9.41388 0.498226 9.34336 0.562766C9.29257 0.609257 9.24329 0.654369 9.20575 0.693271L9.19901 0.700253C9.17776 0.722268 9.15347 0.747443 9.11287 0.789187C9.02078 0.883886 8.99732 0.908725 8.97346 0.933174C8.94263 0.964767 8.91115 0.995698 8.73005 1.17592C8.57579 1.33457 8.49497 1.41804 8.43796 1.47691C8.32627 1.59225 8.306 1.61319 8.00404 1.9201C7.88854 2.03751 7.83953 2.1041 7.77245 2.19525C7.73353 2.24813 7.68853 2.30928 7.62093 2.39343C7.43681 2.62259 7.25271 2.85172 7.07029 3.03713C7.0119 3.09647 6.95518 3.11194 6.89847 3.12742C6.8417 3.14292 6.78495 3.15841 6.72654 3.21787C6.17245 3.78199 6.06567 3.89406 5.76328 4.21345C5.39501 4.5764 5.36982 4.59648 5.38845 4.5755C5.41241 4.55057 5.41572 4.54686 5.41138 4.55122C5.40704 4.5556 5.39502 4.5681 5.38845 4.5755C5.34432 4.62144 5.23007 4.73939 4.9643 5.01145C4.84615 5.13239 4.76852 5.21212 4.71952 5.26266C4.68352 5.29797 4.61381 5.36708 4.49141 5.48924C4.3742 5.61774 4.24476 5.77403 4.11135 5.93511C3.9972 6.07293 3.86843 6.18391 3.73836 6.29597C3.65026 6.37188 3.5615 6.44835 3.47616 6.53415L3.45833 6.55207C3.29782 6.71343 3.11864 6.89355 2.98621 7.03753C2.98049 7.04375 2.9728 7.05268 2.96349 7.06381C2.96194 7.0583 2.94181 7.07596 2.91264 7.10155C2.9034 7.10965 2.89325 7.11855 2.8825 7.12777C2.7803 7.21535 2.60988 7.36029 2.43315 7.51058C2.12687 7.77106 1.80165 8.04764 1.77974 8.06973C1.77913 8.07034 1.7786 8.06989 1.778 8.06927C1.7775 8.06877 1.77678 8.06866 1.77619 8.06902C1.73375 8.09554 1.62535 8.18959 1.60392 8.25412L1.60301 8.25774C1.60026 8.26894 1.5952 8.27943 1.58769 8.2881C1.58201 8.29464 1.57502 8.2999 1.56776 8.30455C1.54923 8.31646 1.51788 8.34163 1.46413 8.3963L1.41341 8.4479C1.40931 8.45206 1.40167 8.45307 1.39403 8.45408C1.38611 8.45513 1.37818 8.45618 1.37419 8.46076C1.36774 8.46795 1.36325 8.48318 1.35922 8.49966C1.35852 8.50256 1.35706 8.50521 1.35498 8.50733L1.34254 8.51998C1.33918 8.5234 1.33343 8.52176 1.33231 8.51706C1.33118 8.51229 1.32573 8.51024 1.3224 8.51378C1.09576 8.75426 0.237171 9.63257 0.120701 9.75108C0.119849 9.75194 0.120085 9.7531 0.120936 9.75398C0.121821 9.75488 0.121759 9.75636 0.120831 9.75722C-0.0479005 9.91209 -0.0552507 10.1027 0.197149 10.3337C0.618619 10.7671 0.873507 11.0241 1.24313 11.397C1.30574 11.4601 1.37165 11.5266 1.44221 11.5978C1.69275 11.8506 1.75072 11.9076 1.76195 11.9183C1.76183 11.9191 1.79288 11.9542 2.08499 12.2594C2.18695 12.3631 2.2691 12.4095 2.35147 12.456C2.40795 12.4879 2.57305 12.6925 2.68757 12.8344C2.7356 12.8939 2.77473 12.9423 2.79323 12.9625C2.92566 13.1065 3.10484 13.2866 3.26536 13.4479L3.28318 13.4658C3.36854 13.5517 3.45731 13.6281 3.54541 13.7041C3.67548 13.8161 3.80411 13.9269 3.91825 14.0648C4.05162 14.2258 4.18126 14.3823 4.29843 14.5108C4.42072 14.6328 4.49041 14.7019 4.52645 14.7372C4.57544 14.7878 4.6531 14.8675 4.77132 14.9886C5.03702 15.2605 5.15127 15.3785 5.19544 15.4245C5.20205 15.4319 5.21425 15.4446 5.21851 15.4489C5.22269 15.4531 5.21924 15.4492 5.19544 15.4245C5.17688 15.4036 5.20229 15.4239 5.5703 15.7866C5.8727 16.1059 5.97948 16.218 6.53356 16.7821C6.59198 16.8416 6.64873 16.8571 6.70549 16.8726C6.7622 16.8881 6.81893 16.9035 6.87732 16.9629C7.05974 17.1483 7.24383 17.3774 7.42795 17.6066C7.49556 17.6907 7.54056 17.7519 7.57947 17.8047C7.64655 17.8959 7.69556 17.9625 7.81107 18.0799C8.11324 18.387 8.13333 18.4078 8.24522 18.5233C8.30222 18.5822 8.38304 18.6656 8.53708 18.8241C8.71818 19.0043 8.74966 19.0352 8.78049 19.0668C8.80435 19.0913 8.82781 19.1161 8.9199 19.2108C8.96484 19.257 8.98981 19.2829 9.01277 19.3067C9.05031 19.3456 9.09959 19.3907 9.15038 19.4372C9.2209 19.5018 9.29433 19.569 9.3433 19.626C9.5179 19.8291 9.78223 20.1366 9.93285 19.9333C9.937 19.9276 9.94152 19.922 9.94639 19.917C9.97459 19.8881 10.0012 19.8599 10.0269 19.832C10.0272 19.8316 10.0278 19.8314 10.0283 19.8316C10.0285 19.8316 10.0288 19.8317 10.029 19.832C10.0295 19.8325 10.0302 19.8326 10.0308 19.8322C10.0733 19.8057 10.1817 19.7116 10.2031 19.6471L10.204 19.6435C10.2053 19.6382 10.2072 19.633 10.2095 19.6281C10.2121 19.6227 10.2154 19.6177 10.2193 19.6132C10.225 19.6066 10.232 19.6014 10.2393 19.5967C10.2469 19.5918 10.2566 19.5847 10.2692 19.5742C10.2873 19.5592 10.3112 19.5372 10.3429 19.5049L10.3936 19.4533C10.402 19.4449 10.425 19.4495 10.4328 19.4405C10.4393 19.4333 10.4438 19.4181 10.4478 19.4016C10.4481 19.4002 10.4487 19.3989 10.4493 19.3976C10.45 19.3963 10.451 19.395 10.452 19.3939L10.4645 19.3813C10.4678 19.3778 10.4736 19.3795 10.4747 19.3842C10.4759 19.389 10.4813 19.391 10.4846 19.3875C10.7113 19.147 11.5699 18.2687 11.6863 18.1502C11.6872 18.1493 11.6869 18.1481 11.6861 18.1473C11.6858 18.1469 11.6856 18.1465 11.6855 18.1461C11.6854 18.1453 11.6856 18.1446 11.6862 18.144C11.8549 17.9892 11.8623 17.7985 11.6099 17.5676C11.2446 17.1919 11.1426 17.0893 10.9159 16.8612C10.8368 16.7815 10.7424 16.6865 10.6163 16.5593C10.4967 16.4385 10.3981 16.3392 10.314 16.2545C9.93282 15.8705 9.84845 15.7855 9.44256 15.3576C9.3406 15.2539 9.25845 15.2075 9.17609 15.161C9.1264 15.1329 9.05053 15.0258 8.9846 14.9327C8.94414 14.8755 8.90742 14.8237 8.88277 14.7986C8.83639 14.7514 8.77868 14.6936 8.70935 14.6239C8.59698 14.5109 8.46964 14.4103 8.34231 14.3097C8.21696 14.2106 8.09163 14.1116 7.98061 14.0008C7.90025 13.9206 7.82475 13.8342 7.76328 13.757C7.72496 13.7089 7.68805 13.6595 7.65114 13.6102C7.60149 13.5438 7.55183 13.4774 7.49872 13.414C7.41451 13.3133 7.33321 13.2181 7.25707 13.1346C7.17989 13.0576 7.1264 13.0045 7.09123 12.9698C7.06634 12.9442 7.03863 12.9159 7.00776 12.8843C6.50923 12.3739 6.48416 12.3452 6.45687 12.3188C6.43134 12.2941 6.40387 12.2715 5.9852 11.8589C5.81074 11.6777 5.70281 11.565 5.6195 11.478C5.4383 11.2889 5.37356 11.2213 4.99399 10.8349C4.93558 10.7754 4.87882 10.7599 4.82206 10.7444C4.76535 10.7289 4.70863 10.7135 4.65024 10.6541C4.50566 10.5072 4.36004 10.3328 4.21418 10.1526C4.27132 10.0928 4.26022 10.0956 4.24413 10.0995C4.22338 10.1047 4.19434 10.1119 4.29258 9.98959C4.4767 9.76043 4.66079 9.5313 4.84321 9.3459C4.9016 9.28655 4.95832 9.27108 5.01504 9.2556C5.0718 9.24011 5.12855 9.22462 5.18697 9.16515C5.56653 8.7787 5.63127 8.71111 5.81247 8.52195C5.89579 8.43498 6.00371 8.32231 6.17817 8.14114C6.59684 7.72853 6.62431 7.70592 6.64984 7.68123C6.67713 7.65484 6.7022 7.62607 7.20073 7.11574C7.23147 7.08427 7.25912 7.05594 7.28393 7.03052C7.31909 6.99581 7.37266 6.94258 7.45005 6.86536C7.52618 6.78188 7.60749 6.68667 7.69169 6.58604C7.7448 6.52258 7.79446 6.45619 7.84412 6.38981C7.88103 6.34048 7.91794 6.29113 7.95626 6.243C8.01773 6.16579 8.09322 6.0794 8.17358 5.99921C8.28461 5.88841 8.40995 5.78937 8.5353 5.69031C8.66262 5.5897 8.78996 5.48907 8.90233 5.37612C8.9528 5.3254 8.99711 5.28095 9.03537 5.24231C9.04967 5.22786 9.06313 5.21424 9.07574 5.2014C9.10039 5.17631 9.13711 5.12448 9.17756 5.06736C9.24351 4.97425 9.31938 4.86713 9.36906 4.83905C9.45143 4.79252 9.53358 4.7461 9.63554 4.64238C10.0414 4.21454 10.1258 4.12953 10.5069 3.7456C10.591 3.66084 10.6896 3.56151 10.8093 3.4407C10.9356 3.31329 11.03 3.21824 11.1092 3.13851C11.3357 2.91061 11.4377 2.80788 11.8029 2.43244C12.0553 2.20145 12.0479 2.01085 11.8792 1.85597C11.8782 1.85512 11.8782 1.85363 11.8791 1.85273C11.8799 1.85187 11.8802 1.8507 11.8793 1.84983C11.7628 1.73133 10.9042 0.853019 10.6776 0.612535C10.6743 0.609003 10.6688 0.611055 10.6677 0.615812C10.6666 0.620515 10.6608 0.622158 10.6575 0.618736L10.645 0.60608C10.6437 0.604754 10.6427 0.603211 10.6419 0.601522C10.6414 0.600533 10.641 0.599489 10.6408 0.598418C10.6367 0.581931 10.6323 0.566706 10.6258 0.559525C10.6217 0.55484 10.6136 0.553842 10.6055 0.55277C10.598 0.551781 10.5906 0.550728 10.5866 0.546651L10.5359 0.495057C10.4821 0.440395 10.4508 0.41522 10.4322 0.403309C10.425 0.398651 10.418 0.393395 10.4123 0.386849C10.4048 0.378188 10.3997 0.367693 10.397 0.356499L10.3961 0.352877C10.3746 0.288346 10.2662 0.194292 10.2238 0.167782C10.2232 0.16741 10.2225 0.167528 10.222 0.168027Z"
                fill="white"
              />
            </svg>
            <div className="inline w-5/12 pl-3">{"Before"}</div>
          </Link>
        </span>

        <span>
          <div className="hidden w-5/12 pl-3 text-xl font-extrabold lg:inline">
            {profileNFT?.name}
          </div>
        </span>

        <span>
          <Link href={"/profile/" + userMints?.[profileNavState.after]}>
            <div className="inline w-5/12 justify-end pr-3">{"Next"}</div>
            <svg
              className="my-auto inline"
              width="12"
              height="21"
              viewBox="0 0 12 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.77775 19.8339C1.77836 19.8333 1.77934 19.8333 1.77992 19.834C1.80557 19.8619 1.8322 19.8901 1.8604 19.919C1.86526 19.9239 1.86978 19.9296 1.87394 19.9352C2.02456 20.1386 2.28889 19.8311 2.46348 19.6279C2.51245 19.5709 2.58588 19.5037 2.65639 19.4392C2.70719 19.3927 2.75647 19.3476 2.79401 19.3087L2.80075 19.3017C2.82199 19.2797 2.84629 19.2545 2.88689 19.2128C2.97898 19.1181 3.00244 19.0932 3.02629 19.0688C3.05712 19.0372 3.0886 19.0063 3.26971 18.826C3.42396 18.6674 3.50479 18.5839 3.5618 18.525C3.67348 18.4097 3.69376 18.3888 3.99572 18.0819C4.11122 17.9644 4.16022 17.8979 4.22731 17.8067C4.26623 17.7538 4.31123 17.6927 4.37883 17.6085C4.56295 17.3794 4.74705 17.1502 4.92947 16.9648C4.98786 16.9055 5.04458 16.89 5.10129 16.8745C5.15806 16.859 5.21481 16.8435 5.27322 16.7841C5.8273 16.22 5.93409 16.1079 6.23648 15.7885C6.60475 15.4256 6.62993 15.4055 6.6113 15.4265C6.58734 15.4514 6.58404 15.4551 6.58837 15.4507C6.59272 15.4464 6.60474 15.4339 6.6113 15.4265C6.65544 15.3805 6.76969 15.2626 7.03546 14.9905C7.1536 14.8696 7.23123 14.7898 7.28023 14.7393C7.31624 14.704 7.38595 14.6349 7.50835 14.5127C7.62555 14.3842 7.755 14.2279 7.88841 14.0668C8.00256 13.929 8.13132 13.818 8.2614 13.706C8.3495 13.6301 8.43825 13.5536 8.5236 13.4678L8.54143 13.4499C8.70194 13.2885 8.88112 13.1084 9.01355 12.9644C9.01927 12.9582 9.02696 12.9493 9.03627 12.9381C9.03782 12.9436 9.05795 12.926 9.08712 12.9004C9.09635 12.8923 9.1065 12.8834 9.11725 12.8742C9.21945 12.7866 9.38988 12.6417 9.56661 12.4914C9.87289 12.2309 10.1981 11.9543 10.22 11.9322C10.2206 11.9316 10.2212 11.9321 10.2218 11.9327C10.2223 11.9332 10.223 11.9333 10.2236 11.9329C10.266 11.9064 10.3744 11.8124 10.3958 11.7478L10.3967 11.7442C10.3995 11.733 10.4046 11.7225 10.4121 11.7139C10.4177 11.7073 10.4247 11.7021 10.432 11.6974C10.4505 11.6855 10.4819 11.6603 10.5356 11.6056L10.5863 11.5541C10.5904 11.5499 10.5981 11.5489 10.6057 11.5479C10.6136 11.5468 10.6216 11.5458 10.6256 11.5412C10.632 11.534 10.6365 11.5188 10.6405 11.5023C10.6412 11.4994 10.6427 11.4967 10.6448 11.4946L10.6572 11.482C10.6606 11.4786 10.6663 11.4802 10.6674 11.4849C10.6686 11.4897 10.674 11.4917 10.6774 11.4882C10.904 11.2477 11.7626 10.3694 11.8791 10.2509C11.8799 10.25 11.8797 10.2488 11.8788 10.248C11.8779 10.2471 11.878 10.2456 11.8789 10.2447C12.0477 10.0899 12.055 9.89926 11.8026 9.66827C11.3811 9.23488 11.1262 8.97781 10.7566 8.605C10.694 8.54185 10.6281 8.47539 10.5575 8.40417C10.307 8.15133 10.249 8.09437 10.2378 8.08366C10.2379 8.08285 10.2069 8.04778 9.91477 7.74259C9.8128 7.63888 9.73065 7.59246 9.64829 7.54592C9.5918 7.514 9.42671 7.30946 9.31218 7.16758C9.26416 7.10809 9.22503 7.05961 9.20652 7.03948C9.07409 6.8955 8.89492 6.71538 8.7344 6.55403L8.71657 6.53611C8.63121 6.4503 8.54245 6.37382 8.45434 6.2979C8.32428 6.18584 8.19565 6.07501 8.08151 5.9372C7.94813 5.77617 7.81849 5.61966 7.70133 5.4912C7.57903 5.36916 7.50934 5.30005 7.4733 5.26471C7.42432 5.21418 7.34666 5.13442 7.22844 5.0134C6.96274 4.74142 6.84848 4.62346 6.80432 4.5775C6.79771 4.57004 6.78551 4.55735 6.78125 4.55306C6.77707 4.54886 6.78052 4.55273 6.80432 4.5775C6.82288 4.5984 6.79746 4.57809 6.42945 4.2154C6.12706 3.89602 6.02028 3.78394 5.46619 3.21982C5.40778 3.16036 5.35103 3.14487 5.29426 3.12938C5.23755 3.1139 5.18083 3.09842 5.12244 3.03908C4.94002 2.85367 4.75592 2.62455 4.57181 2.39538C4.5042 2.31124 4.4592 2.25009 4.42028 2.19721C4.3532 2.10605 4.3042 2.03946 4.18869 1.92205C3.88651 1.61492 3.86643 1.59418 3.75453 1.47862C3.69754 1.41977 3.61672 1.33631 3.46268 1.17788C3.28158 0.997648 3.2501 0.966717 3.21927 0.935124C3.19541 0.910675 3.17195 0.885836 3.07986 0.791146C3.03491 0.744926 3.00995 0.719025 2.98699 0.69523C2.94945 0.656328 2.90017 0.611216 2.84938 0.564725C2.77886 0.500176 2.70542 0.432967 2.65645 0.375989C2.48186 0.172846 2.21753 -0.134693 2.06691 0.0686958C2.06276 0.0743155 2.05823 0.0799715 2.05337 0.0849556C2.02517 0.113807 1.99854 0.142033 1.9729 0.16995C1.97252 0.170358 1.97199 0.170513 1.97149 0.170404C1.97121 0.170349 1.97094 0.170213 1.97072 0.169986C1.97023 0.169487 1.96951 0.16936 1.96892 0.169732C1.92648 0.19625 1.81808 0.290305 1.79664 0.354827L1.79574 0.358449C1.79443 0.363797 1.79259 0.368971 1.79021 0.373865C1.78761 0.379239 1.78435 0.384269 1.78042 0.388799C1.77475 0.395354 1.76776 0.400601 1.7605 0.405268C1.75289 0.410152 1.74313 0.417261 1.73055 0.427728C1.71247 0.442781 1.68856 0.464769 1.65687 0.497007L1.60614 0.54861C1.59778 0.557099 1.57475 0.552469 1.56692 0.561475C1.56047 0.568665 1.55598 0.58389 1.55195 0.600367C1.55161 0.601756 1.55111 0.603091 1.55044 0.604335C1.54971 0.605687 1.54879 0.606931 1.54771 0.608039L1.53527 0.620694C1.53191 0.624108 1.52616 0.622465 1.52504 0.617771C1.52391 0.613005 1.51846 0.610953 1.51513 0.614494C1.28849 0.854968 0.429898 1.73329 0.313428 1.85178C0.31258 1.85265 0.312812 1.85382 0.313665 1.85468C0.313999 1.85502 0.314196 1.85544 0.314267 1.85589C0.314383 1.85661 0.314142 1.85738 0.313562 1.85792C0.144829 2.0128 0.137478 2.20341 0.38988 2.43439C0.755186 2.81002 0.85717 2.91266 1.08384 3.14079C1.16299 3.22046 1.25734 3.31542 1.38341 3.44265C1.5031 3.56343 1.60167 3.66274 1.68579 3.74749C2.06693 4.13148 2.1513 4.21648 2.55719 4.64434C2.65915 4.74805 2.74131 4.79447 2.82367 4.841C2.87335 4.86908 2.94922 4.9762 3.01516 5.0693C3.05561 5.12642 3.09233 5.17826 3.11698 5.20335C3.16336 5.25055 3.22108 5.30839 3.2904 5.37808C3.40278 5.49104 3.53012 5.59167 3.65745 5.69229C3.78279 5.79133 3.90812 5.89037 4.01915 6.00116C4.09951 6.08135 4.175 6.16774 4.23647 6.24496C4.2748 6.2931 4.31171 6.34244 4.34861 6.39179C4.39827 6.45816 4.44793 6.52453 4.50104 6.588C4.58524 6.68862 4.66655 6.78383 4.74269 6.86731C4.81987 6.94433 4.87336 6.99748 4.90852 7.03219C4.93341 7.05771 4.96113 7.08609 4.992 7.11769C5.49053 7.62802 5.5156 7.65679 5.54289 7.68319C5.56842 7.70788 5.59589 7.73048 6.01456 8.1431C6.18902 8.32427 6.29695 8.43694 6.38026 8.52391C6.56146 8.71307 6.6262 8.78066 7.00577 9.1671C7.06417 9.22657 7.12093 9.24206 7.17769 9.25754C7.23441 9.27302 7.29113 9.2885 7.34952 9.34785C7.49409 9.49479 7.63972 9.66919 7.78557 9.84931C7.72843 9.90915 7.73954 9.9064 7.75562 9.90242C7.77637 9.89728 7.80542 9.89009 7.70718 10.0124C7.52306 10.2415 7.33897 10.4707 7.15655 10.6561C7.09815 10.7154 7.04143 10.7309 6.98472 10.7464C6.92796 10.7618 6.8712 10.7773 6.81279 10.8368C6.43322 11.2232 6.36848 11.2908 6.18728 11.48C6.10397 11.567 5.99604 11.6796 5.82158 11.8608C5.40292 12.2734 5.37544 12.296 5.34992 12.3207C5.32262 12.3471 5.29755 12.3759 4.79902 12.8862C4.76829 12.9177 4.74063 12.946 4.71582 12.9714C4.68067 13.0061 4.6271 13.0594 4.54971 13.1366C4.47358 13.2201 4.39227 13.3153 4.30806 13.4159C4.25496 13.4794 4.2053 13.5458 4.15563 13.6121C4.11873 13.6615 4.08182 13.7108 4.0435 13.759C3.98203 13.8362 3.90654 13.9226 3.82617 14.0027C3.71514 14.1135 3.58981 14.2126 3.46446 14.3116C3.33713 14.4123 3.2098 14.5129 3.09743 14.6258C3.04696 14.6766 3.00265 14.721 2.96439 14.7596C2.95008 14.7741 2.93663 14.7877 2.92401 14.8006C2.89936 14.8256 2.86264 14.8775 2.82219 14.9346C2.75625 15.0277 2.68038 15.1348 2.63069 15.1629C2.54833 15.2094 2.46618 15.2559 2.36422 15.3596C1.95835 15.7874 1.87397 15.8724 1.49288 16.2564C1.40874 16.3411 1.31015 16.4404 1.19044 16.5613C1.06418 16.6887 0.969743 16.7837 0.890525 16.8634C0.664092 17.0913 0.562028 17.1941 0.196905 17.5695C-0.0554969 17.8005 -0.0481423 17.9911 0.120587 18.146C0.121515 18.1468 0.121573 18.1483 0.120689 18.1492C0.119841 18.1501 0.119605 18.1513 0.120457 18.1521C0.236923 18.2706 1.09552 19.1489 1.32215 19.3894C1.32549 19.3929 1.33093 19.3909 1.33207 19.3861C1.33318 19.3814 1.33893 19.3798 1.3423 19.3832L1.35473 19.3959C1.35604 19.3972 1.3571 19.3987 1.35789 19.4004C1.35835 19.4014 1.35872 19.4025 1.35898 19.4035C1.36301 19.42 1.3675 19.4352 1.37395 19.4424C1.37802 19.4471 1.38621 19.4481 1.3943 19.4492C1.40177 19.4502 1.40916 19.4512 1.41317 19.4553L1.46389 19.5069C1.51764 19.5616 1.54899 19.5867 1.56752 19.5986C1.57478 19.6033 1.58177 19.6086 1.58745 19.6151C1.59496 19.6238 1.60001 19.6343 1.60277 19.6455L1.60367 19.6491C1.62511 19.7136 1.73351 19.8077 1.77595 19.8342C1.77654 19.8345 1.77726 19.8344 1.77775 19.8339Z"
                fill="white"
              />
            </svg>
          </Link>
        </span>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-x-4">
        <div className="w-full lg:w-2/6">
          <Panel className="panel flex flex-wrap rounded-md p-3">
            <div className="overflow-hidde w-full">
              <div className=" relative h-[500px] w-full">
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
                <div className="absolute bottom-0 h-[60%] w-full  rounded-2xl bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-0 h-[60%] w-full">
                  <div className="absolute bottom-8 left-5 lg:left-10">
                    <div className="mt-2 w-20 overflow-hidden overflow-ellipsis text-xl font-thin">
                      {toPascalCase(profileNFT?.type ?? "")}
                    </div>
                    <div className=" font-medieval-sharp text-4xl text-amber-100">
                      {getRudeNftName(profileNFT?.name) || "Unknow"}
                    </div>
                  </div>
                  <div className="absolute bottom-9 right-5 lg:right-10">
                    {featureProduct?.options[0] && profileNFT && (
                      <>
                        {isLoadingFeatured && <Loader></Loader>}
                        {!isFeaturedData?.featuredNFT ? (
                          <button
                            className="btn-rude btn text-xs font-thin"
                            onClick={() => {
                              setOpen(true);
                            }}
                          >
                            Feature your warrior
                          </button>
                        ) : (
                          <button className="btn-rude btn disabled cursor-default font-thin  ">
                            🚀 featured!{" "}
                          </button>
                        )}

                        <Modal
                          className="lg:w-4/5"
                          isOpen={isOpen}
                          backdropDismiss={true}
                          handleClose={() => setOpen(false)}
                        >
                          <FeatureNFT
                            nft={profileNFT}
                            title={featureProduct?.options[0]?.name ?? " Feature NFT"}
                            featureOption={featureProduct.options[0]}
                            sourceImageUrl={profileNFT?.images?.get(profileNFT?.current)}
                          ></FeatureNFT>
                        </Modal>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex w-full flex-wrap text-center lg:gap-3">
              <div
                className={classNames("info-card m-auto h-[160px] w-1/2 grow lg:w-1/5", {
                  "loading-effect opacity-20": isProfileLoading,
                })}
              >
                <div className="grid h-full w-full flex-wrap justify-center py-4 text-center align-middle">
                  <div className="w-full">
                    <label className="block text-xs">Leaderboard</label>
                  </div>
                  <div className="w-full grow">
                    <Image
                      className="mx-auto"
                      src={LeaderBoardIcon}
                      alt="Leaderboard position"
                      width={40}
                    ></Image>
                  </div>
                  <div className="w-full text-3xl text-[#BEA97E]">
                    {mintPosition?.item ?? "..."}
                  </div>
                </div>
              </div>

              <div
                className={classNames("info-card m-auto h-[160px] w-1/2 grow lg:w-1/5", {
                  "loading-effect": isProfileLoading,
                })}
              >
                <div className="grid h-full w-full flex-wrap justify-center py-4 text-center align-middle">
                  <div className="w-full">
                    <label className="block text-xs">Power Rating</label>
                  </div>
                  <div className="w-full grow">
                    <Image
                      className="mx-auto"
                      src={PowerRatingIcon}
                      alt="Power Rating"
                      width={40}
                    ></Image>
                  </div>
                  <div className="w-full text-3xl text-[#BEA97E]">{profileNFT?.power}</div>
                </div>
              </div>

              <div
                className={classNames("info-card m-auto h-[160px] w-1/2 grow lg:w-1/5", {
                  "loading-effect": isProfileLoading,
                })}
              >
                <div className="grid h-full w-full flex-wrap justify-center py-4 text-center align-middle">
                  <div className="w-full">
                    <label className="block text-xs">Tier</label>
                  </div>
                  <div className="w-full grow">
                    <Image className="mx-auto" src={TierIcon} alt="Tier" width={40}></Image>
                  </div>
                  <div className="w-full text-4xl text-[#BEA97E]">{profileNFT?.tier}</div>
                </div>
              </div>

              <div
                className={classNames("info-card m-auto h-[160px] w-1/2 grow lg:w-1/5", {
                  "loading-effect": isProfileLoading,
                })}
              >
                <div className="grid h-full w-full flex-wrap justify-center py-4 text-center align-middle">
                  <div className="w-full">
                    <label className="block text-xs">Weapons</label>
                  </div>
                  <div className="w-full grow">
                    <Image
                      className="mx-auto"
                      src={WeaponsIcon}
                      alt="Weapons Equiped"
                      width={40}
                    ></Image>
                  </div>
                  <div className="w-full text-4xl text-[#BEA97E]">{weaponsEquiped}</div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
        <Panel className="panel mt-3 flex w-full flex-wrap rounded-md p-8 lg:mt-0 lg:max-w-[65%] ">
          {profileNFT && profileNFT?.type && (
            <CustomizePanel
              weapons={weapons}
              nft={profileNFT}
              upgradeProducts={getProduct(ProductType.NFT_UPGRADE, profileNFT?.type)?.[0]}
              swapProducts={getProduct(ProductType.NFT_ART_SWAP, profileNFT?.type)?.[0]}
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
        <VideoView>
          <Image
            src={profileNFT?.images?.get(profileNFT.current) ?? NftHidden}
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
  weapons: Weapon[];
  upgradeProducts: Product | undefined;
  swapProducts: Product | undefined;
};

const CustomizePanel = ({ weapons, nft, upgradeProducts, swapProducts }: ArmoryProps) => {
  const upgradeOpts = upgradeProducts?.options;
  const swapArtOpts = swapProducts?.options;

  const onBuyEquipment = (x: Weapon) => {
    //check status
    console.log(x);
  };

  return (
    <>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-center">
        <h2 className="block w-full text-xl">Select your alternative version</h2>
        {upgradeOpts &&
          upgradeOpts
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
              ></NftVersion>
            ))}
      </div>

      <div className="flex w-full flex-wrap justify-center text-center">
        <h2 className="mb-3 block w-full text-xl">Armory</h2>
        {weapons &&
          false &&
          weapons.map((x) => {
            const { image, rarity, expireDate, name, owned, points, price } = x;
            return (
              <div key={name} className="w-1/6 text-center ">
                <Equipment
                  url={image}
                  rarity={rarity as EquipmentRarity}
                  className=""
                  profileView={true}
                  revealed={owned}
                  price={price}
                  name={name}
                  event={() => {
                    onBuyEquipment(x);
                  }}
                ></Equipment>
                <div className="mt-6 flex w-full flex-wrap gap-y-1 text-center">
                  <div className="w-full ">{name}</div>
                  <div className="w-full text-[#BFA97F]">{`P: ${points} `}</div>
                  <div className="w-full text-red-600">
                    <CountDown date={expireDate}></CountDown>
                  </div>
                  <div className="w-full">{EquipmentRarityLabels[rarity]}</div>
                </div>
              </div>
            );
          })}
        <div className="ml-5 cursor-pointer hover:shadow-sm">
          <Image src={ComingSoonImg} alt="Coming soon" className="object-fill"></Image>
        </div>
      </div>
    </>
  );
};

export default Profile;
