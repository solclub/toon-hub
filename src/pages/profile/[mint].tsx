import { useState, useEffect } from "react";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import classnames from "classnames";
import NftHidden from "../../assets/images/nft-hidden.png";
import ComingSoonImg from "../../assets/images/coming_soon.png";
import classNames from "classnames";
import { Modal } from "../../components/common/Modal";
import type { EquipmentRarity } from "../../components/common/Equipment";
import Equipment, {
  EquipmentRarityLabels,
} from "../../components/common/Equipment";
import { CountDown } from "../../components/common/CountDown";

const sampleData: Props = {
  id: "23",
  image:
    "https://arweave.net/Iw6K_HR8OzqB9MCMCT5FtZZj-JjXkfZp-sZn9i2STLw?ext=png",
  name: "Demon #23",
  mint: "2fAeFrv7iXDBpoHh2EUP6KfG9mm26Szqk9c4hA1oyRSP",
  leaderboardPosition: 23,
  powerRating: 23984,
  tier: 2,
  weapons: 2,
};

type ArtVersion = {
  image: string;
  name: string;
  equiped: boolean;
  price: string;
  revealed: boolean;
};

type Weapon = {
  image: string;
  name: string;
  points: number;
  price: string;
  rarity: string;
  expireDate: Date;
  owned: boolean;
};

const sampleWeapons: Weapon[] = [
  {
    image:
      "https://cdn.discordapp.com/attachments/970702970704510976/1076862826896957520/test-2.png",
    name: "Common",
    points: 5000,
    price: "$ 0.3 Sol",
    owned: true,
    expireDate: new Date("02/18/2023"),
    rarity: "COMMON",
  },
  {
    image:
      "https://cdn.discordapp.com/attachments/970702970704510976/1076862826007765152/test-4.png",
    name: "Rare",
    points: 5000,
    price: "$ 0.3 Sol",
    owned: false,
    expireDate: new Date("02/18/2023"),
    rarity: "RARE",
  },
  {
    image:
      "https://cdn.discordapp.com/attachments/970702970704510976/1077267717729558538/test-1.png",
    name: "Legendary",
    points: 5000,
    price: "$ 0.3 Sol",
    owned: true,
    expireDate: new Date("02/18/2023"),
    rarity: "LEGEND",
  },
  {
    image:
      "https://cdn.discordapp.com/attachments/970702970704510976/1077267717729558538/test-1.png",
    name: "Secret",
    points: 5000,
    price: "$ 0.3 Sol",
    owned: false,
    expireDate: new Date("02/18/2023"),
    rarity: "SECRET",
  },
];

const sampleArtVersions: ArtVersion[] = [
  {
    image:
      "https://cdn.discordapp.com/attachments/801296760512446494/1076012516011933697/image.png",
    name: "Rework",
    equiped: true,
    price: "0",
    revealed: true,
  },
  {
    image:
      "https://arweave.net/Iw6K_HR8OzqB9MCMCT5FtZZj-JjXkfZp-sZn9i2STLw?ext=png",
    name: "OG",
    equiped: false,
    price: "0",
    revealed: true,
  },
  {
    image: "",
    name: "Cartoon",
    equiped: false,
    price: "$ 0.3 Sol",
    revealed: false,
  },
];

type Props = {
  id: string;
  image: string;
  name: string;
  mint: string;
  leaderboardPosition: number;
  powerRating: number;
  tier: number;
  weapons: number;
};

