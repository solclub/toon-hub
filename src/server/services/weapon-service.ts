import type { Types } from "mongoose";
import type {
  ItemMetadata,
  Slot,
  WarriorEquipment,
} from "server/database/models/equipped-weapon.model";
import {
  default as WarriorEquipmentModel,
  default as warriorEquipmentModel,
} from "server/database/models/equipped-weapon.model";
import type { RudeNFT } from "server/database/models/nft.model";
import type { RollSlotTimes } from "server/database/models/settings.model";
import type { Weapon, WeaponRarity } from "server/database/models/weapon.model";
import WeaponModel from "server/database/models/weapon.model";
import ConfigurationService from "./configuration-service";
import { getUserNFTbyMint } from "./nfts-service";
import paymentService from "./payment-service";

export interface RandomWeaponRequest {
  mintAddress: string;
  wallet: string;
  verifiedOwner: string;
  serializedTx: string;
  nftType: string;
  slot: SlotNumber;
}

export type SlotNumber = 1 | 2 | 3 | 4;
type RarityTable = Record<SlotNumber, Record<WeaponRarity, number>>;
type DbWeapon = Weapon & {
  _id: Types.ObjectId;
};

export const confirmAndSave = async (req: RandomWeaponRequest) => {
  const result = paymentService.proccessPayment<WarriorEquipment>(
    {
      mint: req.mintAddress,
      serializedTx: req.serializedTx,
      wallet: req.wallet,
      service: "WEAPON_SLOT_" + req.slot,
    },
    async (txId, verifiedOwner) => {
      return await saveWeaponEquipped({ ...req, verifiedOwner });
    }
  );

  return result;
};

export const saveWeaponEquipped = async (req: RandomWeaponRequest): Promise<WarriorEquipment> => {
  if (!req) throw new Error("req is required");
  const nft = await getUserNFTbyMint(req.wallet, req.mintAddress);
  const rarityTable = await getRarityTable();
  const rolledRarity = rollRarity(rarityTable[req.slot]);
  const rolledWeapon = await getRolledWeapon(req.slot, rolledRarity);
  const filters = { warriorId: req.mintAddress, ownerId: req.wallet };
  const existingEquipment = await WarriorEquipmentModel().findOne(filters).lean();

  if (rolledWeapon) {
    if (existingEquipment) {
      return updateExistingEquipment(filters, existingEquipment, rolledWeapon, req.slot, nft);
    } else {
      return createNewEquipment(filters, rolledWeapon, nft);
    }
  }

  throw "Error while roll a weapon";
};