const Profile: NextPage = () => {
  const router = useRouter();
  const [profileNFT, setProfileNFT] = useState<Props>({} as Props);
  const [artVersions, setArtVersions] = useState<ArtVersion[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const { mint } = router.query;

  useEffect(() => {
    setProfileNFT(sampleData);
    setArtVersions(sampleArtVersions);
    setWeapons(sampleWeapons);
  }, [mint]);

  return (
    <div>
      <div className="mt-5 ">
        <Link href={"/list"}>
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
          <div className="inline w-5/12 pl-3">{profileNFT.name}</div>
        </Link>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-x-4">
        <div className="w-2/6">
          <div className="panel flex flex-wrap rounded-md p-3">
            {profileNFT && (
              <div className="overflow-hidde w-full">
                <div className=" relative h-[500px] w-full">
                  {profileNFT.image && (
                    <Image
                      className="absolute max-h-[500px] rounded-2xl object-cover "
                      src={profileNFT.image}
                      alt={profileNFT.name}
                      fill
                    />
                  )}
                  <div className="absolute bottom-0 h-[60%] w-full  rounded-2xl bg-gradient-to-t from-black to-transparent"></div>
                  <div className="absolute bottom-0 h-[60%] w-full">
                    <div className="absolute bottom-10 left-10">
                      <div className="mt-2 w-20 overflow-hidden overflow-ellipsis text-sm font-thin">
                        Power
                      </div>
                      <div className=" text-3xl text-amber-100">
                        {profileNFT?.powerRating || "Unknow"}
                      </div>
                    </div>
                    <div className="absolute bottom-9 right-10">
                      <button className="btn-rude w-[230px] text-xs font-thin">
                        Feature your warrior
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className=" mt-4 flex w-full gap-3 text-center">
              <div className="info-card relative m-auto h-[160px] w-1/5 grow">
                <div className="absolute top-[10%] flex h-1/2 w-full flex-wrap gap-y-1">
                  <div className="w-full p-3 text-3xl text-[#BEA97E]">
                    {profileNFT.leaderboardPosition}
                  </div>
                  <div className="w-full ">
                    <label className="block text-xs">Leaderboard</label>
                    <label>Position</label>
                  </div>
                </div>
              </div>

              <div className="info-card relative m-auto h-[160px] w-1/5 grow">
                <div className="absolute top-[10%] flex h-1/2 w-full flex-wrap gap-y-1">
                  <div className="w-full p-3 text-3xl text-[#BEA97E]">
                    {profileNFT.powerRating}
                  </div>
                  <div className="w-full ">
                    <label className="block text-xs">Power</label>
                    <label>Rating</label>
                  </div>
                </div>
              </div>
              <div className="info-card relative m-auto h-[160px] w-1/5 grow">
                <div className="absolute top-[10%] flex h-1/2 w-full flex-wrap gap-y-1">
                  <div className="w-full p-3 text-3xl text-[#BEA97E]">
                    {profileNFT.tier}
                  </div>
                  <div className="w-full ">
                    <label className="block text-xs">Power</label>
                    <label>Tier</label>
                  </div>
                </div>
              </div>
              <div className="info-card relative m-auto h-[160px] w-1/5 grow">
                <div className="absolute top-[10%] flex h-1/2 w-full flex-wrap gap-y-1">
                  <div className="w-full p-3 text-3xl text-[#BEA97E]">
                    {profileNFT.weapons}
                  </div>
                  <div className="w-full ">
                    <label className="block text-xs">Weapons</label>
                    <label>Equipped</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Armory artVersions={artVersions} weapons={weapons}></Armory>
      </div>
    </div>
  );
};

type ArmoryProps = {
  artVersions: ArtVersion[];
  weapons: Weapon[];
};

const Armory = ({ artVersions, weapons }: ArmoryProps) => {
  const onBuyEquipment = (x: Weapon) => {
    //check status
    console.log(x);
  };

  const onBuyArtEvent = (x: ArtVersion) => {
    console.log(x);
  };

  return (
    <div className="panel flex max-w-[65%] flex-wrap items-baseline rounded-md p-8">
      <div className="flex flex-wrap gap-x-5 gap-y-3">
        <h2 className="block w-full text-xl">
          Select your alternative version
        </h2>
        {artVersions &&
          artVersions.map((x) => (
            <div key={x.name} className=" w-[25%] text-center">
              <h3
                className={classNames("pb-3", { "text-[#BFA97F]": x.equiped })}
              >
                {x.name}
              </h3>
              <div
                className={classnames(
                  "clip-wrap aspect-square p-1.5 hover:scale-105",
                  "hover:shadow-md hover:shadow-slate-600",
                  {
                    "bg-[#6F5B38] bg-gradient-to-t from-[#6E5A37] to-[#BEA97E]":
                      x.equiped,
                  },
                  { "bg-gray-600": !x.equiped && x.revealed },
                  { "bg-green-400": !x.revealed }
                )}
              >
                <div
                  className={classnames("clip-css relative h-full text-center")}
                >
                  <Image
                    className=""
                    // className="rounded-3xl border-solid clip-css"
                    src={x.image == "" ? NftHidden : x.image}
                    alt="Picture of the author"
                    width={900}
                    height={900}
                  ></Image>

                  {!x.revealed && (
                    <div className="absolute top-4 w-full text-green-400">
                      {x.price}
                    </div>
                  )}
                  <div className="absolute bottom-0 h-3/4 w-full bg-gradient-to-t from-black to-transparent "></div>
                  <label
                    htmlFor={x.name}
                    className="absolute top-0 left-0 h-full w-full cursor-pointer"
                  ></label>
                </div>
              </div>
              <div className="relative -top-5 z-50 w-full items-center">
                <button
                  onClick={() => {
                    onBuyArtEvent(x);
                  }}
                  className={classNames(
                    "hover:shadow-lg hover:shadow-slate-400",
                    "rounded-full px-3 py-1",
                    { "bg-[#6F5B38]": x.equiped },
                    { "bg-gray-600": !x.equiped && x.revealed },
                    { "bg-green-400 text-black": !x.revealed }
                  )}
                >
                  {x.equiped
                    ? "Used"
                    : !x.equiped && x.revealed
                    ? "Select"
                    : "Reveal"}
                </button>
              </div>
              <Modal className="w-fit" triggerId={x.name}>
                <Image
                  className="rounded-3xl border-solid"
                  src={x.image == "" ? NftHidden : x.image}
                  alt={x.name}
                  width={700}
                  height={800}
                ></Image>
              </Modal>
            </div>
          ))}
      </div>

      <div className="flex w-full flex-wrap">
        <h2 className="mb-3 block w-full text-xl">
          Select your alternative version
        </h2>
        {weapons &&
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
                <Modal className="w-full" triggerId={name}>
                  <Image
                    className="rounded-3xl border-solid"
                    src={image}
                    alt={name}
                    width={700}
                    height={800}
                  ></Image>
                </Modal>
              </div>
            );
          })}
        <div className="ml-5 grow cursor-pointer hover:shadow-sm">
          <Image
            src={ComingSoonImg}
            alt="Coming soon"
            className="object-fill"
          ></Image>
        </div>
      </div>
    </div>
  );
};

export default Profile;