const updateExistingEquipment = async (
  filters: { warriorId: string; ownerId: string },
  existingEquipment: WarriorEquipment,
  rolledWeapon: DbWeapon,
  slot: number,
  nft: RudeNFT
): Promise<WarriorEquipment> => {
  const updatedSlots = updateSlots(existingEquipment.slots, slot, rolledWeapon);
  const warriorWeaponsPower = calculateWarriorWeaponsPower(updatedSlots);
  const warriorTotalPower = calculateWarriorTotalPower(nft?.power ?? 0, warriorWeaponsPower);

  const newItemData: WarriorEquipment = {
    ...filters,
    slots: updatedSlots,
    warriorWeaponsPower,
    warriorTotalPower,
  };

  const updatedItem = await WarriorEquipmentModel().findOneAndUpdate(filters, newItemData, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  return updatedItem as WarriorEquipment;
};

const createNewEquipment = async (
  filters: { warriorId: string; ownerId: string },
  rolledWeapon: DbWeapon,
  nft: RudeNFT
): Promise<WarriorEquipment> => {
  const { warriorWeaponsPower, warriorTotalPower } = calculateFirstTimeValues(
    rolledWeapon,
    nft.power ?? 0
  );

  const newItemData: WarriorEquipment = {
    ...filters,
    slots: [
      {
        status: "unlocked",
        itemMetadata: {
          ...(rolledWeapon as ItemMetadata),
          computedPowerValue: warriorWeaponsPower,
        },
        updatedAt: new Date(),
        itemId: rolledWeapon?._id.toString(),
      },
    ],
    warriorWeaponsPower,
    warriorTotalPower,
  };

  const savedItem = await WarriorEquipmentModel().create(newItemData);
  return savedItem.toObject<WarriorEquipment>();
};

const getRolledWeapon = async (slot: number, rolledRarity: string): Promise<DbWeapon | null> => {
  const weapon = await WeaponModel().findOne({ slotNumber: slot, rarity: rolledRarity }).lean();
  return weapon;
};

const updateSlots = (slots: Slot[], slotNumber: number, rolledWeapon: DbWeapon) => {
  const updatedSlots = slots.map((dbSlot) =>
    dbSlot.itemMetadata?.slotNumber === slotNumber
      ? ({
          status: "unlocked",
          itemId: rolledWeapon._id.toString(),
          itemMetadata: rolledWeapon as ItemMetadata,
          updatedAt: new Date(),
        } as Slot)
      : dbSlot
  );

  const existingSlotNumbers = updatedSlots.map(
    (existingSlot) => existingSlot.itemMetadata?.slotNumber
  );

  if (!existingSlotNumbers.includes(slotNumber)) {
    updatedSlots.push({
      status: "unlocked",
      itemId: rolledWeapon?._id.toString(),
      itemMetadata: rolledWeapon as ItemMetadata,
      updatedAt: new Date(),
    });
  }
  return updatedSlots;
};

const calculateWarriorWeaponsPower = (slots: Slot[]): number => {
  let warriorWeaponsPower = 0;
  const fixedSlots = slots.filter((s) => s.itemMetadata?.powerType === "fixed");
  const multiplierSlots = slots.filter((s) => s.itemMetadata?.powerType === "multiplier");

  const fixedWeaponPowerSum = fixedSlots.reduce(
    (total, s) => total + (s.itemMetadata?.powerValue ?? 0),
    0
  );

  const multiplierWeaponPowerSum = multiplierSlots.reduce(
    (total, s) => total + (s.itemMetadata?.powerValue ?? 0),
    0
  );

  for (const slot of fixedSlots) {
    if (slot.itemMetadata) {
      slot.itemMetadata.computedPowerValue = slot.itemMetadata.powerValue ?? 0;
    } else {
      throw "slot.itemMetadata cannot be null";
    }
  }

  for (const slot of multiplierSlots) {
    if (slot.itemMetadata) {
      const multiplier = slot.itemMetadata.powerValue ?? 1;
      const computedValue = Math.round(fixedWeaponPowerSum * multiplier * 100) / 100;
      slot.itemMetadata.computedPowerValue = computedValue;
    } else {
      throw "slot.itemMetadata cannot be null";
    }
  }
  warriorWeaponsPower = fixedWeaponPowerSum * (1 + (multiplierWeaponPowerSum * 100) / 100);
  return warriorWeaponsPower;
};

const calculateWarriorTotalPower = (nftPower: number, warriorWeaponsPower: number) => {
  return nftPower + warriorWeaponsPower;
};

const calculateFirstTimeValues = (rolledWeapon: DbWeapon, nftPower: number) => {
  const warriorWeaponsPower = rolledWeapon.powerType === "fixed" ? rolledWeapon.powerValue : 0;
  const warriorTotalPower = nftPower + (warriorWeaponsPower ?? 0);
  return { warriorWeaponsPower, warriorTotalPower };
};

export const getWeaponsEquipped = async (mint: string, owner: string) => {
  const defaultSlots: Slot[] = [
    {
      status: "locked",
      itemMetadata: { slotNumber: 1, name: "Slot 1" },
    },
    {
      status: "locked",
      itemMetadata: { slotNumber: 2, name: "Slot 2" },
    },
    {
      status: "locked",
      itemMetadata: { slotNumber: 3, name: "Slot 3" },
    },
    {
      status: "locked",
      itemMetadata: { slotNumber: 4, name: "Slot 4" },
    },
  ];

  const equippedWeapons = await warriorEquipmentModel()
    .findOne({
      warriorId: mint,
      ownerId: owner,
    })
    .lean();

  const currentSlots: Slot[] = equippedWeapons?.slots || [];
  const mergedSlots: Slot[] = await Promise.all(
    defaultSlots.map(async (defaultSlot) => {
      const existingSlot = currentSlots?.find(
        (slot) => slot?.itemMetadata?.slotNumber === defaultSlot?.itemMetadata?.slotNumber
      );
      return existingSlot || defaultSlot;
    })
  );

  return { ...equippedWeapons, slots: mergedSlots } as WarriorEquipment;
};

const rollRarity = (slotProbabilities: Record<WeaponRarity, number>): WeaponRarity => {
  const rarities = Object.keys(slotProbabilities) as WeaponRarity[];
  const probabilities = Object.values(slotProbabilities) as number[]; // Type assertion

  if (!rarities.length || !probabilities.length) {
    throw "No defined rarities";
  }

  const totalProbability = probabilities.reduce((sum, prob) => sum + prob, 0);

  const randomValue = Math.random() * totalProbability;

  let accumulatedProbability = 0;
  let rolledRarity = rarities[rarities.length - 1] ?? "NONE";

  for (const [i, rarity] of rarities.entries()) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accumulatedProbability += probabilities[i]!;
    if (randomValue <= accumulatedProbability) {
      rolledRarity = rarity;
      break;
    }
  }

  return rolledRarity;
};

const getRarityTable = async (): Promise<RarityTable> => {
  const weapons: Weapon[] = await WeaponModel().find().lean();

  const rarityPerSlotTable: RarityTable = {
    1: { NONE: 0, COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0, MYTHIC: 0, SECRET: 0 },
    2: { NONE: 0, COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0, MYTHIC: 0, SECRET: 0 },
    3: { NONE: 0, COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0, MYTHIC: 0, SECRET: 0 },
    4: { NONE: 0, COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0, MYTHIC: 0, SECRET: 0 },
  };

  weapons.forEach((weapon) => {
    const { slotNumber, rarity, dropRate } = weapon;
    if (slotNumber <= 4 && rarity) {
      const slot = slotNumber as SlotNumber;
      rarityPerSlotTable[slot][rarity] = dropRate;
    } else {
      throw "invalid slot number";
    }
  });

  return rarityPerSlotTable;
};

const getSlotRollTimes = async (): Promise<number[] | null> => {
  const defaultTimes = [1, 86400, 172800, 43200];
  const configService = new ConfigurationService();
  const rollSettings = await configService.getConfigByName<RollSlotTimes>("RollSlotTimes");
  if (rollSettings) {
    const orderKeys = Object.keys(rollSettings).map(Number);
    orderKeys.sort((a, b) => a - b);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const resultArray = orderKeys.map((key) => rollSettings[key] ?? defaultTimes[key]!);
    return resultArray;
  }
  return null;
};

const service = {
  confirmAndSave,
  saveWeaponEquipped,
  getWeaponsEquipped,
  getSlotRollTimes,
};

export default service;
